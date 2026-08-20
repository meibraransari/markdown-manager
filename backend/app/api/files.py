from fastapi import APIRouter, HTTPException, Path, File, UploadFile, Form
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, Optional
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
import io
import zipfile
import os

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
async def import_file(file: UploadFile = File(...), relativePath: Optional[str] = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    file_bytes = await file.read()
    path = await fs_service.import_file(file.filename, file_bytes, relativePath)
    return {"path": path}

@router.get("/download/{path:path}")
def download_item(path: str = Path(...)):
    decoded_path = urllib.parse.unquote(path)
    file_path = fs_service.root / decoded_path.strip("/")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Not found")
        
    if file_path.is_file():
        return FileResponse(file_path, filename=file_path.name)
    else:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, _, files in os.walk(file_path):
                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, file_path)
                    zip_file.write(full_path, rel_path)
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer, 
            media_type="application/x-zip-compressed", 
            headers={"Content-Disposition": f"attachment; filename={file_path.name}.zip"}
        )

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
