from .auth import router as router_auth
from .configuration import router as router_configuration
from .status import router as router_status

__all__ = ["router_configuration", "router_status", "router_auth"]
