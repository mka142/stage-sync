/**
 * Simplified Image module types
 */

export interface SimpleImage {
  uuid: string;
  filename: string;
  originalName: string;
  uploadedAt: Date;
  type: "image"; // Just simple generic image type
}

export interface ImageUploadResult {
  success: boolean;
  image?: SimpleImage;
  error?: string;
}

export interface ImageParserOptions {
  domain: string;
}

export interface ParsedContent {
  content: string;
  images: string[]; // array of UUIDs used in content
}