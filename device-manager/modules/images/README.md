# Simple Image Management System

## Overview

A simplified UUID-based image upload system that allows you to upload any image and use it in JSON content via `<image uuid="..."/>` tags.

## Environment Configuration

```bash
# Domain for image URLs (required for parsing)
IMAGE_DOMAIN=http://localhost:3001

# Alternative: Use general domain setting
DOMAIN=http://localhost:3001
```

## API Endpoints

### Upload Image
```bash
POST /api/images/upload
Content-Type: multipart/form-data

Fields:
- image: Image file (JPEG, PNG, GIF, WebP, SVG)
```

Response:
```json
{
  "success": true,
  "image": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
    "originalName": "my-image.jpg",
    "uploadedAt": "2026-02-24T10:30:00.000Z",
    "type": "image"
  }
}
```

### Get Image by UUID
```bash
GET /api/images/:uuid
```
Returns the image file directly with appropriate Content-Type header.

### List All Images
```bash
GET /api/images/list
```

## Usage in JSON Content

### 1. Upload Image
Upload any image using the Device Manager and get a UUID:
`550e8400-e29b-41d4-a716-446655440000`

### 2. Use in JSON Content

**Basic Usage:**
```json
{
  "title": "Concert Program",
  "description": "Welcome! <image uuid=\"550e8400-e29b-41d4-a716-446655440000\"/> Enjoy the show!"
}
```

**With Width Control:**
```json
{
  "title": "Concert Program", 
  "description": "Small image: <image uuid=\"550e8400-e29b-41d4-a716-446655440000\" width=\"20%\"/> or <image uuid=\"550e8400-e29b-41d4-a716-446655440000\" width=\"50\"/>"
}
```

**Width Options:**
- Percentage: `width="20%"` (explicit percentage)
- Number: `width="50"` (automatically converts to 50%)
- If no width is specified, images use default CSS sizing

### 3. Parse Content (Server-Side)
```typescript
import { createImageParser } from './modules/images';
import fs from 'fs';
import path from 'path';

// Create parser instance
const parser = createImageParser();

// Load image metadata  
const metadataPath = path.join(config.paths.uploads, "images", "images-metadata.json");
const images = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
parser.setImageMetadata(images);

// Parse content
const input = "Welcome! <image uuid=\"550e8400-e29b-41d4-a716-446655440000\"/> Enjoy!";
const result = parser.parseContent(input);

console.log(result.content);
// Output: "Welcome! <img src=\"http://localhost:3001/api/images/550e8400-e29b-41d4-a716-446655440000\" alt=\"my-image.jpg\" data-uuid=\"550e8400-e29b-41d4-a716-446655440000\" /> Enjoy!"
```

### 4. Client-Side Usage
```javascript
// Rendered HTML is ready to display
document.getElementById('content').innerHTML = result.content;
```

## ImageParser Methods

- `parseContent(content)` - Converts `<image uuid="..."/>` to `<img>` tags
- `extractImageUuids(content)` - Gets all UUIDs from content
- `validateImageReferences(content)` - Validates UUID existence

## File Storage
```
uploads/images/
├── images-metadata.json          # All image metadata
├── 550e8400-e29b-41d4-a716-446655440000.jpg
├── 660f9500-f39c-52e5-b827-557755550001.png  
└── ...
```

## Simple Workflow

1. **Upload** → Get UUID: `550e8400-e29b-41d4-a716-446655440000`
2. **Use in JSON** → `<image uuid="550e8400-e29b-41d4-a716-446655440000"/>`
3. **Server parses** → `<img src="http://localhost:3001/api/images/550e8400-e29b-41d4-a716-446655440000" .../>`
4. **Client renders** → Image displays properly