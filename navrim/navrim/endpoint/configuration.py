from fastapi import APIRouter

from navrim.core.token import TokenType, delete_token, get_token, set_token
from navrim.protocol import NavrimServiceResponse, NoData
from navrim.protocol.request import TokenRequest
from navrim.protocol.response import GetThirdPartyTokensResponse, GetTokenResponse, VerifyTokenResponse

router = APIRouter(tags=["configuration"])


@router.post("/config/token/third-party/get")
async def get_third_party_tokens() -> NavrimServiceResponse[GetThirdPartyTokensResponse]:
    tokens = {token_type.value: get_token(token_type) for token_type in TokenType}
    return NavrimServiceResponse.success(GetThirdPartyTokensResponse(**tokens))


@router.post("/config/token/huggingface/get")
async def get_huggingface_token() -> NavrimServiceResponse[GetTokenResponse]:
    token = get_token(TokenType.HUGGINGFACE)
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/huggingface/update")
async def update_huggingface_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    set_token(TokenType.HUGGINGFACE, request.token)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/huggingface/delete")
async def delete_huggingface_token() -> NavrimServiceResponse[NoData]:
    delete_token(TokenType.HUGGINGFACE)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/huggingface/verify")
async def verify_huggingface_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))


@router.post("/config/token/openai/get")
async def get_openai_token() -> NavrimServiceResponse[GetTokenResponse]:
    token = get_token(TokenType.OPENAI)
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/openai/update")
async def update_openai_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    set_token(TokenType.OPENAI, request.token)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/openai/delete")
async def delete_openai_token() -> NavrimServiceResponse[NoData]:
    delete_token(TokenType.OPENAI)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/openai/verify")
async def verify_openai_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))


@router.post("/config/token/wandb/get")
async def get_wandb_token() -> NavrimServiceResponse[GetTokenResponse]:
    token = get_token(TokenType.WANDB)
    return NavrimServiceResponse.success(GetTokenResponse(token=token))


@router.post("/config/token/wandb/update")
async def update_wandb_token(request: TokenRequest) -> NavrimServiceResponse[NoData]:
    set_token(TokenType.WANDB, request.token)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/wandb/delete")
async def delete_wandb_token() -> NavrimServiceResponse[NoData]:
    delete_token(TokenType.WANDB)
    return NavrimServiceResponse.success(NoData())


@router.post("/config/token/wandb/verify")
async def verify_wandb_token(request: TokenRequest) -> NavrimServiceResponse[VerifyTokenResponse]:
    return NavrimServiceResponse.success(VerifyTokenResponse(valid=True, reason="ok"))
