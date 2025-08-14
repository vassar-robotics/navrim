import asyncio
import threading
import time
from typing import cast

import gotrue
from fastapi import HTTPException
from loguru import logger
from supabase import AsyncClient, AuthRetryableError, create_async_client

from navrim.config import app_tokens
from navrim.protocol.response import Session

_client = cast(AsyncClient, None)  # for linting
_client_lock = threading.Lock()


async def _client_factory() -> AsyncClient:
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                _client = await create_async_client(
                    app_tokens.SUPABASE_URL,
                    app_tokens.SUPABASE_KEY,
                )
    return _client


async def _set_session(
    client: AsyncClient,
    access_token: str,
    refresh_token: str,
    max_retries: int = 3,
    delay: int = 2,
):
    current_delay = delay
    for attempt in range(max_retries):
        try:
            await client.auth.set_session(
                access_token=access_token,
                refresh_token=refresh_token,
            )
            return True
        except AuthRetryableError as e:
            if attempt < max_retries - 1:
                logger.warning(f"Retryable error: {e}. Retrying in {delay} seconds...")
                await asyncio.sleep(current_delay)
                current_delay += delay
            else:
                logger.error(f"Failed after {max_retries} attempts: {e}")
    return False


def is_session_expired(session: Session) -> bool:
    return session.expires_at > time.time() + 60.0


async def get_client():
    client = await _client_factory()
    session = Session.load_session()
    if session is not None:
        if is_session_expired(session):
            try:
                if await _set_session(client, session.access_token, session.refresh_token):
                    new_session = await client.auth.get_session()
                    if new_session is not None:
                        if new_session.user.email is None:
                            raise HTTPException(status_code=401, detail="Email not found")
                        Session(
                            user_id=new_session.user.id,
                            user_email=new_session.user.email,
                            email_confirmed=new_session.user.email_confirmed_at is not None,
                            access_token=new_session.access_token,
                            refresh_token=new_session.refresh_token,
                            expires_at=int(time.time()) + new_session.expires_in,
                        ).save_session()
                        return client
            except Exception as e:
                logger.error(f"Failed to refresh session: {e}")
            Session.delete_session()
        else:  # session is not expired
            if not await _set_session(client, session.access_token, session.refresh_token):
                Session.delete_session()
    return client


async def get_user_session() -> gotrue.Session:
    client = await get_client()
    session = await client.auth.get_session()
    if session is None:
        raise HTTPException(status_code=401, detail="User is not authenticated")
    return session


async def get_client_and_user_session() -> tuple[AsyncClient, gotrue.Session]:
    client = await get_client()
    session = await get_user_session()
    if session is None:
        raise HTTPException(status_code=401, detail="User is not authenticated")
    return client, session
