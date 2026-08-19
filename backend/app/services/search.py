import os
from pathlib import Path
from typing import List
from app.config import settings
from app.models.schemas import SearchResult
from app.services.filesystem import fs_service

class SearchService:
    def search(self, query: str) -> List[SearchResult]:
        results = []
        if not query:
            return results
            
        query = query.lower()
        root = settings.absolute_markdown_root
        
        for dirpath, dirnames, filenames in os.walk(root):
            # Skip hidden directories
            dirnames[:] = [d for d in dirnames if not d.startswith('.')]
            
            for filename in filenames:
                if filename.startswith('.'):
                    continue
                    
                filepath = Path(dirpath) / filename
                rel_path = fs_service._to_relative_path(filepath)
                
                # Check filename
                if query in filename.lower():
                    results.append(SearchResult(
                        path=rel_path,
                        match_context=f"Filename match: {filename}"
                    ))
                    continue # Skip content search if filename matches to avoid duplicates for the same file, or we can include both. Let's include both but we won't continue.
                    
                # Check content for text files
                # Simple heuristic: try reading as utf-8, if fails, it's probably binary
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            if query in line.lower():
                                # Extract context
                                context = line.strip()
                                if len(context) > 100:
                                    idx = context.lower().find(query)
                                    start = max(0, idx - 40)
                                    end = min(len(context), idx + len(query) + 40)
                                    context = "..." + context[start:end] + "..."
                                    
                                results.append(SearchResult(
                                    path=rel_path,
                                    line_number=line_num,
                                    match_context=context
                                ))
                                # Only take the first few matches per file to avoid huge payloads
                                if len([r for r in results if r.path == rel_path]) > 3:
                                    break
                except UnicodeDecodeError:
                    pass # Skip binary files
                except Exception:
                    pass # Skip unreadable files
                    
        return results

search_service = SearchService()
