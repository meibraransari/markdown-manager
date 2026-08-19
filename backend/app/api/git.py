from fastapi import APIRouter, HTTPException
from typing import List, Dict
import subprocess
from app.config import settings

router = APIRouter()

def run_git(cmd: List[str]):
    try:
        result = subprocess.run(
            ['git'] + cmd,
            cwd=settings.absolute_markdown_root,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return e.stdout.strip() + e.stderr.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ensure git is initialized
if settings.absolute_markdown_root.exists():
    if not (settings.absolute_markdown_root / '.git').exists():
        run_git(['init'])

@router.get("/git/status")
def git_status():
    status = run_git(['status', '--short'])
    return {"status": status}

@router.post("/git/commit")
def git_commit(request: dict):
    message = request.get("message", "Auto-commit")
    run_git(['add', '.'])
    output = run_git(['commit', '-m', message])
    return {"message": "Committed successfully", "output": output}

@router.get("/git/log")
def git_log():
    log = run_git(['log', '--pretty=format:%h|%s|%ar', '-n', '10'])
    commits = []
    if log:
        for line in log.split('\n'):
            parts = line.split('|')
            if len(parts) >= 3:
                commits.append({
                    "hash": parts[0],
                    "message": parts[1],
                    "time": parts[2]
                })
    return {"commits": commits}
