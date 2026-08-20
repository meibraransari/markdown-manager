from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List
import os
import re
from pathlib import Path
from app.config import settings
from app.services.filesystem import fs_service

router = APIRouter()

class BacklinkItem(BaseModel):
    source_path: str
    line_number: int
    context: str

@router.get("/backlinks", response_model=List[BacklinkItem])
def get_backlinks(target_path: str = Query(...)):
    backlinks = []
    root = settings.absolute_markdown_root
    
    # We will search for standard markdown links `(target_path)` or wiki links `[[target_basename]]`
    target_basename = Path(target_path).stem
    
    # Avoid scanning if empty
    if not target_basename:
        return backlinks

    # Build simple regex to find links containing the target
    # 1. Wiki links: [[target_basename]] or [[target_path]]
    # 2. Standard links: ](target_path) or ](./target_path)
    
    wiki_pattern = re.compile(rf'\[\[(.*?)\]\]')
    md_pattern = re.compile(rf'\]\((.*?)\)')
    
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]
        
        for filename in filenames:
            if not filename.endswith('.md'):
                continue
                
            filepath = Path(dirpath) / filename
            rel_path = fs_service._to_relative_path(filepath)
            
            # Skip self
            if rel_path == target_path:
                continue
                
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        found = False
                        
                        # Check wiki links
                        for match in wiki_pattern.finditer(line):
                            link_text = match.group(1)
                            if target_basename in link_text or target_path in link_text:
                                found = True
                                break
                                
                        # Check markdown links
                        if not found:
                            for match in md_pattern.finditer(line):
                                link_text = match.group(1)
                                if target_path in link_text or target_basename in link_text:
                                    found = True
                                    break
                                    
                        if found:
                            context = line.strip()
                            if len(context) > 100:
                                start = max(0, context.find(target_basename) - 40)
                                end = min(len(context), start + 80)
                                context = "..." + context[start:end] + "..."
                                
                            backlinks.append(BacklinkItem(
                                source_path=rel_path,
                                line_number=line_num,
                                context=context
                            ))
            except Exception:
                pass
                
    return backlinks
