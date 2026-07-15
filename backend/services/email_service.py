import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def send_email(to: str, subject: str, html_body: str, inline_image_path: str = None, inline_image_cid: str = None):
    msg = MIMEMultipart("related")
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = to
    msg["Subject"] = subject
    alternative = MIMEMultipart("alternative")
    msg.attach(alternative)
    alternative.attach(MIMEText(html_body, "html"))
    if inline_image_path and inline_image_cid:
        with open(inline_image_path, "rb") as img_file:
            img = MIMEImage(img_file.read())
            img.add_header("Content-ID", f"<{inline_image_cid}>")
            img.add_header("Content-Disposition", "inline")
            msg.attach(img)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        smtp.sendmail(GMAIL_ADDRESS, to, msg.as_string())

def send_registration_confirmation(to: str, full_name: str, event_title: str, event_date: str, qr_url: str, token: str, transaction_id: str = None, registration_fee: float = 0):
    subject = f"You're registered for {event_title}!"
    payment_section = ""
    if registration_fee and registration_fee > 0:
        payment_section = f"""
      <div style="background:#1a1a2e;border:1px solid #4F46E5;border-radius:8px;padding:12px 16px;margin:16px 0;">
        <p style="margin:0;color:#a5b4fc;font-size:13px;font-weight:600;">💳 Payment Confirmed</p>
        <p style="margin:4px 0 0;color:#e2e8f0;font-size:13px;">Amount: <strong>₹{registration_fee:.0f}</strong></p>
        <p style="margin:4px 0 0;color:#e2e8f0;font-size:13px;">Transaction ID: <code style="background:#2d2d2d;padding:2px 6px;border-radius:4px;">{transaction_id}</code></p>
        <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;">Keep this for your records. Your registration is pending verification by the organizer.</p>
      </div>
        """
    html = f"""
    <html><body style="font-family: sans-serif; max-width: 600px; margin: auto; background:#0f0f1a; color:#e2e8f0; padding:24px;">
      <h2 style="color:#a5b4fc;">Hey {full_name}, you're in! 🎉</h2>
      <p>Your registration for <strong>{event_title}</strong> on <strong>{event_date}</strong> is confirmed.</p>
      {payment_section}
      <p>Show this QR code at the event entrance for check-in:</p>
      <img src="{qr_url}" width="200" height="200" alt="QR Code" style="border-radius:8px;" />
      <p style="color: #888; font-size: 12px;">Token: {token}</p>
      <p>See you there!</p>
      <hr style="border-color:#333;"/>
      <p style="color: #aaa; font-size: 11px;">Ahalia Overflow — Your college's tech community</p>
    </body></html>
    """
    send_email(to, subject, html)


def send_certificate_ready(to: str, full_name: str, event_title: str, certificate_url: str):
    subject = f"Your certificate for {event_title} is ready!"
    html = f"""
    <html><body style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Congrats, {full_name}! 🏆</h2>
      <p>Your certificate of participation for <strong>{event_title}</strong> is ready.</p>
      <p><a href="{certificate_url}" style="background:#4F46E5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Download Certificate</a></p>
      <hr/>
      <p style="color: #aaa; font-size: 11px;">Ahalia Overflow</p>
    </body></html>
    """
    send_email(to, subject, html)
