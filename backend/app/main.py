import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

    @app.get("/", include_in_schema=False)
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(tasks.router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
