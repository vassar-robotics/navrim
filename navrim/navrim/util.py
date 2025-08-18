import socket
from pathlib import Path


def get_package_path() -> Path:
    return Path(__file__).parent


def get_project_path() -> Path:
    return get_package_path().parent


def get_resources_path() -> Path:
    return get_project_path() / "resources"


def get_home_app_path() -> Path:
    app_home = Path.home() / "navrim"
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home


def get_app_datasets_path() -> Path:
    return get_home_app_path() / "datasets"


def get_local_ip_address() -> str:
    return socket.gethostbyname(socket.gethostname())


def get_local_hostname() -> str:
    return socket.gethostname()
