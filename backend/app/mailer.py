"""Outgoing email. Sends over SMTP when SMTP_HOST is set; otherwise prints to the
console, so password reset links still work in local development."""
from email.message import EmailMessage
import smtplib

from app.deps import setting

def send(to: str, subject: str, body: str) -> None:
    host = setting("SMTP_HOST")
    if not host:
        print(f"[mail] SMTP_HOST not set; would send to {to}: {subject}\n{body}", flush=True)
        return
    msg = EmailMessage()
    msg["From"] = setting("SMTP_FROM", "Decaffeinate <no-reply@localhost>")
    msg["To"], msg["Subject"] = to, subject
    msg.set_content(body)
    port = int(setting("SMTP_PORT", "587"))
    # 465 is implicit TLS; anything else upgrades with STARTTLS.
    with (smtplib.SMTP_SSL(host, port, timeout=10) if port == 465 else smtplib.SMTP(host, port, timeout=10)) as smtp:
        if port != 465:
            smtp.starttls()
        if setting("SMTP_USER"):
            smtp.login(setting("SMTP_USER"), setting("SMTP_PASSWORD"))
        smtp.send_message(msg)

def send_reset_link(to: str, link: str) -> None:
    try:
        send(to, "Reset your Decaffeinate password",
             f"Someone asked to reset the password for this email.\n\n"
             f"Open this link within 30 minutes to choose a new one:\n{link}\n\n"
             f"If it wasn't you, ignore this email; your password hasn't changed.")
    except Exception as error:   # never surface delivery problems to the requester
        print(f"[mail] could not send reset email: {error}", flush=True)
