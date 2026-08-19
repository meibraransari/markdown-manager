from fastapi import APIRouter, HTTPException, Path, File, UploadFile
from typing import List
from app.services.filesystem import fs_service
from app.models.schemas import (
    FileNode, 
    FileContent, 
    SaveFileRequest, 
    RenameRequest, 
    CreateRequest
)
import urllib.parse
from datetime import datetime

router = APIRouter()

@router.post("/daily")
async def create_daily_note(request: dict):
    template_folder = request.get("templateFolder", "Templates")
    today = datetime.now().strftime("%Y-%m-%d")
    daily_folder = "Journals"
    daily_path = f"{daily_folder}/{today}.md"
    template_path = f"{template_folder}/Daily.md"

    # Ensure Journals folder exists
    try:
        fs_service.create_item(daily_folder, is_directory=True)
    except Exception:
        pass # Already exists

    try:
        # Check if daily note exists
        await fs_service.read_file(daily_path)
    except HTTPException:
        # File doesn't exist, create it
        content = f"---\ndate: {today}\n---\n\n# {today}\n\n"
        # Try to load template
        try:
            template_content, _ = await fs_service.read_file(template_path)
            content = template_content.replace("{{date}}", today)
        except Exception:
            pass # No template found
            
        await fs_service.write_file(daily_path, content)

    return {"path": daily_path}

@router.get("/tree", response_model=List[FileNode])
def get_file_tree(show_hidden: bool = False):
    return fs_service.get_file_tree(show_hidden=show_hidden)

@router.get("/files/{path:path}", response_model=FileContent)
async def get_file(path: str = Path(...)):
    # path may be URL encoded
    decoded_path = urllib.parse.unquote(path)
    content, last_modified = await fs_service.read_file(decoded_path)
    return FileContent(content=content, last_modified=last_modified)

@router.put("/files/{path:path}")
async def save_file(request: SaveFileRequest, path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    last_modified = await fs_service.write_file(decoded_path, request.content)
    return {"message": "Saved successfully", "last_modified": last_modified}

@router.post("/files/{path:path}")
def create_item(request: CreateRequest, path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    fs_service.create_item(decoded_path, is_directory=request.is_directory, content=request.content)
    return {"message": "Created successfully"}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    file_bytes = await file.read()
    path = await fs_service.save_asset(file.filename, file_bytes)
    return {"path": path}

@router.post("/import")
async def import_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    file_bytes = await file.read()
    path = await fs_service.import_file(file.filename, file_bytes)
    return {"path": path}

@router.delete("/files/{path:path}")
def delete_item(path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    fs_service.delete_item(decoded_path)
    return {"message": "Deleted successfully"}

@router.patch("/files/{path:path}/rename")
def rename_item(request: RenameRequest, path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    fs_service.rename_item(decoded_path, request.new_path)
    return {"message": "Renamed successfully"}
