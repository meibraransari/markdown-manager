from fastapi import APIRouter, Query
from typing import List
from app.services.search import search_service
from app.models.schemas import SearchResult

router = APIRouter()

@router.get("/search", response_model=List[SearchResult])
def search_files(q: str = Query(..., min_length=1)):
    return search_service.search(q)
