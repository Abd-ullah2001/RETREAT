from pydantic import BaseModel


class MessageRequest(BaseModel):
    property_name: str
    property_address: str
    checkin: str
    checkout: str
    guests: int
    user_name: str


class MessageResponse(BaseModel):
    message: str
