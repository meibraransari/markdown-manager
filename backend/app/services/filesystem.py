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
                    # If not showing all files, only include directories that have children (or are empty, but typically we just include all non-hidden dirs)
                    if not show_hidden and not children and current_depth > 0:
                        # Optionally, you can omit empty directories if they have no .md files
                        pass
                    nodes.append(FileNode(
                        name=item.name,
                        path=rel_path,
                        type=FileType.DIRECTORY,
                        children=children
                    ))
                else:
                    # Filter by .md extension if not show_hidden
                    if not show_hidden and not item.name.lower().endswith(".md"):
                        continue
                        
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

    async def save_asset(self, filename: str, file_bytes: bytes) -> str:
        assets_dir = self.root / "assets"
        assets_dir.mkdir(parents=True, exist_ok=True)
        import time
        safe_filename = filename.replace(" ", "_").replace("/", "")
        name = f"{int(time.time())}_{safe_filename}"
        file_path = assets_dir / name
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_bytes)
        return f"assets/{name}"

    async def import_file(self, filename: str, file_bytes: bytes, relative_path: str = None) -> str:
        if relative_path:
            safe_path = Path(relative_path.strip("/"))
            if ".." in safe_path.parts:
                raise ValueError("Invalid path")
            file_path = self.root / safe_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            # If file exists, append a number
            counter = 1
            base_name = file_path.stem
            suffix = file_path.suffix
            while file_path.exists():
                file_path = file_path.parent / f"{base_name}_{counter}{suffix}"
                counter += 1
        else:
            safe_filename = filename.replace("/", "").replace("\\", "")
            file_path = self.root / safe_filename
            
            # If file exists, append a number
            counter = 1
            base_name = file_path.stem
            suffix = file_path.suffix
            while file_path.exists():
                file_path = self.root / f"{base_name}_{counter}{suffix}"
                counter += 1
            
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_bytes)
        return self._to_relative_path(file_path)

fs_service = FilesystemService()
