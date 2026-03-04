import type { SimpleImage, ImageParserOptions, ParsedContent } from "../types";

/**
 * Image Parser Utility
 * Parses content containing <image uuid="..."/> tags and converts them to actual image URLs
 */
export class ImageParser {
  private domain: string;
  private imageMetadata: SimpleImage[] = [];

  constructor(options: ImageParserOptions) {
    this.domain = options.domain.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Set image metadata for UUID resolution
   */
  setImageMetadata(images: SimpleImage[]): void {
    this.imageMetadata = images;
  }

  /**
   * Parse content and replace <image uuid="..."/> tags with actual img tags or URLs
   */
  parseContent(content: string): ParsedContent {
    // Regex to capture either <image ...> or <image .../> properly
    const imageRegex = /<image([^>]*?)\s*\/?>/gi;
    const usedUuids: string[] = [];
    
    const parsedContent = content.replaceAll(imageRegex, (match, attributes) => {
      // Extract uuid, width, and asUrl from attributes
      const uuidMatch = attributes.match(/uuid=['"]([a-zA-Z0-9\-]+)['"]/);
      const widthMatch = attributes.match(/width=['"]([^'"]*)['"]/);
      const asUrlMatch = attributes.match(/\basUrl\b/);
      
      if (!uuidMatch) {
        console.warn(`Image tag missing uuid: ${match}`);
        return match; // Return original tag if no UUID found
      }
      
      const uuid = uuidMatch[1];
      const width = widthMatch ? widthMatch[1] : null;
      const asUrl = !!asUrlMatch;
      
      // Track used UUIDs
      if (!usedUuids.includes(uuid)) {
        usedUuids.push(uuid);
      }

      // Find image metadata
      const image = this.imageMetadata.find(img => img.uuid === uuid);
      if (!image) {
        console.warn(`Image with UUID ${uuid} not found in metadata`);
        return `<span class="missing-image" data-uuid="${uuid}">Missing Image: ${uuid}</span>`;
      }

      // Generate image URL
      const imageUrl = `${this.domain}/api/images/${uuid}`;
      
      // If asUrl is present, return just the URL
      if (asUrl) {
        return imageUrl;
      }
      
      // Build style attribute for width if provided
      let styleAttr = '';
      if (width) {
        // Ensure width includes % if it's a number
        const cleanWidth = width.trim();
        const widthValue = cleanWidth.includes('%') ? cleanWidth : `${cleanWidth}%`;
        styleAttr = ` style="width: ${widthValue}; height: auto;"`;
      }
      
      // Return proper img tag with optional width styling
      return `<img src="${imageUrl}" alt="${image.originalName}" data-uuid="${uuid}"${styleAttr} />`;
    });

    return {
      content: parsedContent,
      images: usedUuids
    };
  }

  /**
   * Extract all UUIDs from content without parsing
   */
  extractImageUuids(content: string): string[] {
    // Use the same regex as parseContent
    const imageRegex = /<image([^>]*?)\s*\/?>/gi;
    const uuids: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const attributes = match[1];
      const uuidMatch = attributes.match(/uuid=['"]([a-zA-Z0-9\-]+)['"]/);
      
      if (uuidMatch) {
        const uuid = uuidMatch[1];
        if (!uuids.includes(uuid)) {
          uuids.push(uuid);
        }
      }
    }

    return uuids;
  }

  /**
   * Validate that all image UUIDs in content exist in metadata
   */
  validateImageReferences(content: string): { valid: boolean; missingUuids: string[] } {
    const usedUuids = this.extractImageUuids(content);
    const missingUuids: string[] = [];

    for (const uuid of usedUuids) {
      const image = this.imageMetadata.find(img => img.uuid === uuid);
      if (!image) {
        missingUuids.push(uuid);
      }
    }

    return {
      valid: missingUuids.length === 0,
      missingUuids
    };
  }
}

/**
 * Helper function to recursively process payload content
 * Processes any data structure and applies ImageParser to all string values
 */
export function processPayloadContent(obj: any, imageParser: ImageParser): any {
  if (typeof obj === 'string') {
    // Process string content through ImageParser
    const result = imageParser.parseContent(obj);
    return result.content;
  } else if (Array.isArray(obj)) {
    // Process array elements
    return obj.map(item => processPayloadContent(item, imageParser));
  } else if (obj && typeof obj === 'object') {
    // Process object properties
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processPayloadContent(value, imageParser);
    }
    return processed;
  }
  // Return as-is for other types (numbers, booleans, null, etc.)
  return obj;
}

/**
 * Create a parser instance with environment configuration
 */
export function createImageParser(): ImageParser {
  const domain = process.env.IMAGE_DOMAIN || process.env.DOMAIN || 'http://localhost:3001';
  
  return new ImageParser({ domain });
}