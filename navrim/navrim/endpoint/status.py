from fastapi import APIRouter

from navrim.config import config
from navrim.protocol import NavrimServiceResponse, NoData
from navrim.protocol.response import GetServerStatusResponse
from navrim.util import get_local_hostname, get_local_ip_address

router = APIRouter(tags=["status"])


@router.post("/status/server/get")
async def get_server_status(_: NoData) -> NavrimServiceResponse[GetServerStatusResponse]:
    return NavrimServiceResponse.success(
        GetServerStatusResponse(
            status="ok",
            ip_address=get_local_ip_address(),
            port=config.server_port,
            hostname=get_local_hostname(),
        )
    )
