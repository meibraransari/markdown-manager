# Markdown Manager

A production-quality, deeply integrated, locally-hosted Markdown Knowledge Base and Editor. Inspired by tools like Obsidian and Notion, Markdown Manager provides a raw, professional Markdown editing experience (powered by Monaco Editor) mixed with advanced visualization, templating, and native Git support—all operating directly on your local file system.

[![GitHub Repo stars](https://img.shields.io/github/stars/meibraransari/markdown-manager?style=social)](https://github.com/meibraransari/markdown-manager)

## 🚀 Key Features

### Advanced Editing & Viewing
- **Two Modes**: Seamlessly toggle between "Edit Mode" (raw text Monaco editor) and "Read Mode" (beautiful Git-style markdown preview).
- **Clipboard Image Paste**: Native `Ctrl+V` interception in the editor instantly uploads pasted images and inserts the markdown tag (`![img](path)`).
- **Vim Keybindings**: Built-in, toggleable Vim mode for power users.
- **Math & LaTeX Support**: Full KaTeX integration to render inline (`$math$`) and block (`$$math$$`) math equations.
- **Rich Media Viewing**: Native support for viewing images (`.png`, `.jpg`, etc.) and `.pdf` files directly in the workspace tabs.
- **Slash Commands (`/`)**: Type `/` in the editor to quickly insert tables, codeblocks, LaTeX blocks, mermaid diagrams, quotes, and task checkboxes.
- **Enhanced Read Mode**: Features a "Page View" width slider directly in the toolbar for distraction-free reading, and one-click "Copy" buttons on all codeblocks.

### Organization & Intelligence
- **Graph View**: Interactive, force-directed network graph visualizing all your files and how they connect to each other via wikilinks.
- **Tags & Backlinks**:
  - Automatically parses `#tags` into a dynamic Sidebar panel.
  - "Linked Mentions" appear at the bottom of notes, showing which other files link to the current one.
- **Wikilinks**: Full support for Obsidian-style `[[File Name]]` inter-note linking.
- **Global Task Manager**: 
  - Aggregates all markdown tasks (`- [ ]`) across your entire workspace.
  - Features a collapsible **Tasks Panel** in the sidebar to jump to tasks.
  - Includes a professional, draggable **Task Dashboard** modal that lets you drag tasks from "To Do" to "Done", automatically updating the physical markdown files.

### Productivity & Workflow
- **Advanced File Management**: 
  - Professional, beautifully styled modal dialogs (no more native browser prompts).
  - Full support for uploading, renaming, deleting, and downloading entire **folders** and files.
  - Contextual hover actions in the sidebar to create files/folders directly inside specific directories.
  - A dedicated "Refresh File Tree" button in the sidebar header.
- **Daily Notes & Templating**: Generate daily journal entries instantly. Configure a template folder (e.g. `Templates/Daily.md`) to automatically scaffold new notes.
- **Properties Panel**: Parses YAML frontmatter (`---`) and presents it as a clean, interactive metadata UI at the top of the file.
- **Multi-File Tabs**: Open multiple files concurrently in a tabbed interface.
- **Command Palette**: Press `Ctrl+P` (or `Cmd+P`) to quickly fuzzy-search and jump between files.
- **Outline / TOC**: Sidebar panel displaying a dynamically generated Table of Contents for the active file.
- **Import & Upload**: Consolidated drag-and-drop modal to import files and folders directly into your workspace.

### Customization & Export
- **10+ Pro Themes**: Built-in color themes including Light, Dark, Obsidian, Dracula, Nord, Monokai, GitHub Dark, Solarized, Gruvbox, and One Dark.
- **Custom CSS Snippets**: Inject your own CSS variables and styles globally via the Settings menu.
- **HTML Export**: Single-click "Download" to export the current rendered preview as a standalone, styled HTML file.

### System & Infrastructure
- **Native Git Integration**: Floating GUI panel for version control—commit your changes and view commit history directly from the browser.
- **Filesystem Driven**: Operates directly on a mounted local directory. No database required, completely local, and fully private.
- **Safe & Secure**: Built-in path traversal protection.

## Requirements
- Docker and Docker Compose (recommended)
- Python 3.12+ (if running backend manually)
- Node.js 20+ (if running frontend manually)

## Quick Start
Using Docker Compose:
```bash
git clone https://github.com/meibraransari/markdown-manager.git
cd markdown-manager
docker compose up --build -d
```
Open `http://localhost:8000` in your browser.

## Mounting a Directory
In `docker-compose.yml`, modify the volume mount to point to your desired markdown documents directory:
```yaml
volumes:
  - ./my-documents:/workspace
```

## Configuration
- `MARKDOWN_ROOT`: The absolute or relative path to the directory serving as the root. Default is `/workspace` (inside Docker).
- `PORT`: Port the application listening port.
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
