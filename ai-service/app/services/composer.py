"""WhatsApp inquiry message drafting via NVIDIA NIM."""
from app.services.nim_client import MODEL, get_client

SYSTEM_PROMPT = """You draft short, polite WhatsApp messages from travelers to property hosts.
Rules:
- Maximum 200 words
- No markdown formatting (no bold, no bullets)
- Friendly and professional tone
- Ask about: availability, any additional fees, check-in process
- Sign off with the traveler's name
- Output only the message text, nothing else"""


def draft_inquiry_message(
    property_name: str,
    property_address: str,
    checkin: str,
    checkout: str,
    guests: int,
    user_name: str,
) -> str:
    client = get_client()

    user_prompt = f"""Draft a WhatsApp message to the host of "{property_name}" at {property_address}.
Check-in: {checkin}, Check-out: {checkout}, Guests: {guests}.
Sign off as {user_name}."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=500,
        temperature=0.5,
    )

    return (response.choices[0].message.content or "").strip()
