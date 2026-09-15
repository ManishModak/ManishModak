#!/usr/bin/env python3
"""
Excalidraw Diagram Generator for explorable-systems skill.
Produces valid, production-tested Excalidraw JSON files with:
- Automatic word-wrapping preserving bullet indentation
- Dynamic container height calculation preventing text overflow
- Strict two-way arrow bindings (reciprocal boundElements on containers)
- Color palettes and section hierarchies for software architecture, game systems, and ML/data maps.
"""

import json
import uuid
import sys
from typing import List, Dict, Any, Optional

def uid() -> str:
    return uuid.uuid4().hex[:12]

def wrap_text(text: str, max_chars: int = 50) -> List[str]:
    """Wraps text preserving leading bullet points and indentations."""
    words = text.split(" ")
    lines = []
    current_line = ""
    
    # Check if bullet exists
    indent = "   " if text.strip().startswith(("•", "-", "*")) else ""
    
    for word in words:
        if not current_line:
            current_line = word
        elif len(current_line) + len(word) + 1 <= max_chars:
            current_line += " " + word
        else:
            lines.append(current_line)
            current_line = indent + word
    if current_line:
        lines.append(current_line)
    return lines

class ExcalidrawBuilder:
    def __init__(self):
        self.elements: List[Dict[str, Any]] = []
        self.element_map: Dict[str, Dict[str, Any]] = {}
        self.arrows: List[Dict[str, Any]] = []

    def add_element(self, el: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in el:
            el["id"] = uid()
        if "boundElements" not in el:
            el["boundElements"] = []
        self.elements.append(el)
        self.element_map[el["id"]] = el
        return el

    def add_rectangle(self, x: float, y: float, w: float, h: float, 
                      bg: str = "#ffffff", stroke: str = "#1e1e1e", 
                      roughness: int = 1, stroke_width: int = 2,
                      roundness: Optional[Dict] = None, el_id: Optional[str] = None) -> Dict[str, Any]:
        el = {
            "id": el_id or uid(),
            "type": "rectangle",
            "x": x, "y": y, "width": w, "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": roughness,
            "opacity": 100,
            "roundness": roundness or {"type": 3},
            "boundElements": []
        }
        return self.add_element(el)

    def add_text(self, x: float, y: float, text: str, font_size: int = 16,
                 color: str = "#1e1e1e", font_family: int = 1, text_align: str = "left",
                 el_id: Optional[str] = None) -> Dict[str, Any]:
        lines = text.split("\n")
        line_height = 1.25
        h = len(lines) * font_size * line_height
        approx_w = max(len(l) for l in lines) * (font_size * 0.6)
        el = {
            "id": el_id or uid(),
            "type": "text",
            "x": x, "y": y, "width": approx_w, "height": h,
            "angle": 0,
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fontSize": font_size,
            "fontFamily": font_family,
            "text": text,
            "textAlign": text_align,
            "verticalAlign": "top",
            "opacity": 100,
            "boundElements": []
        }
        return self.add_element(el)

    def add_card(self, x: float, y: float, w: float, title: str, 
                 bullets: List[str], bg: str = "#ffffff", stroke: str = "#1e1e1e",
                 max_chars: int = 45, badge: Optional[str] = None,
                 card_id: Optional[str] = None) -> Dict[str, Any]:
        """Creates a neatly structured card with header, badge, and word-wrapped bullets."""
        wrapped_lines = []
        for b in bullets:
            wrapped_lines.extend(wrap_text(b, max_chars=max_chars))
        
        line_height = 20
        header_h = 50
        padding = 30
        total_h = header_h + (len(wrapped_lines) * line_height) + padding
        
        c_id = card_id or uid()
        card_box = self.add_rectangle(x, y, w, total_h, bg=bg, stroke=stroke, el_id=c_id)
        
        self.add_text(x + 16, y + 16, title, font_size=18, color=stroke)
        
        if badge:
            badge_w = len(badge) * 8 + 16
            self.add_rectangle(x + w - badge_w - 14, y + 12, badge_w, 24, bg="#ffd43b", stroke="#1e1e1e", stroke_width=1)
            self.add_text(x + w - badge_w - 6, y + 15, badge, font_size=12, color="#1e1e1e")
            
        self.add_element({
            "id": uid(), "type": "line",
            "x": x + 16, "y": y + 46, "width": w - 32, "height": 0,
            "points": [[0, 0], [w - 32, 0]],
            "strokeColor": stroke, "strokeWidth": 1, "strokeStyle": "dashed",
            "roughness": 1, "opacity": 60, "boundElements": []
        })
        
        body_text = "\n".join(wrapped_lines)
        self.add_text(x + 16, y + 58, body_text, font_size=14, color="#333333")
        
        return card_box

    def add_arrow(self, start_id: str, end_id: str, label: Optional[str] = None,
                  stroke: str = "#1e1e1e", stroke_width: int = 2) -> Dict[str, Any]:
        """Creates an arrow with strictly enforced two-way binding."""
        start_el = self.element_map.get(start_id)
        end_el = self.element_map.get(end_id)
        if not start_el or not end_el:
            raise ValueError(f"Cannot bind arrow: start_id {start_id} or end_id {end_id} not found.")
            
        sx = start_el["x"] + start_el["width"]
        sy = start_el["y"] + (start_el["height"] / 2)
        ex = end_el["x"]
        ey = end_el["y"] + (end_el["height"] / 2)
        
        dx = ex - sx
        dy = ey - sy
        
        arrow_id = uid()
        arrow = {
            "id": arrow_id,
            "type": "arrow",
            "x": sx, "y": sy,
            "width": abs(dx), "height": abs(dy),
            "angle": 0,
            "strokeColor": stroke,
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "points": [[0, 0], [dx, dy]],
            "startBinding": {"elementId": start_id, "focus": 0, "gap": 8},
            "endBinding": {"elementId": end_id, "focus": 0, "gap": 8},
            "endArrowhead": "arrow"
        }
        
        start_el["boundElements"].append({"id": arrow_id, "type": "arrow"})
        end_el["boundElements"].append({"id": arrow_id, "type": "arrow"})
        
        self.elements.append(arrow)
        self.element_map[arrow_id] = arrow
        
        if label:
            lx = sx + (dx / 2) - (len(label) * 4)
            ly = sy + (dy / 2) - 20
            self.add_rectangle(lx - 8, ly - 4, len(label) * 8 + 16, 22, bg="#fff9db", stroke="#fab005", stroke_width=1)
            self.add_text(lx, ly, label, font_size=12, color="#1e1e1e")
            
        return arrow

    def export_json(self, filepath: str) -> None:
        data = {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {
                "viewBackgroundColor": "#f7f4ec",
                "gridSize": None
            },
            "files": {}
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Exported {len(self.elements)} elements to {filepath}")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "output.excalidraw"
    b = ExcalidrawBuilder()
    c1 = b.add_card(100, 100, 320, "Client Layer", ["• WebRTC video stream", "• Encrypted user inputs", "• 0 local game binary"], bg="#ffffff", badge="Front-end")
    c2 = b.add_card(500, 100, 320, "Cloud Orchestration", ["• Authoritative simulation", "• ZK-Proof identity validator", "• Instant kill-switch"], bg="#e7f5ff", badge="Core")
    b.add_arrow(c1["id"], c2["id"], label="Encrypted Stream")
    b.export_json(out_path)
