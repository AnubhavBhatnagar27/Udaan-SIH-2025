import requests
from django.conf import settings

def send_sms(phone_number: str, message: str) -> bool:
    url = "https://www.fast2sms.com/dev/bulk"
    headers = {
        'authorization': settings.FAST2SMS_API_KEY,
        'Content-Type': "application/json",
    }
    payload = {
        "sender_id": "FSTSMS",
        "message": message,
        "language": "english",
        "route": "p",
        "numbers": phone_number,
    }

    response = requests.post(url, json=payload, headers=headers)
    # You can add logging here to debug response.text or response.status_code
    
    if response.status_code == 200:
        data = response.json()
        return data.get('return') == True
    return False
