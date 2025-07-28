import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from loguru import logger

from navrim.endpoint import router_auth, router_configuration, router_status
from navrim.protocol import NavrimServiceResponse, codes

app = FastAPI()
app.include_router(router_configuration)
app.include_router(router_status)
app.include_router(router_auth)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    logger.error(f"HTTPException: {exc.detail} {exc.status_code}")
    return JSONResponse(content=exc.detail, status_code=exc.status_code)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(traceback.format_exc())
    response = NavrimServiceResponse.error(code=codes.SERVER_UNKNOWN_ERROR, message=str(exc))
    return JSONResponse(content=response.model_dump(), status_code=500)
