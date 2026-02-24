import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { ProgramPiece, PieceImage } from "@/components/ConcertProgram/ProgramItem";
import Logo from "@/components/Logo";
import FadeOutWrapper from "@/components/FadeOutWrapper";
import ContentParser from "@/components/ContentParser";
import config from "@/config";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";

export interface CurrentPieceProps {
  piece: ProgramPiece;
  customText?: string;
}

export default function CurrentPiecePage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();
  const [activeTab, setActiveTab] = useState<"info" | "images">("info");
  const [pieceImages, setPieceImages] = useState<PieceImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<PieceImage | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  
  useBackgroundColor(
    config.constants.pagesBackgroundColor.CURRENT_PIECE,
    500
  );

  // Track page view for analytics
  React.useEffect(() => {
    sendEvent('page_change', {
      toPage: 'CURRENT_PIECE',
      url: window.location.href
    });
  }, [sendEvent]);

  const piece = payload?.piece;
  const customText = payload?.customText;

  // Load piece images when piece is available
  useEffect(() => {
    if (!piece?.pieceId) return;

    const loadPieceImages = async () => {
      setLoadingImages(true);
      try {
        const response = await fetch(`${config.api.url.images}/piece/${piece.pieceId}`);
        const data = await response.json();
        
        if (data.success && data.images) {
          setPieceImages(data.images);
          // If piece has images, default to images tab
          if (data.images.length > 0 && activeTab === "info") {
            setActiveTab("images");
          }
        }
      } catch (error) {
        console.error('Failed to load piece images:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadPieceImages();
  }, [piece?.pieceId, activeTab]);

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `~${minutes} min`;
  };

  if (!piece) {
    return (
      <FadeOutWrapper
        className="flex flex-col items-center justify-center w-full h-full page-screen"
        shouldTransitionBegin={shouldTransitionBegin}
        setTransitionFinished={setTransitionFinished}
      >
        <div className="flex flex-col items-center space-y-6">
          <Logo className="w-16 h-16 opacity-50" />
          <p className="text-gray-400 text-lg">Ładowanie utworu...</p>
        </div>
      </FadeOutWrapper>
    );
  }

  return (
    <FadeOutWrapper
      className="flex flex-col w-full h-full overflow-hidden page-screen"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
      style={{ 
        color: '#F5F0E8', 
        fontFamily: "'Cormorant Garamond', serif" 
      }}
    >
      <div className="flex flex-col h-full max-w-6xl mx-auto w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center space-x-3 py-6"
        >
          <Logo className="w-8 h-8" />
          <span 
            className="text-sm tracking-[0.3em] uppercase text-primary-light"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            AKTUALNY UTWÓR
          </span>
        </motion.div>

        {/* Piece title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 
            className="text-3xl mb-2 text-primary-light"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {piece.pieceTitle}
          </h1>
          <p className="text-lg text-foreground/80 mb-1">
            {piece.composerName}
          </p>
          <p className="text-sm text-foreground/60">
            {piece.compositionYear} • {formatDuration(piece.durationSeconds)}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="flex bg-background/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === "info"
                  ? "bg-primary text-background shadow-lg"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              INFORMACJE
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === "images"
                  ? "bg-primary text-background shadow-lg"
                  : "text-foreground/70 hover:text-foreground"
              } ${pieceImages.length === 0 && !loadingImages ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ fontFamily: "'DM Mono', monospace" }}
              disabled={pieceImages.length === 0 && !loadingImages}
            >
              GALERIA {pieceImages.length > 0 && `(${pieceImages.length})`}
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "info" && (
            <InfoTab 
              piece={piece} 
              customText={customText}
            />
          )}
          
          {activeTab === "images" && (
            <ImageGallery
              images={pieceImages}
              loading={loadingImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <ImageLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </FadeOutWrapper>
  );
}

// Info Tab Component
interface InfoTabProps {
  piece: ProgramPiece;
  customText?: string;
}

const InfoTab: React.FC<InfoTabProps> = ({ piece, customText }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="space-y-6 overflow-auto h-full px-6"
  >
    {/* Performers */}
    {piece.performers && piece.performers.length > 0 && (
      <div className="space-y-3">
        <h3 
          className="text-lg text-primary-light mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Wykonawcy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {piece.performers.map((performer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="p-3 bg-background/20 rounded-lg border border-primary/20"
            >
              <div className="text-foreground">{performer.name}</div>
              <div className="text-sm text-foreground/60">{performer.instrument}</div>
            </motion.div>
          ))}
        </div>
      </div>
    )}

    {/* Descriptions */}
    {piece.descriptions && piece.descriptions.length > 0 && (
      <div className="space-y-4">
        <h3 
          className="text-lg text-primary-light mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          O utworze
        </h3>
        <div className="space-y-4">
          {piece.descriptions.map((desc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              className="p-4 bg-background/20 rounded-lg border border-primary/20"
            >
              <h4 className="text-primary-light mb-2 font-semibold">
                {desc.title}
              </h4>
              <ContentParser 
                content={desc.content}
                className="text-foreground/80 leading-relaxed"
              />
            </motion.div>
          ))}
        </div>
      </div>
    )}

    {/* Custom text */}
    {customText && (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="p-4 bg-accent/20 rounded-lg text-foreground leading-relaxed border border-accent/30"
      >
        {customText}
      </motion.div>
    )}
  </motion.div>
);

// Image Gallery Component
interface ImageGalleryProps {
  images: PieceImage[];
  loading: boolean;
  selectedImage: PieceImage | null;
  onSelectImage: (image: PieceImage | null) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  loading, 
  selectedImage, 
  onSelectImage 
}) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full"
      >
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/60">Ładowanie galerii...</p>
        </div>
      </motion.div>
    );
  }

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full"
      >
        <div className="text-center space-y-2">
          <div className="text-4xl text-foreground/20 mb-4">🖼️</div>
          <p className="text-foreground/60">Brak obrazów dla tego utworu</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full overflow-auto px-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative aspect-square bg-background/20 rounded-lg overflow-hidden border border-primary/20 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
            onClick={() => onSelectImage(image)}
          >
            <img
              src={`${config.api.url.images}/${image.filename}`}
              alt={image.alt || image.originalName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {image.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {image.description}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Image Lightbox Component
interface ImageLightboxProps {
  image: PieceImage;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="max-w-4xl max-h-full bg-background rounded-lg overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <img
          src={`${config.api.url.images}/${image.filename}`}
          alt={image.alt || image.originalName}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          ×
        </button>
      </div>
      
      {(image.description || image.originalName) && (
        <div className="p-4 border-t border-primary/20">
          <h4 className="text-primary-light font-semibold mb-1">
            {image.originalName}
          </h4>
          {image.description && (
            <p className="text-foreground/70 text-sm">
              {image.description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  </motion.div>
);