from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path

from app.api import files, search, metadata, git

app = FastAPI(title="Markdown Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

app.include_router(files.router, prefix="/api", tags=["Files"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(metadata.router, prefix="/api", tags=["Metadata"])
app.include_router(git.router, prefix="/api", tags=["Git"])

from fastapi.responses import FileResponse
from app.config import settings

# Mount raw workspace files
if settings.absolute_markdown_root.exists():
    app.mount("/raw", StaticFiles(directory=settings.absolute_markdown_root), name="raw")

# Serve static files for frontend if dist folder exists
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    # Mount assets explicitly so they are fast
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve exact file if it exists (e.g. favicon.ico)
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Otherwise serve index.html for SPA routing
        return FileResponse(frontend_dist / "index.html")
