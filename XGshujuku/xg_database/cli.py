from __future__ import annotations

import argparse
import json
from pathlib import Path

from .service import CustomerDataService


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="销冠客户会话与记忆数据库")
    parser.add_argument("--db", default="data/xg.db", help="SQLite 数据库文件路径")
    parser.add_argument("command", choices=("init", "demo", "cleanup"))
    return parser


def main() -> None:
    args = _parser().parse_args()
    service = CustomerDataService(Path(args.db))
    service.initialize()

    if args.command == "init":
        print(json.dumps({"status": "ok", "database": str(Path(args.db).resolve())}, ensure_ascii=False))
        return
    if args.command == "cleanup":
        print(json.dumps(service.cleanup(), ensure_ascii=False))
        return

    customer_id = service.create_customer()
    session_id = service.create_session("web", customer_id)
    service.put_session_fact(session_id, "main_intent", "购买办公鼠标", "confirmed")
    service.put_session_fact(session_id, "budget", {"currency": "CNY", "max": 500}, "confirmed")
    service.grant_consent(customer_id, consent_version="demo-v1")
    service.put_long_term_memory(
        customer_id,
        "common_device",
        {"os": "Windows", "ports": ["USB-A", "Bluetooth"]},
        confirmed_stable=True,
        source_session_id=session_id,
    )
    context = service.resolve_context(
        session_id,
        current_turn={"budget": {"currency": "CNY", "max": 400}},
        defaults={"preferred_connection": "wireless"},
    )
    print(json.dumps({"customer_id": customer_id, "session_id": session_id, "context": context},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
