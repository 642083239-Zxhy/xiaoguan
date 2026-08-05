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


if __name__ == "__main__":
    unittest.main()
