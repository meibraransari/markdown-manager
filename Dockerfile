# Stage 1: Build the frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
# We will use npm install since it's standard, but if we don't have package-lock we use npm i
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend and serve the application
FROM python:3.12-slim
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1 to static directory expected by FastAPI
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the application port
EXPOSE 8000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8000
ENV MARKDOWN_ROOT=/workspace
ENV LOG_LEVEL=info
ENV PYTHONPATH=/app/backend

# Run the FastAPI application using Uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
