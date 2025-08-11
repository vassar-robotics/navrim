from fastapi import APIRouter
from loguru import logger

from navrim.protocol import NavrimServiceResponse, NoData
from navrim.protocol.request import TokenRequest
from navrim.protocol.response import GetThirdPartyTokensResponse, GetTokenResponse, VerifyTokenResponse
from navrim.util import get_home_app_path

router = APIRouter(tags=["configuration"])


@router.post("/config/token/third-party/get")
async def get_third_party_tokens() -> NavrimServiceResponse[GetThirdPartyTokensResponse]:
    app_home = get_home_app_path()
    tokens = {"huggingface": "", "openai": "", "wandb": ""}
    for token_file in tokens.keys():
        token_file_path = app_home / "tokens" / f"{token_file}.token"
        if token_file_path.exists():
            try:
                tokens[token_file] = token_file_path.read_text().strip()
            except Exception as e:
                logger.error(f"Failed to read token file {token_file_path}: {e}")
    return NavrimServiceResponse.success(GetThirdPartyTokensResponse(**tokens))


@router.post("/config/token/huggingface/get")
async def get_huggingface_token() -> NavrimServiceResponse[GetTokenResponse]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "huggingface.token"
    try:
        token_file.parent.mkdir(parents=True, exist_ok=True)
        token = token_file.read_text().strip()
    except Exception:
        token = ""
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/huggingface/update")
async def update_huggingface_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "huggingface.token"
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(request.token)
    token_file.chmod(0o600)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/huggingface/delete")
async def delete_huggingface_token() -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "huggingface.token"
    token_file.unlink(missing_ok=True)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/huggingface/verify")
async def verify_huggingface_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))


@router.post("/config/token/openai/get")
async def get_openai_token() -> NavrimServiceResponse[GetTokenResponse]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "openai.token"
    try:
        token_file.parent.mkdir(parents=True, exist_ok=True)
        token = token_file.read_text().strip()
    except Exception:
        token = ""
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/openai/update")
async def update_openai_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "openai.token"
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(request.token)
    token_file.chmod(0o600)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/openai/delete")
async def delete_openai_token() -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "openai.token"
    token_file.unlink(missing_ok=True)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/openai/verify")
async def verify_openai_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))


@router.post("/config/token/wandb/get")
async def get_wandb_token() -> NavrimServiceResponse[GetTokenResponse]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "wandb.token"
    try:
        token_file.parent.mkdir(parents=True, exist_ok=True)
        token = token_file.read_text().strip()
    except Exception:
        token = ""
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/wandb/update")
async def update_wandb_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "wandb.token"
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(request.token)
    token_file.chmod(0o600)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/wandb/delete")
async def delete_wandb_token() -> NavrimServiceResponse[NoData]:
    app_home = get_home_app_path()
    token_file = app_home / "tokens" / "wandb.token"
    token_file.unlink(missing_ok=True)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/wandb/verify")
async def verify_wandb_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))
