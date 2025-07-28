import uvicorn

from navrim.config import config

if __name__ == "__main__":
    uvicorn.run(
        "navrim.app:app",
        host="127.0.0.1",
        port=config.server_port,
        reload=True,
    )
