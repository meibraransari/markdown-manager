from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class FileType(str, Enum):
    FILE = "file"
    DIRECTORY = "directory"

class FileNode(BaseModel):
    name: str
    path: str
    type: FileType
    size: Optional[int] = None
    last_modified: Optional[float] = None
    children: Optional[List["FileNode"]] = None

class FileContent(BaseModel):
    content: str
    last_modified: float

class SaveFileRequest(BaseModel):
    content: str

class RenameRequest(BaseModel):
    new_path: str

class CreateRequest(BaseModel):
    is_directory: bool = False
    content: str = ""

class SearchResult(BaseModel):
    path: str
    line_number: Optional[int] = None
    match_context: str
