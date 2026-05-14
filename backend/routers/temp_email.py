"""
Temporary Email — real disposable mailboxes via mail.tm public API.

Backend acts as a stateless proxy. Frontend creates an account once and
keeps the returned JWT in browser storage; subsequent calls pass it as a
query string parameter.
"""

import logging
import secrets
import string

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()
log = logging.getLogger(__name__)

MAIL_TM_API = "https://api.mail.tm"
HTTP_TIMEOUT = 10


def _random_local(length: int = 10) -> str:
    chars = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def _random_password(length: int = 16) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


class CreateResponse(BaseModel):
    address: str
    token: str


@router.post("/create", response_model=CreateResponse)
async def create_account():
    """Create new disposable mailbox. Returns address + auth token."""
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            r = await client.get(f"{MAIL_TM_API}/domains")
            r.raise_for_status()
            domains = r.json().get("hydra:member", [])
        except Exception as e:
            log.error("mail.tm domains failed: %s", e)
            raise HTTPException(503, "Temporary email service unavailable")

        active = [d for d in domains if d.get("isActive")]
        if not active:
            raise HTTPException(503, "No active mail domains")
        domain = active[0]["domain"]

        address = ""
        password = ""
        created = False
        for _ in range(3):
            address = f"{_random_local()}@{domain}"
            password = _random_password()
            try:
                r = await client.post(
                    f"{MAIL_TM_API}/accounts",
                    json={"address": address, "password": password},
                )
                if r.status_code == 201:
                    created = True
                    break
            except Exception as e:
                log.error("mail.tm create failed: %s", e)
        if not created:
            raise HTTPException(503, "Could not create mailbox")

        try:
            r = await client.post(
                f"{MAIL_TM_API}/token",
                json={"address": address, "password": password},
            )
            r.raise_for_status()
            token = r.json()["token"]
        except Exception as e:
            log.error("mail.tm token failed: %s", e)
            raise HTTPException(503, "Could not authenticate mailbox")

        return CreateResponse(address=address, token=token)


@router.get("/messages")
async def list_messages(token: str = Query(...)):
    """List inbox messages."""
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            r = await client.get(
                f"{MAIL_TM_API}/messages",
                headers={"Authorization": f"Bearer {token}"},
            )
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(e.response.status_code, "Could not fetch messages")
        except Exception as e:
            log.error("mail.tm list failed: %s", e)
            raise HTTPException(503, "Mail service unavailable")

        data = r.json()

    msgs = [
        {
            "id": m["id"],
            "from": m["from"]["address"],
            "from_name": m["from"].get("name", ""),
            "subject": m["subject"],
            "intro": m.get("intro", ""),
            "created_at": m["createdAt"],
            "seen": m.get("seen", False),
        }
        for m in data.get("hydra:member", [])
    ]
    return {"messages": msgs, "total": len(msgs)}


@router.get("/messages/{msg_id}")
async def get_message(msg_id: str, token: str = Query(...)):
    """Fetch full message body."""
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            r = await client.get(
                f"{MAIL_TM_API}/messages/{msg_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            r.raise_for_status()
        except Exception as e:
            log.error("mail.tm message fetch failed: %s", e)
            raise HTTPException(503, "Could not fetch message")
        m = r.json()

    return {
        "id": m["id"],
        "from": m["from"]["address"],
        "from_name": m["from"].get("name", ""),
        "subject": m["subject"],
        "text": m.get("text", ""),
        "html": m.get("html", []),
        "created_at": m["createdAt"],
    }
