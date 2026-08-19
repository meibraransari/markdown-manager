from fastapi import APIRouter, Path
from typing import Dict, Any
from app.services.parser import parser_service
import urllib.parse

router = APIRouter()

@router.get("/metadata/graph")
def get_graph():
    return parser_service.scan_workspace()["graph"]

@router.get("/metadata/tags")
def get_tags():
    return parser_service.scan_workspace()["tags"]

@router.get("/metadata/backlinks/{path:path}")
def get_backlinks(path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    backlinks = parser_service.scan_workspace()["backlinks"]
    return {"backlinks": backlinks.get(decoded_path, [])}
