from fastapi import APIRouter

from app.schemas.message import MessageRequest, MessageResponse
from app.services.composer import draft_inquiry_message

router = APIRouter()


@router.post("/message", response_model=MessageResponse)
def create_message(body: MessageRequest) -> MessageResponse:
    message = draft_inquiry_message(
        body.property_name,
        body.property_address,
        body.checkin,
        body.checkout,
        body.guests,
        body.user_name,
    )
    return MessageResponse(message=message)
