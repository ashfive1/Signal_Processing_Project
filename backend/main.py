from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from utils.image_processing import process_image
import shutil
import uuid
import os
from typing import Optional


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
OUTPUT_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.get("/")
async def root():
    return {"message": "Photo Equalizer API", "status": "running"}


@app.post("/process")
async def process_image_endpoint(
    file: UploadFile = File(...),
    brightness: Optional[float] = Form(0),
    contrast: Optional[float] = Form(1.0),
    saturation: Optional[float] = Form(1.0),
    hue: Optional[float] = Form(0),
    exposure: Optional[float] = Form(0),
    accessibility_filter: Optional[str] = Form(None),
    auto_enhance: Optional[bool] = Form(False)
):
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    output_path = os.path.join(OUTPUT_DIR, f"{file_id}_processed.jpg")

    # Save uploaded file
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process image with enhanced adjustments
    summary = process_image(
        input_path, 
        output_path,
        brightness=brightness,
        contrast=contrast,
        saturation=saturation,
        hue=hue,
        exposure=exposure,
        accessibility_filter=accessibility_filter,
        auto_enhance=auto_enhance
    )

    return {
        "processed_url": f"http://localhost:8000/{output_path}",
        "summary": summary,
        "file_id": file_id
    }


@app.get("/download/{file_id}")
async def download_image(file_id: str):
    """Download processed image by file ID"""
    processed_path = os.path.join(OUTPUT_DIR, f"{file_id}_processed.jpg")
    if os.path.exists(processed_path):
        return FileResponse(
            processed_path, 
            media_type="image/jpeg",
            filename=f"enhanced_image_{file_id}.jpg"
        )
    else:
        return {"error": "File not found"}

@app.get("/{file_path:path}")
async def get_file(file_path: str):
    # Only serve files from uploads and processed directories
    if file_path.startswith("uploads/") or file_path.startswith("processed/"):
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
            return {"error": "File not found"}
    else:
        return {"error": "Invalid file path"}