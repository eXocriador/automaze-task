import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from .db import Base, engine
from .routers import tasks


def get_cors_origins() -> List[str]:
    origins = os.getenv("BACKEND_CORS_ORIGINS", "*")
    if not origins:
        return ["*"]
    return [origin.strip() for origin in origins.split(",")]


def create_app() -> FastAPI:
    app = FastAPI(title="TODO API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        Base.metadata.create_all(bind=engine)

    @app.get("/", include_in_schema=False, response_class=HTMLResponse)
    def landing() -> str:
        return """
        <!doctype html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Automaze TODO</title>
          <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; display: grid; place-items: center; min-height: 100vh; }
            .card { background: #0b1220; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); max-width: 420px; text-align: center; }
            h1 { margin: 0 0 12px; font-size: 26px; }
            p { margin: 0 0 20px; color: #cbd5f5; }
            .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
            a { text-decoration: none; padding: 12px 16px; border-radius: 10px; font-weight: 600; border: 1px solid #1e293b; transition: transform 0.15s ease, box-shadow 0.15s ease; }
            a.primary { background: #2563eb; color: #f8fafc; border-color: #2563eb; }
            a.secondary { background: #111827; color: #e2e8f0; }
            a:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Automaze TODO</h1>
            <p>Choose where to go:</p>
            <div class="actions">
              <a class="primary" href="https://automaze-task.vercel.app" target="_blank" rel="noreferrer">Open Frontend</a>
              <a class="secondary" href="/docs">API Docs</a>
            </div>
          </div>
        </body>
        </html>
        """

    @app.get("/health", include_in_schema=False, response_class=JSONResponse)
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(tasks.router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
