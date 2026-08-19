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

        import itertools
        md_files = itertools.chain(root.rglob("*.md"), root.rglob("*.MD"), root.rglob("*.Md"), root.rglob("*.mD"))
        
        for path in md_files:
            if ".git" in path.parts:
                continue

            try:
                rel_path = fs_service._to_relative_path(path)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Better naming: if file is README, use the parent folder name
                node_name = path.stem
                if node_name.lower() == 'readme' and len(path.parts) > 1:
                    node_name = path.parent.name
                    
                nodes.append({
                    "id": rel_path.lower(),
                    "name": node_name,
                    "path": rel_path
                })

                found_links = WIKILINK_RE.findall(content)
                md_links = re.findall(r'\[.*?\]\((.*?)\)', content)
                
                # Combine and filter links that are external or point to non-md files
                all_targets = set(found_links)
                for md_link in md_links:
                    if md_link.startswith('http') or md_link.startswith('#') or md_link.startswith('mailto:'):
                        continue
                    if not md_link.lower().endswith('.md'):
                        continue
                    # Normalize paths relative to the current file or workspace
                    # For simplicity in this graph structure, we just take the basename or exact path.
                    all_targets.add(md_link)

                for link in all_targets:
                    # In wikilinks, target might just be 'PageName'. In md links, it might be 'path/to/PageName.md'
                    target_path = link if link.lower().endswith(".md") else f"{link}.md"
                    
                    # Try to resolve relative paths if it starts with './' or '../'
                    if target_path.startswith('./') or target_path.startswith('../'):
                        try:
                            # Resolve relative to current file's directory
                            curr_dir = Path(rel_path).parent
                            target_path = os.path.normpath(curr_dir / target_path).replace('\\', '/')
                        except:
                            pass
                    else:
                        # Clean up path separators
                        target_path = target_path.replace('\\', '/')
                    
                    links.append({
                        "source": rel_path.lower(),
                        "target": target_path.lower()
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
