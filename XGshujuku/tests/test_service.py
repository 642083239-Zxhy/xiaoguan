import sqlite3
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from xg_database import (
    ConsentRequiredError,
    CustomerDataService,
    InvalidMemoryError,
    SensitiveDataError,
)


class CustomerDataServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "test.db"
        self.service = CustomerDataService(self.db_path)
        self.service.initialize()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_anonymous_session_gets_seven_day_expiry(self):
        before = datetime.now(timezone.utc)
        session_id = self.service.create_session("web")
        connection = sqlite3.connect(self.db_path)
        try:
            expiry = connection.execute(
                "SELECT expires_at FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()[0]
        finally:
            connection.close()
        expires_at = datetime.fromisoformat(expiry)
        self.assertGreaterEqual(expires_at, before + timedelta(days=7) - timedelta(seconds=2))

    def test_long_term_memory_requires_consent(self):
        customer_id = self.service.create_customer()
        with self.assertRaises(ConsentRequiredError):
            self.service.put_long_term_memory(
                customer_id, "stable_preference", "静音", confirmed_stable=True
            )

    def test_one_time_expression_is_not_long_term_memory(self):
        customer_id = self.service.create_customer()
        self.service.grant_consent(customer_id)
        with self.assertRaises(InvalidMemoryError):
            self.service.put_long_term_memory(
                customer_id, "stable_preference", "静音", confirmed_stable=False
            )

    def test_context_priority(self):
        customer_id = self.service.create_customer()
        session_id = self.service.create_session("web", customer_id)
        self.service.grant_consent(customer_id)
        self.service.put_long_term_memory(
            customer_id, "stable_preference", "静音", confirmed_stable=True
        )
        self.service.put_session_fact(session_id, "budget", 500, "confirmed")
        context = self.service.resolve_context(
            session_id,
            current_turn={"budget": 300},
            defaults={"budget": 1000, "language": "zh-CN"},
        )
        self.assertEqual(context["budget"]["value"], 300)
        self.assertEqual(context["budget"]["priority"], 400)
        self.assertEqual(context["stable_preference"]["priority"], 200)
        self.assertEqual(context["language"]["priority"], 100)

    def test_unconfirmed_session_fact_is_not_resolved(self):
        session_id = self.service.create_session("web")
        self.service.put_session_fact(session_id, "preference", "粉色", "inferred")
        context = self.service.resolve_context(session_id)
        self.assertNotIn("preference", context)

    def test_sensitive_data_is_rejected(self):
        session_id = self.service.create_session("web")
        with self.assertRaises(SensitiveDataError):
            self.service.put_session_fact(
                session_id, "device", {"password": "secret"}, "confirmed"
            )

    def test_revocation_hides_then_cleanup_deletes_memory(self):
        customer_id = self.service.create_customer()
        session_id = self.service.create_session("web", customer_id)
        self.service.grant_consent(customer_id)
        self.service.put_long_term_memory(
            customer_id, "common_device", "Windows", confirmed_stable=True
        )
        self.service.revoke_consent(customer_id)
        self.assertEqual(self.service.list_long_term_memories(customer_id), [])

        result = self.service.cleanup(datetime.now(timezone.utc) + timedelta(hours=24))
        self.assertEqual(result["deleted_memories"], 1)
        self.assertEqual(result["completed_requests"], 1)

    def test_expired_anonymous_session_is_deleted(self):
        session_id = self.service.create_session("web", retention_days=1)
        self.service.put_session_fact(session_id, "budget", 500, "confirmed")
        result = self.service.cleanup(datetime.now(timezone.utc) + timedelta(days=2))
        self.assertEqual(result["expired_sessions"], 1)
        connection = sqlite3.connect(self.db_path)
        try:
            count = connection.execute(
                "SELECT COUNT(*) FROM session_facts WHERE session_id = ?", (session_id,)
            ).fetchone()[0]
        finally:
            connection.close()
        self.assertEqual(count, 0)

    def test_customer_can_view_session_history(self):
        customer_id = self.service.create_customer()
        session_id = self.service.create_session("web", customer_id)
        self.service.save_summary(
            session_id,
            user_goal={"intent": "购买鼠标"},
            confirmed_info={"budget": 500},
            result={"recommended_sku": "M001"},
            unresolved_questions=["颜色偏好"],
            knowledge_source_version="catalog-2026-08-05",
        )
        history = self.service.list_session_history(customer_id)
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["summary"]["result"]["recommended_sku"], "M001")
        self.assertEqual(history[0]["summary"]["knowledge_source_version"], "catalog-2026-08-05")

    def test_conversation_messages_are_saved_in_order(self):
        session_id = self.service.create_session("web")
        self.service.record_message(session_id, "user", "预算400元", intent="price_inquiry")
        self.service.record_message(session_id, "assistant", "建议选择L1基础版", source="rule-engine")
        messages = self.service.list_messages(session_id)
        self.assertEqual([item["role"] for item in messages], ["user", "assistant"])
        self.assertEqual(messages[0]["intent"], "price_inquiry")

    def test_consent_status_changes_after_grant_and_revoke(self):
        customer_id = self.service.create_customer()
        self.assertFalse(self.service.consent_status(customer_id)["granted"])
        self.service.grant_consent(customer_id)
        self.assertTrue(self.service.consent_status(customer_id)["granted"])
        self.service.revoke_consent(customer_id)
        self.assertFalse(self.service.consent_status(customer_id)["granted"])

    def test_quote_version_is_persisted(self):
        session_id = self.service.create_session("web")
        quote_id = self.service.record_quote(
            session_id,
            "Q-001",
            {"product": "L1", "unit_price": 399, "quantity": 2, "total": 798},
        )
        connection = sqlite3.connect(self.db_path)
        try:
            row = connection.execute(
                "SELECT quote_id, quote_version, amount_json FROM quote_versions WHERE session_id = ?",
                (session_id,),
            ).fetchone()
        finally:
            connection.close()
        self.assertEqual(row[0], quote_id)
        self.assertEqual(row[1], "Q-001")
        self.assertIn('"total":798', row[2])

    def test_analysis_context_contains_authorized_sales_data(self):
        customer_id = self.service.create_customer()
        session_id = self.service.create_session("web", customer_id)
        self.service.record_message(session_id, "user", "预算600元，想买游戏鼠标")
        self.service.put_session_fact(session_id, "budget", 600, "confirmed")
        self.service.grant_consent(customer_id)
        self.service.put_long_term_memory(
            customer_id, "common_device", "Windows", confirmed_stable=True
        )
        self.service.record_recommendation(
            session_id, [{"id": "L1PRO", "name": "L1 Pro"}], "catalog-test"
        )
        self.service.record_quote(session_id, "Q-002", {"unitPrice": 599})
        self.service.save_summary(
            session_id,
            {"intent": "purchase"},
            {"budget": 600},
            {"recommended": "L1 Pro"},
            ["购买渠道"],
            "catalog-test",
        )

        context = self.service.get_analysis_context(session_id)

        self.assertEqual(context["customer_id"], customer_id)
        self.assertEqual(context["conversation_messages"][0]["content"], "预算600元，想买游戏鼠标")
        self.assertEqual(context["session_facts"][0]["fact_type"], "budget")
        self.assertEqual(context["authorized_long_term_memories"][0]["value"], "Windows")
        self.assertEqual(context["recommendation_runs"][0]["result"][0]["id"], "L1PRO")
        self.assertEqual(context["quote_versions"][0]["amount"]["unitPrice"], 599)
        self.assertEqual(context["behavior_data"]["quote_count"], 1)
        self.assertEqual(context["latest_session_summary"]["confirmed_info"]["budget"], 600)
        self.assertEqual(context["behavior_data"]["message_count"], 1)
        self.assertEqual(context["behavior_data"]["messages_truncated"], False)

    def test_analysis_context_reports_truncation_and_keeps_latest_summary(self):
        session_id = self.service.create_session("web")
        for index in range(3):
            self.service.record_message(session_id, "user", f"消息{index + 1}")
        self.service.save_summary(
            session_id, "选购鼠标", {"budget": 400}, "待推荐", ["设备系统"], "catalog-test"
        )

        context = self.service.get_analysis_context(session_id, message_limit=2)

        self.assertEqual(context["behavior_data"]["message_count"], 3)
        self.assertEqual(context["behavior_data"]["message_window_count"], 2)
        self.assertEqual(context["behavior_data"]["messages_truncated"], True)
        self.assertEqual(context["conversation_messages"][0]["content"], "消息2")
        self.assertEqual(context["latest_session_summary"]["user_goal"], "选购鼠标")

    def test_analysis_context_excludes_memory_after_consent_revocation(self):
        customer_id = self.service.create_customer()
        session_id = self.service.create_session("web", customer_id)
        self.service.grant_consent(customer_id)
        self.service.put_long_term_memory(
            customer_id, "stable_preference", "静音", confirmed_stable=True
        )
        self.service.revoke_consent(customer_id)

        context = self.service.get_analysis_context(session_id)

        self.assertEqual(context["authorized_long_term_memories"], [])


if __name__ == "__main__":
    unittest.main()
