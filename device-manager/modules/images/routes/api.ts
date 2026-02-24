import express, { type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../../config";
import { type SimpleImage, type ImageUploadResult } from "../types";

const router = express.Router();

// Ensure images directory exists
const imagesDir = path.join(config.paths.uploads, "images");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for image uploads with UUID filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uuid}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    console.error(`Rejected image upload: mimetype=${file.mimetype}, extension=${ext}, filename=${file.originalname}`);
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Image metadata storage
const metadataPath = path.join(imagesDir, "images-metadata.json");

function readImageMetadata(): SimpleImage[] {
  try {
    return fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : [];
  } catch {
    return [];
  }
}

function writeImageMetadata(images: SimpleImage[]): void {
  fs.writeFileSync(metadataPath, JSON.stringify(images, null, 2));
}

// Export metadata functions for use in other modules
export { readImageMetadata, writeImageMetadata };

/**
 * POST /upload - Upload any image and get UUID
 */
router.post("/upload", upload.single("image"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image file provided" });
      return;
    }

    const uuid = path.basename(req.file.filename, path.extname(req.file.filename));
    
    const newImage: SimpleImage = {
      uuid,
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
      type: "image", // Simple generic type
    };

    const images = readImageMetadata();
    images.push(newImage);
    writeImageMetadata(images);

    const result: ImageUploadResult = {
      success: true,
      image: newImage,
    };

    res.json(result);
  } catch (error) {
    console.error("Image upload error:", error);
    
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    const result: ImageUploadResult = {
      success: false,
      error: "Failed to upload image"
    };
    res.status(500).json(result);
  }
});

/**
 * GET /list - List all images
 */
router.get("/list", (req: Request, res: Response) => {
  try {
    const images = readImageMetadata();
    res.json({ success: true, images });
  } catch (error) {
    console.error("Image list error:", error);
    res.status(500).json({ success: false, error: "Failed to list images" });
  }
});

/**
 * GET /:uuid - Serve image by UUID
 */
router.get("/:uuid", (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const images = readImageMetadata();
    const image = images.find(img => img.uuid === uuid);
    
    if (!image) {
      res.status(404).json({ success: false, error: "Image not found" });
      return;
    }

    const imagePath = path.join(imagesDir, image.filename);
    
    if (!fs.existsSync(imagePath)) {
      res.status(404).json({ success: false, error: "Image file not found" });
      return;
    }

    // Set appropriate content type
    const ext = path.extname(image.filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg", 
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    
    const mimeType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);

    res.sendFile(imagePath);
  } catch (error) {
    console.error("Image serve error:", error);
    res.status(500).json({ success: false, error: "Failed to serve image" });
  }
});

export default router;