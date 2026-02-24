import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import './ContentParser.css';

interface ContentParserProps {
  content: string;
  className?: string;
}

/**
 * Safe HTML Content Parser
 * Renders HTML content while sanitizing it for security and styling it appropriately
 */
export function ContentParser({ content, className = '' }: ContentParserProps) {
  // Configure DOMPurify to allow specific tags and attributes
  const cleanHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'a'
    ],
    ALLOWED_ATTR: [
      'src', 'alt', 'href', 'title', 'class', 'style',
      'data-uuid', // Allow data attributes for images
      'width', 'height' // Allow width/height for images
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|\/api\/)/i, // Allow API endpoints for images
    // Allow specific CSS properties that are safe for images
    FORBID_ATTR: [], // Don't forbid any attributes we've explicitly allowed
    ALLOW_DATA_ATTR: true
  });

  // Manual post-processing to ensure style attributes are preserved on images
  // This is a workaround for DOMPurify being overly aggressive with CSS
  let finalHtml = cleanHtml;
  
  // Debug logging to see what's happening
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentParser Input:', content);
    console.log('ContentParser First Pass:', cleanHtml);
  }
  
  // If style attributes were stripped, let's be more permissive for image styles only
  if (content.includes('style=') && !cleanHtml.includes('style=')) {
    // Try with more permissive settings specifically for this content
    const permissiveHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['img', 'span', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
      ALLOWED_ATTR: ['src', 'alt', 'data-uuid', 'style', 'href', 'title', 'class', 'width', 'height'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|\/api\/)/i,
      ALLOW_DATA_ATTR: true,
      FORBID_ATTR: [],
      FORBID_TAGS: [],
      FORCE_BODY: false,
      SANITIZE_DOM: false
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('ContentParser Permissive Pass:', permissiveHtml);
    }
    
    finalHtml = permissiveHtml;
  }

  return (
    <div 
      className={`content-parser ${className}`}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
      style={{
        // Custom CSS for common HTML elements
        '--content-line-height': '1.75',
        '--content-margin-bottom': '0.75rem',
      }}
    />
  );
}

export default ContentParser;