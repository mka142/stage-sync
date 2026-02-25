import express, { type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import archiver from "archiver";
import yauzl from "yauzl";
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

// Configure multer for ZIP imports
const zipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(imagesDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}.zip`);
  },
});

const zipUpload = multer({
  storage: zipStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for ZIP files
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
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

/**
 * POST /import - Import images from ZIP file with metadata
 */
router.post("/import", zipUpload.single('zipFile'), async (req: Request, res: Response) => {
  let tempZipPath: string | undefined;
  let extractDir: string | undefined;
  
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No ZIP file provided" });
      return;
    }

    tempZipPath = req.file.path;
    extractDir = path.join(path.dirname(tempZipPath), `extract-${Date.now()}`);
    
    // Create extraction directory
    fs.mkdirSync(extractDir, { recursive: true });

    // Extract ZIP file
    await new Promise<void>((resolve, reject) => {
      yauzl.open(tempZipPath!, { lazyEntries: true }, (err, zipFile) => {
        if (err) return reject(err);
        if (!zipFile) return reject(new Error('Could not open ZIP file'));

        zipFile.readEntry();
        
        zipFile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry
            const dirPath = path.join(extractDir!, entry.fileName);
            fs.mkdirSync(dirPath, { recursive: true });
            zipFile.readEntry();
          } else {
            // File entry
            zipFile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);
              if (!readStream) return reject(new Error('Could not read ZIP entry'));

              const filePath = path.join(extractDir!, entry.fileName);
              const dirName = path.dirname(filePath);
              
              // Ensure directory exists
              fs.mkdirSync(dirName, { recursive: true });
              
              const writeStream = fs.createWriteStream(filePath);
              readStream.pipe(writeStream);
              
              writeStream.on('close', () => {
                zipFile.readEntry();
              });
              
              writeStream.on('error', reject);
            });
          }
        });
        
        zipFile.on('end', () => {
          resolve();
        });
        
        zipFile.on('error', reject);
      });
    });

    // Read and validate metadata
    const metadataPath = path.join(extractDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('metadata.json not found in ZIP file');
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    if (!metadata.images || !Array.isArray(metadata.images)) {
      throw new Error('Invalid metadata format: images array not found');
    }

    // Get current images to check for conflicts
    const currentImages = readImageMetadata();
    const conflicts: string[] = [];
    const toImport: SimpleImage[] = [];
    
    // Process each image from metadata
    for (const imageMetadata of metadata.images) {
      if (!imageMetadata.uuid || !imageMetadata.originalName) {
        console.warn('Skipping image with incomplete metadata:', imageMetadata);
        continue;
      }
      
      // Check for UUID conflicts
      if (currentImages.some(img => img.uuid === imageMetadata.uuid)) {
        conflicts.push(`${imageMetadata.uuid} (${imageMetadata.originalName})`);
        continue;
      }
      
      // Find corresponding file in extracted images
      const imagesDir = path.join(extractDir, 'images');
      const possibleFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
      const imageFile = possibleFiles.find(filename => 
        filename.startsWith(imageMetadata.uuid) || 
        filename === imageMetadata.filename ||
        filename.includes(imageMetadata.originalName)
      );
      
      if (!imageFile) {
        console.warn(`Image file not found for ${imageMetadata.uuid}`);
        continue;
      }
      
      const sourceImagePath = path.join(imagesDir, imageFile);
      const ext = path.extname(imageFile);
      const newFilename = `${imageMetadata.uuid}${ext}`;
      const targetImagePath = path.join(path.join(config.paths.uploads, "images"), newFilename);
      
      // Copy image file to images directory
      fs.copyFileSync(sourceImagePath, targetImagePath);
      
      // Prepare metadata for import
      const restoredImage: SimpleImage = {
        uuid: imageMetadata.uuid,
        filename: newFilename,
        originalName: imageMetadata.originalName,
        uploadedAt: new Date(imageMetadata.uploadedAt || new Date()),
        type: "image",
      };
      
      toImport.push(restoredImage);
    }

    // Update metadata file
    const updatedImages = [...currentImages, ...toImport];
    writeImageMetadata(updatedImages);

    const result = {
      success: true,
      imported: toImport.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
      message: `Successfully imported ${toImport.length} images${conflicts.length > 0 ? `. ${conflicts.length} images skipped due to UUID conflicts.` : ''}`
    };

    res.json(result);
    
  } catch (error) {
    console.error("Image import error:", error);
    
    const result = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import images"
    };
    res.status(500).json(result);
  } finally {
    // Clean up temporary files
    try {
      if (tempZipPath && fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
      if (extractDir && fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
});

/**
 * GET /export - Export all images as ZIP with metadata
 */
router.get("/export", (req: Request, res: Response) => {
  try {
    const images = readImageMetadata();
    
    // Set response headers for ZIP download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `images-export-${timestamp}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ success: false, error: 'Failed to create archive' });
    });

    // Pipe archive data to response
    archive.pipe(res);

    // Add metadata JSON to archive
    const metadataJson = JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalImages: images.length,
      images: images
    }, null, 2);
    
    archive.append(metadataJson, { name: 'metadata.json' });

    // Add each image file to archive
    images.forEach(image => {
      const imagePath = path.join(imagesDir, image.filename);
      
      if (fs.existsSync(imagePath)) {
        archive.file(imagePath, { 
          name: `images/${image.uuid}-${image.originalName}` 
        });
      } else {
        console.warn(`Image file not found: ${imagePath}`);
      }
    });

    // Finalize archive
    archive.finalize();
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export images' });
  }
});

/**
 * DELETE /:uuid - Delete image by UUID
 */
router.delete("/:uuid", (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const images = readImageMetadata();
    const imageIndex = images.findIndex(img => img.uuid === uuid);
    
    if (imageIndex === -1) {
      res.status(404).json({ success: false, error: "Image not found" });
      return;
    }

    const image = images[imageIndex];
    const imagePath = path.join(imagesDir, image.filename);
    
    // Remove file from filesystem if it exists
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove from metadata
    images.splice(imageIndex, 1);
    writeImageMetadata(images);

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image delete error:", error);
    res.status(500).json({ success: false, error: "Failed to delete image" });
  }
});

export default router;