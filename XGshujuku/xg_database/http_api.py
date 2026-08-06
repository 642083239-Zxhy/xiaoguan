from __future__ import annotations

import argparse
import json
import re
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from .service import (
    ConsentRequiredError,
    CustomerDataService,
    InvalidMemoryError,
    SensitiveDataError,
)


class MemoryApiHandler(BaseHTTPRequestHandler):
    service: CustomerDataService
    server_version = "XGMemory/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[memory-api] {self.address_string()} {format % args}")

    def _send(self, status: int, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 1024 * 1024:
            raise ValueError("请求内容过大")
        if length == 0:
            return {}
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("请求体必须是JSON对象")
        return payload

    def _run(self, callback: Any) -> None:
        try:
            callback()
        except ConsentRequiredError as error:
            self._send(403, {"ok": False, "message": str(error), "code": "CONSENT_REQUIRED"})
        except (SensitiveDataError, InvalidMemoryError, ValueError, json.JSONDecodeError) as error:
            self._send(400, {"ok": False, "message": str(error)})
        except KeyError as error:
            self._send(404, {"ok": False, "message": str(error).strip("'")})
        except sqlite3.IntegrityError as error:
            self._send(409, {"ok": False, "message": f"数据冲突：{error}"})
        except Exception as error:
            self._send(500, {"ok": False, "message": f"本地记忆服务异常：{error}"})

    def do_OPTIONS(self) -> None:
        self._send(204, {})

    def do_GET(self) -> None:
        self._run(self._handle_get)

    def do_POST(self) -> None:
        self._run(self._handle_post)

    def do_DELETE(self) -> None:
        self._run(self._handle_delete)

    def _handle_get(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path == "/health":
            self._send(200, {"ok": True, "service": "xg-memory", "storage": "sqlite"})
            return

        match = re.fullmatch(r"/sessions/([^/]+)/messages", path)
        if match:
            self._send(200, {"ok": True, "messages": self.service.list_messages(match.group(1))})
            return

        match = re.fullmatch(r"/sessions/([^/]+)/context", path)
        if match:
            self._send(200, {"ok": True, "context": self.service.resolve_context(match.group(1))})
            return

        match = re.fullmatch(r"/sessions/([^/]+)/analysis-context", path)
        if match:
            self._send(200, {"ok": True, "context": self.service.get_analysis_context(match.group(1))})
            return

        match = re.fullmatch(r"/customers/([^/]+)/(history|memories|consent)", path)
        if match:
            customer_id, resource = match.groups()
            if resource == "history":
                self._send(200, {"ok": True, "sessions": self.service.list_session_history(customer_id)})
            elif resource == "memories":
                self._send(200, {"ok": True, "memories": self.service.list_long_term_memories(customer_id)})
            else:
                self._send(200, {"ok": True, "consent": self.service.consent_status(customer_id)})
            return

        self._send(404, {"ok": False, "message": "接口不存在"})

    def _handle_post(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        body = self._body()
        if path == "/customers":
            external_reference = body.get("external_reference")
            customer_id = (
                self.service.get_or_create_customer(external_reference)
                if external_reference else self.service.create_customer()
            )
            self._send(201, {"ok": True, "customer_id": customer_id})
            return
        if path == "/sessions":
            session_id = self.service.create_session(
                body.get("channel", "web"), body.get("customer_id"), int(body.get("retention_days", 7))
            )
            self._send(201, {"ok": True, "session_id": session_id})
            return

        match = re.fullmatch(r"/sessions/([^/]+)/(messages|facts|summary|recommendations|quotes)", path)
        if match:
            session_id, resource = match.groups()
            if resource == "messages":
                item_id = self.service.record_message(
                    session_id,
                    body.get("role", "user"),
                    body.get("content", ""),
                    source=body.get("source"),
                    intent=body.get("intent"),
                    metadata=body.get("metadata"),
                )
            elif resource == "facts":
                item_id = self.service.put_session_fact(
                    session_id,
                    body.get("fact_type", ""),
                    body.get("value"),
                    body.get("confirmation_status", "expressed"),
                    body.get("source_message_id"),
                )
            elif resource == "summary":
                item_id = self.service.save_summary(
                    session_id,
                    body.get("user_goal", {}),
                    body.get("confirmed_info", {}),
                    body.get("result", {}),
                    body.get("unresolved_questions", []),
                    body.get("knowledge_source_version", "local-catalog"),
                )
            elif resource == "recommendations":
                item_id = self.service.record_recommendation(
                    session_id,
                    body.get("result", {}),
                    body.get("knowledge_source_version", "local-catalog"),
                )
            else:
                item_id = self.service.record_quote(
                    session_id,
                    body.get("quote_version", ""),
                    body.get("amount", {}),
                    body.get("recommendation_id"),
                )
            self._send(201, {"ok": True, "id": item_id})
            return

        match = re.fullmatch(r"/customers/([^/]+)/(consent|memories)", path)
        if match:
            customer_id, resource = match.groups()
            if resource == "consent":
                item_id = self.service.grant_consent(
                    customer_id,
                    body.get("scope", "long_term_memory"),
                    body.get("consent_version", "v1"),
                )
            else:
                item_id = self.service.put_long_term_memory(
                    customer_id,
                    body.get("memory_type", ""),
                    body.get("value"),
                    confirmed_stable=body.get("confirmed_stable") is True,
                    source_session_id=body.get("source_session_id"),
                )
            self._send(201, {"ok": True, "id": item_id})
            return

        self._send(404, {"ok": False, "message": "接口不存在"})

    def _handle_delete(self) -> None:
        path = urlparse(self.path).path.rstrip("/") or "/"
        match = re.fullmatch(r"/sessions/([^/]+)", path)
        if match:
            self.service.delete_session(match.group(1))
            self._send(200, {"ok": True})
            return
        match = re.fullmatch(r"/customers/([^/]+)/history", path)
        if match:
            count = self.service.clear_session_history(match.group(1))
            self._send(200, {"ok": True, "deleted_sessions": count})
            return
        match = re.fullmatch(r"/customers/([^/]+)/consent", path)
        if match:
            request_id = self.service.revoke_consent(match.group(1))
            self._send(200, {"ok": True, "request_id": request_id})
            return
        match = re.fullmatch(r"/customers/([^/]+)/memories/([^/]+)", path)
        if match:
            request_id = self.service.delete_long_term_memory(*match.groups())
            self._send(200, {"ok": True, "request_id": request_id})
            return
        self._send(404, {"ok": False, "message": "接口不存在"})


def main() -> None:
    parser = argparse.ArgumentParser(description="AI鼠标销售助手本地记忆HTTP服务")
    parser.add_argument("--db", default="data/xg.db")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    service = CustomerDataService(Path(args.db))
    service.initialize()
    MemoryApiHandler.service = service
    server = ThreadingHTTPServer((args.host, args.port), MemoryApiHandler)
    print(f"XG memory API listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
