from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import re
from pathlib import Path
from app.config import settings
from app.services.filesystem import fs_service

router = APIRouter()

class TaskItem(BaseModel):
    path: str
    line_number: int
    text: str
    completed: bool
    context: Optional[str] = None

class ToggleTaskRequest(BaseModel):
    path: str
    line_number: int
    completed: bool

@router.get("/tasks", response_model=List[TaskItem])
def get_all_tasks():
    tasks = []
    root = settings.absolute_markdown_root
    task_pattern = re.compile(r'^(\s*)-\s*\[([ xX])\]\s+(.*)')

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]
        
        for filename in filenames:
            if not filename.endswith('.md'):
                continue
                
            filepath = Path(dirpath) / filename
            rel_path = fs_service._to_relative_path(filepath)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        match = task_pattern.match(line)
                        if match:
                            indent = match.group(1)
                            checked_char = match.group(2)
                            text = match.group(3).strip()
                            completed = checked_char.lower() == 'x'
                            
                            tasks.append(TaskItem(
                                path=rel_path,
                                line_number=line_num,
                                text=text,
                                completed=completed,
                                context=line.strip()
                            ))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                
    return tasks

@router.post("/tasks/toggle")
def toggle_task(request: ToggleTaskRequest):
    root = settings.absolute_markdown_root
    safe_path = Path(request.path.strip("/"))
    if ".." in safe_path.parts:
        raise HTTPException(status_code=400, detail="Invalid path")
        
    filepath = root / safe_path
    if not filepath.exists() or not filepath.is_file():
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        if request.line_number < 1 or request.line_number > len(lines):
            raise HTTPException(status_code=400, detail="Invalid line number")
            
        line_idx = request.line_number - 1
        line = lines[line_idx]
        
        # Regex to replace the checkbox character
        task_pattern = re.compile(r'^(\s*-\s*\[)([ xX])(\]\s+.*)')
        match = task_pattern.match(line)
        if not match:
            raise HTTPException(status_code=400, detail="Line is not a task")
            
        new_char = 'x' if request.completed else ' '
        new_line = match.group(1) + new_char + match.group(3) + "\n" if not match.group(3).endswith("\n") else match.group(1) + new_char + match.group(3)
        
        lines[line_idx] = new_line
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
        return {"status": "success", "line": new_line.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
