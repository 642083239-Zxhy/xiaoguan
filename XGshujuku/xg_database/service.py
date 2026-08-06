from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator, Mapping


UTC = timezone.utc
SESSION_FACT_TYPES = {
    "main_intent",
    "budget",
    "device",
    "preference",
    "candidate_skus",
    "excluded_products",
    "unresolved_questions",
}
LONG_TERM_MEMORY_TYPES = {
    "stable_preference",
    "common_device",
    "purchase_history",
    "after_sales_status",
}
SENSITIVE_KEYWORDS = {
    "bank_card",
    "card_number",
    "credit_card",
    "cvv",
    "id_card",
    "identity_number",
    "password",
    "passwd",
    "银行卡",
    "身份证",
    "密码",
}


class SensitiveDataError(ValueError):
    pass


class ConsentRequiredError(PermissionError):
    pass


class InvalidMemoryError(ValueError):
    pass


def _utcnow() -> datetime:
    return datetime.now(UTC)


def _iso(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="seconds")


def _json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _load(value: str) -> Any:
    return json.loads(value)


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _walk_keys(value: Any) -> Iterator[str]:
    if isinstance(value, Mapping):
        for key, child in value.items():
            yield str(key).strip().lower()
            yield from _walk_keys(child)
    elif isinstance(value, (list, tuple)):
        for child in value:
            yield from _walk_keys(child)


def _luhn(candidate: str) -> bool:
    digits = [int(char) for char in candidate]
    checksum = 0
    parity = len(digits) % 2
    for index, digit in enumerate(digits):
        if index % 2 == parity:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def _assert_safe(value: Any) -> None:
    keys = set(_walk_keys(value))
    if keys & SENSITIVE_KEYWORDS:
        raise SensitiveDataError("检测到禁止保存的敏感字段")

    text = _json(value)
    for match in re.findall(r"(?<!\d)\d[\d -]{11,21}\d(?!\d)", text):
        digits = re.sub(r"\D", "", match)
        if 13 <= len(digits) <= 19 and _luhn(digits):
            raise SensitiveDataError("检测到疑似银行卡号")
    if re.search(r"(?<!\d)\d{17}[0-9Xx](?!\d)", text):
        raise SensitiveDataError("检测到疑似身份证号")


class CustomerDataService:
    """SQLite-backed session, consent and customer-memory service."""

    def __init__(self, database_path: str | Path):
        self.database_path = Path(database_path)

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute("PRAGMA busy_timeout = 5000")
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    def initialize(self) -> None:
        schema = Path(__file__).with_name("schema.sql").read_text(encoding="utf-8")
        with self._connection() as connection:
            connection.executescript(schema)

    def create_customer(self, external_reference: str | None = None) -> str:
        customer_id = _id("cus")
        now = _iso(_utcnow())
        external_hash = _hash(external_reference) if external_reference else None
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO customers VALUES (?, ?, 'active', ?, ?)",
                (customer_id, external_hash, now, now),
            )
        return customer_id

    def get_or_create_customer(self, external_reference: str) -> str:
        if not external_reference.strip():
            raise ValueError("external_reference 不能为空")
        external_hash = _hash(external_reference)
        with self._connection() as connection:
            row = connection.execute(
                "SELECT customer_id FROM customers WHERE external_ref_hash = ? AND status = 'active'",
                (external_hash,),
            ).fetchone()
        return str(row["customer_id"]) if row else self.create_customer(external_reference)

    def create_session(
        self,
        channel: str,
        customer_id: str | None = None,
        retention_days: int = 7,
    ) -> str:
        if retention_days < 1:
            raise ValueError("retention_days 必须大于等于 1")
        session_id = _id("ses")
        now = _utcnow()
        expires_at = None if customer_id else _iso(now + timedelta(days=retention_days))
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO sessions VALUES (?, ?, ?, 'active', ?, ?, ?)",
                (session_id, customer_id, channel, expires_at, _iso(now), _iso(now)),
            )
        return session_id

    def record_message(
        self,
        session_id: str,
        role: str,
        content: str,
        *,
        source: str | None = None,
        intent: str | None = None,
        metadata: Any | None = None,
    ) -> str:
        if role not in {"user", "assistant", "system"}:
            raise ValueError("role 无效")
        if not str(content).strip():
            raise ValueError("content 不能为空")
        _assert_safe({"content": content, "metadata": metadata or {}})
        message_id = _id("msg")
        now = _iso(_utcnow())
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO conversation_messages
                    (message_id, session_id, role, content, source, intent, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (message_id, session_id, role, str(content), source, intent,
                 _json(metadata or {}), now),
            )
            connection.execute(
                "UPDATE sessions SET updated_at = ? WHERE session_id = ?",
                (now, session_id),
            )
        return message_id

    def list_messages(self, session_id: str) -> list[dict[str, Any]]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT message_id, role, content, source, intent, metadata_json, created_at
                FROM conversation_messages
                WHERE session_id = ? ORDER BY created_at, rowid
                """,
                (session_id,),
            ).fetchall()
        return [
            {
                "message_id": row["message_id"],
                "role": row["role"],
                "content": row["content"],
                "source": row["source"],
                "intent": row["intent"],
                "metadata": _load(row["metadata_json"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    def consent_status(self, customer_id: str) -> dict[str, Any]:
        with self._connection() as connection:
            consent = self._active_consent(connection, customer_id)
        return {
            "granted": consent is not None,
            "consent_id": consent["consent_id"] if consent else None,
            "consent_version": consent["consent_version"] if consent else None,
            "granted_at": consent["granted_at"] if consent else None,
        }

    def put_session_fact(
        self,
        session_id: str,
        fact_type: str,
        value: Any,
        confirmation_status: str = "expressed",
        source_message_id: str | None = None,
    ) -> str:
        if fact_type not in SESSION_FACT_TYPES:
            raise ValueError(f"不支持的会话事实类型: {fact_type}")
        if confirmation_status not in {"inferred", "expressed", "confirmed"}:
            raise ValueError("confirmation_status 无效")
        _assert_safe(value)
        fact_id = _id("fac")
        now = _iso(_utcnow())
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO session_facts
                    (fact_id, session_id, fact_type, value_json, confirmation_status,
                     source_message_id, active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(session_id, fact_type) DO UPDATE SET
                    value_json = excluded.value_json,
                    confirmation_status = excluded.confirmation_status,
                    source_message_id = excluded.source_message_id,
                    active = 1,
                    updated_at = excluded.updated_at
                """,
                (fact_id, session_id, fact_type, _json(value), confirmation_status,
                 source_message_id, now, now),
            )
            row = connection.execute(
                "SELECT fact_id FROM session_facts WHERE session_id = ? AND fact_type = ?",
                (session_id, fact_type),
            ).fetchone()
        return str(row["fact_id"])

    def save_summary(
        self,
        session_id: str,
        user_goal: Any,
        confirmed_info: Any,
        result: Any,
        unresolved_questions: Any,
        knowledge_source_version: str,
    ) -> str:
        payloads = (user_goal, confirmed_info, result, unresolved_questions)
        for payload in payloads:
            _assert_safe(payload)
        summary_id = _id("sum")
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO session_summaries VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (summary_id, session_id, *(_json(item) for item in payloads),
                 knowledge_source_version, _iso(_utcnow())),
            )
        return summary_id

    def grant_consent(
        self,
        customer_id: str,
        scope: str = "long_term_memory",
        consent_version: str = "v1",
    ) -> str:
        consent_id = _id("con")
        now = _iso(_utcnow())
        with self._connection() as connection:
            connection.execute(
                "UPDATE memory_consents SET status = 'revoked', revoked_at = ? "
                "WHERE customer_id = ? AND scope = ? AND status = 'granted'",
                (now, customer_id, scope),
            )
            connection.execute(
                "INSERT INTO memory_consents VALUES (?, ?, ?, ?, 'granted', ?, NULL)",
                (consent_id, customer_id, scope, consent_version, now),
            )
            self._audit(connection, "consent_granted", "customer", customer_id,
                        {"scope": scope, "consent_version": consent_version})
        return consent_id

    def _active_consent(self, connection: sqlite3.Connection, customer_id: str) -> sqlite3.Row | None:
        return connection.execute(
            """
            SELECT * FROM memory_consents
            WHERE customer_id = ? AND scope = 'long_term_memory' AND status = 'granted'
            ORDER BY granted_at DESC LIMIT 1
            """,
            (customer_id,),
        ).fetchone()

    def put_long_term_memory(
        self,
        customer_id: str,
        memory_type: str,
        value: Any,
        *,
        confirmed_stable: bool,
        source_session_id: str | None = None,
    ) -> str:
        if memory_type not in LONG_TERM_MEMORY_TYPES:
            raise InvalidMemoryError(f"不支持的长期记忆类型: {memory_type}")
        if not confirmed_stable:
            raise InvalidMemoryError("一次性表达不能升级为长期记忆，必须由用户确认其稳定性")
        _assert_safe(value)
        memory_id = _id("mem")
        now = _iso(_utcnow())
        with self._connection() as connection:
            consent = self._active_consent(connection, customer_id)
            if consent is None:
                raise ConsentRequiredError("用户尚未明确授权长期记忆")
            connection.execute(
                """
                INSERT INTO long_term_memories
                    (memory_id, customer_id, memory_type, value_json, consent_id,
                     source_session_id, status, delete_after, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'active', NULL, ?, ?)
                ON CONFLICT(customer_id, memory_type) DO UPDATE SET
                    value_json = excluded.value_json,
                    consent_id = excluded.consent_id,
                    source_session_id = excluded.source_session_id,
                    status = 'active',
                    delete_after = NULL,
                    updated_at = excluded.updated_at
                """,
                (memory_id, customer_id, memory_type, _json(value), consent["consent_id"],
                 source_session_id, now, now),
            )
            row = connection.execute(
                "SELECT memory_id FROM long_term_memories WHERE customer_id = ? AND memory_type = ?",
                (customer_id, memory_type),
            ).fetchone()
            self._audit(connection, "long_term_memory_saved", "memory", str(row["memory_id"]),
                        {"memory_type": memory_type})
        return str(row["memory_id"])

    def resolve_context(
        self,
        session_id: str,
        current_turn: Mapping[str, Any] | None = None,
        defaults: Mapping[str, Any] | None = None,
    ) -> dict[str, dict[str, Any]]:
        current_turn = dict(current_turn or {})
        defaults = dict(defaults or {})
        _assert_safe(current_turn)
        with self._connection() as connection:
            session = connection.execute(
                "SELECT customer_id FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()
            if session is None:
                raise KeyError(f"会话不存在: {session_id}")
            facts = connection.execute(
                """
                SELECT fact_type, value_json, confirmation_status FROM session_facts
                WHERE session_id = ? AND active = 1 AND confirmation_status = 'confirmed'
                """,
                (session_id,),
            ).fetchall()
            memories: list[sqlite3.Row] = []
            if session["customer_id"]:
                memories = connection.execute(
                    """
                    SELECT memory_type, value_json FROM long_term_memories
                    WHERE customer_id = ? AND status = 'active'
                    """,
                    (session["customer_id"],),
                ).fetchall()

        resolved: dict[str, dict[str, Any]] = {
            key: {"value": value, "source": "system_default", "priority": 100}
            for key, value in defaults.items()
        }
        for row in memories:
            resolved[row["memory_type"]] = {
                "value": _load(row["value_json"]),
                "source": "authorized_long_term_memory",
                "priority": 200,
            }
        for row in facts:
            resolved[row["fact_type"]] = {
                "value": _load(row["value_json"]),
                "source": "confirmed_session_fact",
                "priority": 300,
            }
        for key, value in current_turn.items():
            resolved[key] = {"value": value, "source": "explicit_current_turn", "priority": 400}
        return resolved

    def get_analysis_context(self, session_id: str, message_limit: int = 50) -> dict[str, Any]:
        """Return consent-aware session data for purchase-intent analysis."""
        if not 1 <= message_limit <= 100:
            raise ValueError("message_limit 必须在 1 到 100 之间")

        with self._connection() as connection:
            session = connection.execute(
                """
                SELECT session_id, customer_id, channel, status, created_at, updated_at
                FROM sessions WHERE session_id = ?
                """,
                (session_id,),
            ).fetchone()
            if session is None:
                raise KeyError(f"会话不存在: {session_id}")

            message_total = connection.execute(
                "SELECT COUNT(*) FROM conversation_messages WHERE session_id = ?",
                (session_id,),
            ).fetchone()[0]
            messages = connection.execute(
                """
                SELECT message_id, role, content, source, intent, metadata_json, created_at
                FROM (
                    SELECT rowid AS sequence, message_id, role, content, source, intent,
                           metadata_json, created_at
                    FROM conversation_messages
                    WHERE session_id = ?
                    ORDER BY created_at DESC, rowid DESC
                    LIMIT ?
                )
                ORDER BY created_at, sequence
                """,
                (session_id, message_limit),
            ).fetchall()
            facts = connection.execute(
                """
                SELECT fact_id, fact_type, value_json, confirmation_status,
                       source_message_id, created_at, updated_at
                FROM session_facts
                WHERE session_id = ? AND active = 1
                ORDER BY updated_at, rowid
                """,
                (session_id,),
            ).fetchall()
            recommendations = connection.execute(
                """
                SELECT recommendation_id, result_json, knowledge_source_version, created_at
                FROM recommendation_runs
                WHERE session_id = ?
                ORDER BY created_at DESC, rowid DESC
                LIMIT 10
                """,
                (session_id,),
            ).fetchall()
            quotes = connection.execute(
                """
                SELECT quote_id, quote_version, amount_json, recommendation_id, created_at
                FROM quote_versions
                WHERE session_id = ?
                ORDER BY created_at DESC, rowid DESC
                LIMIT 10
                """,
                (session_id,),
            ).fetchall()
            latest_summary = connection.execute(
                """
                SELECT summary_id, user_goal_json, confirmed_info_json, result_json,
                       unresolved_questions_json, knowledge_source_version, created_at
                FROM session_summaries
                WHERE session_id = ?
                ORDER BY created_at DESC, rowid DESC
                LIMIT 1
                """,
                (session_id,),
            ).fetchone()

            memories: list[sqlite3.Row] = []
            if session["customer_id"]:
                memories = connection.execute(
                    """
                    SELECT memory_id, memory_type, value_json, source_session_id,
                           created_at, updated_at
                    FROM long_term_memories
                    WHERE customer_id = ? AND status = 'active'
                      AND consent_id IN (
                          SELECT consent_id FROM memory_consents
                          WHERE customer_id = ? AND scope = 'long_term_memory'
                            AND status = 'granted'
                      )
                    ORDER BY updated_at, rowid
                    """,
                    (session["customer_id"], session["customer_id"]),
                ).fetchall()

        conversation_messages = [
            {
                "message_id": row["message_id"],
                "role": row["role"],
                "content": row["content"],
                "source": row["source"],
                "intent": row["intent"],
                "metadata": _load(row["metadata_json"]),
                "created_at": row["created_at"],
            }
            for row in messages
        ]
        session_facts = [
            {
                "fact_id": row["fact_id"],
                "fact_type": row["fact_type"],
                "value": _load(row["value_json"]),
                "confirmation_status": row["confirmation_status"],
                "source_message_id": row["source_message_id"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            for row in facts
        ]
        authorized_memories = [
            {
                "memory_id": row["memory_id"],
                "memory_type": row["memory_type"],
                "value": _load(row["value_json"]),
                "source_session_id": row["source_session_id"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            for row in memories
        ]
        recommendation_runs = [
            {
                "recommendation_id": row["recommendation_id"],
                "result": _load(row["result_json"]),
                "knowledge_source_version": row["knowledge_source_version"],
                "created_at": row["created_at"],
            }
            for row in recommendations
        ]
        quote_versions = [
            {
                "quote_id": row["quote_id"],
                "quote_version": row["quote_version"],
                "amount": _load(row["amount_json"]),
                "recommendation_id": row["recommendation_id"],
                "created_at": row["created_at"],
            }
            for row in quotes
        ]
        session_summary = None if latest_summary is None else {
            "summary_id": latest_summary["summary_id"],
            "user_goal": _load(latest_summary["user_goal_json"]),
            "confirmed_info": _load(latest_summary["confirmed_info_json"]),
            "result": _load(latest_summary["result_json"]),
            "unresolved_questions": _load(latest_summary["unresolved_questions_json"]),
            "knowledge_source_version": latest_summary["knowledge_source_version"],
            "created_at": latest_summary["created_at"],
        }
        return {
            "customer_id": session["customer_id"],
            "session_id": session["session_id"],
            "last_interaction_at": (
                conversation_messages[-1]["created_at"]
                if conversation_messages else session["updated_at"]
            ),
            "conversation_messages": conversation_messages,
            "session_facts": session_facts,
            "authorized_long_term_memories": authorized_memories,
            "recommendation_runs": recommendation_runs,
            "quote_versions": quote_versions,
            "latest_session_summary": session_summary,
            "behavior_data": {
                "message_count": message_total,
                "message_window_count": len(conversation_messages),
                "message_window_limit": message_limit,
                "messages_truncated": message_total > len(conversation_messages),
                "user_message_count": sum(
                    item["role"] == "user" for item in conversation_messages
                ),
                "recommendation_count": len(recommendation_runs),
                "quote_count": len(quote_versions),
            },
        }

    def record_recommendation(
        self, session_id: str, result: Any, knowledge_source_version: str
    ) -> str:
        _assert_safe(result)
        recommendation_id = _id("rec")
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO recommendation_runs VALUES (?, ?, ?, ?, ?)",
                (recommendation_id, session_id, _json(result), knowledge_source_version, _iso(_utcnow())),
            )
        return recommendation_id

    def record_quote(
        self,
        session_id: str,
        quote_version: str,
        amount: Any,
        recommendation_id: str | None = None,
    ) -> str:
        _assert_safe(amount)
        quote_id = _id("quo")
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO quote_versions VALUES (?, ?, ?, ?, ?, ?)",
                (quote_id, session_id, quote_version, _json(amount), recommendation_id, _iso(_utcnow())),
            )
        return quote_id

    def record_feedback(self, session_id: str, feedback: Any) -> str:
        _assert_safe(feedback)
        feedback_id = _id("fdb")
        with self._connection() as connection:
            connection.execute(
                "INSERT INTO customer_feedback VALUES (?, ?, ?, ?)",
                (feedback_id, session_id, _json(feedback), _iso(_utcnow())),
            )
        return feedback_id

    def revoke_consent(self, customer_id: str) -> str:
        now = _utcnow()
        delete_after = now + timedelta(hours=23)
        request_id = _id("del")
        with self._connection() as connection:
            connection.execute(
                "UPDATE memory_consents SET status = 'revoked', revoked_at = ? "
                "WHERE customer_id = ? AND status = 'granted'",
                (_iso(now), customer_id),
            )
            connection.execute(
                "UPDATE long_term_memories SET status = 'pending_deletion', delete_after = ?, updated_at = ? "
                "WHERE customer_id = ? AND status = 'active'",
                (_iso(delete_after), _iso(now), customer_id),
            )
            connection.execute(
                "INSERT INTO deletion_requests VALUES (?, ?, 'long_term_memory', 'pending', ?, ?, ?, NULL)",
                (request_id, customer_id, _iso(now), _iso(now), _iso(delete_after)),
            )
            self._audit(connection, "consent_revoked", "customer", customer_id,
                        {"scope": "long_term_memory", "business_visibility": "hidden"})
        return request_id

    def list_long_term_memories(self, customer_id: str) -> list[dict[str, Any]]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT memory_id, memory_type, value_json, created_at, updated_at
                FROM long_term_memories
                WHERE customer_id = ? AND status = 'active'
                ORDER BY created_at
                """,
                (customer_id,),
            ).fetchall()
        return [
            {
                "memory_id": row["memory_id"],
                "memory_type": row["memory_type"],
                "value": _load(row["value_json"]),
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            for row in rows
        ]

    def list_session_history(self, customer_id: str) -> list[dict[str, Any]]:
        """Return user-visible session history without exposing internal audit data."""
        with self._connection() as connection:
            sessions = connection.execute(
                """
                SELECT session_id, channel, status, created_at, updated_at
                FROM sessions WHERE customer_id = ? ORDER BY created_at DESC
                """,
                (customer_id,),
            ).fetchall()
            history: list[dict[str, Any]] = []
            for session in sessions:
                summary = connection.execute(
                    """
                    SELECT user_goal_json, confirmed_info_json, result_json,
                           unresolved_questions_json, knowledge_source_version, created_at
                    FROM session_summaries WHERE session_id = ?
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (session["session_id"],),
                ).fetchone()
                item: dict[str, Any] = {
                    "session_id": session["session_id"],
                    "channel": session["channel"],
                    "status": session["status"],
                    "created_at": session["created_at"],
                    "updated_at": session["updated_at"],
                    "summary": None,
                }
                if summary:
                    item["summary"] = {
                        "user_goal": _load(summary["user_goal_json"]),
                        "confirmed_info": _load(summary["confirmed_info_json"]),
                        "result": _load(summary["result_json"]),
                        "unresolved_questions": _load(summary["unresolved_questions_json"]),
                        "knowledge_source_version": summary["knowledge_source_version"],
                        "created_at": summary["created_at"],
                    }
                history.append(item)
        return history

    def delete_session(self, session_id: str) -> None:
        with self._connection() as connection:
            cursor = connection.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            if cursor.rowcount == 0:
                raise KeyError(f"会话不存在: {session_id}")

    def clear_session_history(self, customer_id: str) -> int:
        with self._connection() as connection:
            cursor = connection.execute("DELETE FROM sessions WHERE customer_id = ?", (customer_id,))
        return cursor.rowcount

    def delete_long_term_memory(self, customer_id: str, memory_type: str) -> str:
        now = _utcnow()
        request_id = _id("del")
        with self._connection() as connection:
            cursor = connection.execute(
                """
                UPDATE long_term_memories
                SET status = 'pending_deletion', delete_after = ?, updated_at = ?
                WHERE customer_id = ? AND memory_type = ? AND status = 'active'
                """,
                (_iso(now + timedelta(hours=23)), _iso(now), customer_id, memory_type),
            )
            if cursor.rowcount == 0:
                raise KeyError(f"找不到有效长期记忆: {memory_type}")
            connection.execute(
                "INSERT INTO deletion_requests VALUES (?, ?, ?, 'pending', ?, ?, ?, NULL)",
                (request_id, customer_id, f"memory:{memory_type}", _iso(now), _iso(now),
                 _iso(now + timedelta(hours=23))),
            )
            self._audit(connection, "memory_deletion_requested", "customer", customer_id,
                        {"memory_type": memory_type, "business_visibility": "hidden"})
        return request_id

    def cleanup(self, now: datetime | None = None) -> dict[str, int]:
        now = now or _utcnow()
        now_text = _iso(now)
        with self._connection() as connection:
            expired = connection.execute(
                "SELECT session_id FROM sessions WHERE expires_at IS NOT NULL AND expires_at <= ?",
                (now_text,),
            ).fetchall()
            for row in expired:
                self._audit(connection, "expired_session_deleted", "session", row["session_id"], {})
            connection.execute(
                "DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at <= ?", (now_text,)
            )

            due_requests = connection.execute(
                "SELECT request_id, customer_id, scope FROM deletion_requests "
                "WHERE status = 'pending' AND due_at <= ?",
                (now_text,),
            ).fetchall()
            deleted_memories = 0
            for request in due_requests:
                scope = str(request["scope"])
                if scope == "long_term_memory":
                    cursor = connection.execute(
                        "DELETE FROM long_term_memories WHERE customer_id = ? AND status = 'pending_deletion'",
                        (request["customer_id"],),
                    )
                elif scope.startswith("memory:"):
                    cursor = connection.execute(
                        "DELETE FROM long_term_memories WHERE customer_id = ? AND memory_type = ? "
                        "AND status = 'pending_deletion'",
                        (request["customer_id"], scope.split(":", 1)[1]),
                    )
                else:
                    continue
                deleted_memories += cursor.rowcount
                connection.execute(
                    "UPDATE deletion_requests SET status = 'completed', completed_at = ? WHERE request_id = ?",
                    (now_text, request["request_id"]),
                )
                self._audit(connection, "physical_deletion_completed", "deletion_request",
                            request["request_id"], {"scope": scope})
        return {"expired_sessions": len(expired), "deleted_memories": deleted_memories,
                "completed_requests": len(due_requests)}

    def _audit(
        self,
        connection: sqlite3.Connection,
        action: str,
        target_type: str,
        target_id: str,
        details: Mapping[str, Any],
    ) -> None:
        connection.execute(
            "INSERT INTO privacy_audit_logs VALUES (?, ?, 'system', ?, ?, ?, ?)",
            (_id("aud"), action, target_type, _hash(target_id), _json(dict(details)), _iso(_utcnow())),
        )
