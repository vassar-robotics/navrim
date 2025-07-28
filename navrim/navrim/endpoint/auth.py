import time

import gotrue
from fastapi import APIRouter, HTTPException
from gotrue.errors import AuthApiError

from navrim.config import config
from navrim.protocol import NavrimServiceResponse, NoData
from navrim.protocol.request import ResetPasswordRequest, SignInCredentialsRequest, SignUpCredentialsRequest
from navrim.protocol.response import Session, SessionResponse
from navrim.service.supabase_api import get_client
from navrim.util import get_local_ip_address

router = APIRouter(tags=["auth"])


@router.post("/auth/signup")
async def signup(request: SignUpCredentialsRequest) -> NavrimServiceResponse[NoData]:
    # This signup implementation depends on certain supabase authentication settings:
    # 1. Email provider is enabled and requires confirmation for signup.
    # 2. Phone number provider and phone number confirmation are disabled.
    # Make sure to set these in the supabase project settings.
    client = await get_client()
    Session.delete_session()
    try:
        response: gotrue.AuthResponse = await client.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "email_redirect_to": f"http://{get_local_ip_address()}:{config.server_port}/",
                    "data": {
                        "display_name": request.display_name,
                    },
                },
            }
        )
    except AuthApiError as e:  # If user is already registered and confirmed, AuthApiError will be raised.
        # This works only when email confirmation is enabled and phone number confirmation is disabled.
        raise HTTPException(status_code=400, detail=e.message)
    if response.user is not None:
        return NavrimServiceResponse.success(NoData())
    raise HTTPException(status_code=400, detail="Failed to sign up")


@router.post("/auth/signin")
async def signin(request: SignInCredentialsRequest) -> NavrimServiceResponse[SessionResponse]:
    client = await get_client()
    response = await client.auth.sign_in_with_password(
        {
            "email": request.email,
            "password": request.password,
        }
    )
    if response.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if response.user is None or response.user.email is None:
        raise HTTPException(status_code=401, detail="User is not found")
    session = Session(
        user_id=response.user.id,
        user_email=response.user.email,
        email_confirmed=response.user.email_confirmed_at is not None,
        access_token=response.session.access_token,
        refresh_token=response.session.refresh_token,
        expires_at=response.session.expires_in + int(time.time()),
    )
    session.save_session()
    await client.auth.set_session(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
    )
    return NavrimServiceResponse.success(SessionResponse(session=session))


@router.post("/auth/forgot-password")
async def forgot_password(request: ResetPasswordRequest) -> NavrimServiceResponse[NoData]:
    client = await get_client()
    await client.auth.reset_password_for_email(
        {
            "email": request.email,
        }
    )
    return NavrimServiceResponse.success(NoData())
