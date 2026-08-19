import os
import re
from pathlib import Path
from typing import List, Dict, Set
from app.services.filesystem import fs_service

WIKILINK_RE = re.compile(r'\[\[(.*?)\]\]')
TAG_RE = re.compile(r'(?:^|\s)#([a-zA-Z0-9_\-]+)')

class ParserService:
    def __init__(self):
        pass

    def scan_workspace(self):
        nodes = []
        links = []
        tasks = []
        tags: Dict[str, List[str]] = {}
        backlinks: Dict[str, List[str]] = {}

        root = fs_service.root

        for path in root.rglob("*.md"):
            if ".git" in path.parts:
                continue

            try:
                rel_path = fs_service._to_relative_path(path)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                nodes.append({
                    "id": rel_path,
                    "name": path.stem,
                    "path": rel_path
                })

                found_links = WIKILINK_RE.findall(content)
                for link in found_links:
                    target_path = link if link.endswith(".md") else f"{link}.md"
                    
                    links.append({
                        "source": rel_path,
                        "target": target_path
                    })

                    if target_path not in backlinks:
                        backlinks[target_path] = []
                    if rel_path not in backlinks[target_path]:
                        backlinks[target_path].append(rel_path)

                found_tags = TAG_RE.findall(content)
                for tag in set(found_tags):
                    tag_lower = tag.lower()
                    if tag_lower not in tags:
                        tags[tag_lower] = []
                    tags[tag_lower].append(rel_path)

                lines = content.split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('- [ ] ') or line.startswith('- [x] ') or line.startswith('- [X] '):
                        completed = '[x]' in line.lower()
                        text = line[5:].strip()
                        if text:
                            tasks.append({
                                "file": rel_path,
                                "text": text,
                                "completed": completed
                            })

            except Exception as e:
                print(f"Error parsing {path}: {e}")

        return {
            "graph": {
                "nodes": nodes,
                "links": links
            },
            "tags": tags,
            "backlinks": backlinks,
            "tasks": tasks
        }

parser_service = ParserService()
