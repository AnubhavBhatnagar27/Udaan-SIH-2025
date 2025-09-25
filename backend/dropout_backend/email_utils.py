import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)

def send_email(to_email, subject, message):
    try:
        sg = SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
        mail = Mail(
            from_email='udaanbitcrew@gmail.com',  # Must be verified in SendGrid dashboard
            to_emails=to_email,
            subject=subject,
            plain_text_content=message
        )
        response = sg.send(mail)
        logger.info(f"SendGrid response status: {response.status_code}")
        # Successful responses are usually 202 Accepted or 200 OK
        return response.status_code in [200, 202]
    except Exception as e:
        logger.error(f"SendGrid failed to send email: {e}", exc_info=True)
        return False
