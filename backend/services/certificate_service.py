import cairosvg
import os
from datetime import datetime

def generate_certificate_png(
    full_name: str,
    event_title: str,
    event_date: str,
    template_name: str,
    output_path: str
) -> str:
    template_path = f"static/templates/{template_name}.svg"
    if not os.path.exists(template_path):
        template_path = "static/templates/default.svg"
    with open(template_path, "r", encoding="utf-8") as f:
        svg_content = f.read()
    svg_content = svg_content.replace("{{NAME}}", full_name)
    svg_content = svg_content.replace("{{EVENT}}", event_title)
    svg_content = svg_content.replace("{{DATE}}", event_date)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cairosvg.svg2png(
        bytestring=svg_content.encode("utf-8"),
        write_to=output_path,
        output_width=1200,
        output_height=850
    )
    return output_path
