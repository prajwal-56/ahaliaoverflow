import qrcode
import os

def generate_qr(token: str, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(token)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    return output_path
