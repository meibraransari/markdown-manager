import os
import aiofiles
import shutil
from pathlib import Path
from typing import List
from fastapi import HTTPException
from app.config import settings
from app.models.schemas import FileNode, FileType

class FilesystemService:
    def __init__(self):
        self.root = settings.absolute_markdown_root
        if not self.root.exists():
            self.root.mkdir(parents=True, exist_ok=True)

    def _resolve_and_validate_path(self, relative_path: str) -> Path:
        """
        Resolves a relative path against the mounted root and ensures it does not escape.
        """
        # Strip leading slashes to prevent absolute path interpretation
        clean_rel_path = relative_path.lstrip("/")
        
        try:
            target_path = (self.root / clean_rel_path).resolve()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid path")

        # Ensure the target path is still within the root directory
        try:
            target_path.relative_to(self.root)
        except ValueError:
            raise HTTPException(status_code=403, detail="Path traversal detected. Access denied.")
            
        return target_path
        
    def _to_relative_path(self, absolute_path: Path) -> str:
        """Converts an absolute path back to a path relative to root"""
        try:
            rel = absolute_path.relative_to(self.root)
            return str(rel).replace("\\", "/")
        except ValueError:
            return ""

    def get_file_tree(self, max_depth: int = 5, show_hidden: bool = False) -> List[FileNode]:
        return self._build_tree(self.root, current_depth=0, max_depth=max_depth, show_hidden=show_hidden)

    def _build_tree(self, path: Path, current_depth: int, max_depth: int, show_hidden: bool) -> List[FileNode]:
        nodes = []
        if current_depth > max_depth:
            return nodes
            
        try:
            for item in sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                # Skip hidden files/dirs (like .git) if not show_hidden
                if not show_hidden and item.name.startswith("."):
                    continue
                    
                rel_path = self._to_relative_path(item)
                
                if item.is_dir():
                    children = self._build_tree(item, current_depth + 1, max_depth, show_hidden)
                    nodes.append(FileNode(
                        name=item.name,
                        path=rel_path,
                        type=FileType.DIRECTORY,
                        children=children
                    ))
                else:
                    # Optional: filter by extensions here if needed
                    stat = item.stat()
                    nodes.append(FileNode(
                        name=item.name,
                        path=rel_path,
                        type=FileType.FILE,
                        size=stat.st_size,
                        last_modified=stat.st_mtime
                    ))
        except PermissionError:
            pass # Skip directories we can't read
            
        return nodes

    async def read_file(self, relative_path: str) -> tuple[str, float]:
        path = self._resolve_and_validate_path(relative_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        if not path.is_file():
            raise HTTPException(status_code=400, detail="Path is not a file")
            
        # Optional: check file size
        stat = path.stat()
        if stat.st_size > settings.max_file_size_mb * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large")

        async with aiofiles.open(path, mode='r', encoding='utf-8') as f:
            content = await f.read()
            
        return content, stat.st_mtime

    async def write_file(self, relative_path: str, content: str) -> float:
        path = self._resolve_and_validate_path(relative_path)
        if not path.parent.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            
        async with aiofiles.open(path, mode='w', encoding='utf-8') as f:
            await f.write(content)
            
        return path.stat().st_mtime
        
    def create_item(self, relative_path: str, is_directory: bool = False, content: str = ""):
        path = self._resolve_and_validate_path(relative_path)
        if path.exists():
            raise HTTPException(status_code=409, detail="File or directory already exists")
            
        if is_directory:
            path.mkdir(parents=True, exist_ok=True)
        else:
            if not path.parent.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
                
    def rename_item(self, old_relative_path: str, new_relative_path: str):
        old_path = self._resolve_and_validate_path(old_relative_path)
        new_path = self._resolve_and_validate_path(new_relative_path)
        
        if not old_path.exists():
            raise HTTPException(status_code=404, detail="Source not found")
        if new_path.exists():
            raise HTTPException(status_code=409, detail="Destination already exists")
            
        old_path.rename(new_path)
        
    def delete_item(self, relative_path: str):
        path = self._resolve_and_validate_path(relative_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="Not found")
            
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()

fs_service = FilesystemService()
