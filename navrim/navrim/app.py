import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from loguru import logger

from navrim.endpoint import router_configuration
from navrim.protocol import NavrimServiceResponse, codes

app = FastAPI()
app.include_router(router_configuration)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(traceback.format_exc())
    response = NavrimServiceResponse.error(code=codes.SERVER_UNKNOWN_ERROR, message=str(exc))
    return JSONResponse(content=response.model_dump(), status_code=500)
