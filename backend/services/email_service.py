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

def send_registration_confirmation(to: str, full_name: str, event_title: str, event_date: str, qr_path: str, token: str):
    subject = f"You're registered for {event_title}!"
    html = f"""
    <html><body style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Hey {full_name}, you're in! 🎉</h2>
      <p>Your registration for <strong>{event_title}</strong> on <strong>{event_date}</strong> is confirmed.</p>
      <p>Show this QR code at the event entrance for check-in:</p>
      <img src="cid:qr_code" width="200" height="200" alt="QR Code" />
      <p style="color: #888; font-size: 12px;">Token: {token}</p>
      <p>See you there!</p>
      <hr/>
      <p style="color: #aaa; font-size: 11px;">Ahalia Overflow — Your college's tech community</p>
    </body></html>
    """
    send_email(to, subject, html, inline_image_path=qr_path, inline_image_cid="qr_code")

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
