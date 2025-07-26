from pydantic import BaseModel

from navrim.protocol.codes import SUCCESS


class NoData(BaseModel):
    pass


class NavrimServiceResponse[T](BaseModel):
    code: int
    message: str
    data: T

    @classmethod
    def success(cls, data: T) -> "NavrimServiceResponse[T]":
        return cls(code=SUCCESS, message="success", data=data)

    @classmethod
    def error(cls, code: int, message: str, data: T = None) -> "NavrimServiceResponse[T]":
        return cls(code=code, message=message, data=data or NoData())
