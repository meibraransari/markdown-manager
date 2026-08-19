# Markdown Manager

A production-quality web-based Markdown File Manager with a Word-like editing experience, Git-style markdown rendering, and local file system support.

## Features
- **Two Modes**: Read mode (Git-style Markdown rendering) and Edit mode (Word-like WYSIWYG editing).
- **Filesystem Driven**: Operates directly on a mounted local directory. No database required.
- **Rich Markdown Support**: GFM, Mermaid diagrams, task lists, code highlighting, tables.
- **Safe & Secure**: Built-in path traversal protection.

## Requirements
- Docker and Docker Compose (recommended)
- Python 3.12+ (if running backend manually)
- Node.js 20+ (if running frontend manually)

## Quick Start
Using Docker Compose:
```bash
git clone <repo-url>
cd markdown-manager
docker compose up --build
```
Open `http://localhost:8000` in your browser.

## Mounting a Directory
In `docker-compose.yml`, modify the volume mount to point to your documents:
```yaml
volumes:
  - ./my-documents:/workspace
```

## Configuration
- `MARKDOWN_ROOT`: The absolute or relative path to the directory serving as the root. Default is `/workspace` (inside Docker).
- `PORT`: Port the application listens on.
- `LOG_LEVEL`: Application logging level (`info`, `debug`).

## Development
To run backend and frontend separately for development:
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
