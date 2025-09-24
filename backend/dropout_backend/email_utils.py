from django.core.mail import send_mail

def send_email(to_email, subject, message):
    try:
        send_mail(
            subject,
            message,
            'udaanbitcrew@gmail.com',  # From email; None means use DEFAULT_FROM_EMAIL
            [to_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False