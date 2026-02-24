import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import { PieceImage } from "@/components/ConcertProgram/ProgramItem";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

export default function PieceListeningPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();
  const [pieceImages, setPieceImages] = useState<PieceImage[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  useBackgroundColor(
    config.constants.pagesBackgroundColor.PIECE_LISTENING,
    500
  );

  React.useEffect(() => {
    sendEvent('page_change', {
      toPage: 'PIECE_LISTENING',
      url: window.location.href
    });
  }, [sendEvent]);

  // Extract piece info from payload
  const pieceTitle = payload?.pieceTitle || "Słuchanie utworu";
  const composer = payload?.composer || "";
  const pieceId = payload?.pieceId;
  const initialSlideIndex = payload?.currentSlideIndex || 0;

  // Load piece images when piece is available
  useEffect(() => {
    if (!pieceId) return;

    const loadPieceImages = async () => {
      try {
        const response = await fetch(`${config.api.url.images}/piece/${pieceId}`);
        const data = await response.json();
        
        if (data.success && data.images && data.images.length > 0) {
          setPieceImages(data.images);
          setCurrentSlideIndex(initialSlideIndex);
          setShowSlideshow(true);
        } else {
          setShowSlideshow(false);
        }
      } catch (error) {
        console.error('Failed to load piece images:', error);
        setShowSlideshow(false);
      }
    };

    loadPieceImages();
  }, [pieceId, initialSlideIndex]);

  // Auto-advance slides
  useEffect(() => {
    if (!showSlideshow || !autoPlayEnabled || pieceImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % pieceImages.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [showSlideshow, autoPlayEnabled, pieceImages.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % pieceImages.length);
  }, [pieceImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + pieceImages.length) % pieceImages.length);
  }, [pieceImages.length]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayEnabled(!autoPlayEnabled);
  }, [autoPlayEnabled]);

  return (
    <FadeOutWrapper
      className="h-full relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
      style={{ 
        color: '#F5F0E8', 
        fontFamily: "'Cormorant Garamond', serif" 
      }}
    >
      {showSlideshow && pieceImages.length > 0 ? (
        <SlideShow
          images={pieceImages}
          currentIndex={currentSlideIndex}
          autoPlay={autoPlayEnabled}
          onNext={nextSlide}
          onPrev={prevSlide}
          onToggleAutoPlay={toggleAutoPlay}
          pieceTitle={pieceTitle}
          composer={composer}
        />
      ) : (
        <MinimalListeningView 
          pieceTitle={pieceTitle}
          composer={composer}
        />
      )}
    </FadeOutWrapper>
  );
}

// Slideshow Component
interface SlideShowProps {
  images: PieceImage[];
  currentIndex: number;
  autoPlay: boolean;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  pieceTitle: string;
  composer: string;
}

const SlideShow: React.FC<SlideShowProps> = ({
  images,
  currentIndex,
  autoPlay,
  onNext,
  onPrev,
  onToggleAutoPlay,
  pieceTitle,
  composer,
}) => (
  <div className="relative h-full">
    {/* Background Image */}
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${config.api.url.images}/${images[currentIndex].filename})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
    </AnimatePresence>

    {/* Image Info Overlay - Bottom */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8"
    >
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 
            className="text-2xl text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {pieceTitle}
          </h2>
          {composer && (
            <p className="text-lg text-white/80 italic">
              {composer}
            </p>
          )}
          {images[currentIndex].description && (
            <p className="text-sm text-white/70 max-w-md">
              {images[currentIndex].description}
            </p>
          )}
        </div>
        
        {/* Slide Counter */}
        <div className="text-white/60 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </motion.div>

    {/* Navigation Controls - Only visible on hover */}
    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 group">
      {/* Previous Button */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Auto-play Toggle */}
      <button
        onClick={onToggleAutoPlay}
        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
        title={autoPlay ? "Zatrzymaj automatyczne przewijanie" : "Włącz automatyczne przewijanie"}
      >
        {autoPlay ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </div>

    {/* Progress Indicators */}
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {images.map((_, index) => (
        <button
          key={index}
          onClick={() => {/* Could add slide selection */}}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentIndex 
              ? "bg-white w-6" 
              : "bg-white/40 hover:bg-white/60"
          }`}
        />
      ))}
    </div>

    {/* Auto-play Progress Bar */}
    {autoPlay && (
      <motion.div
        key={currentIndex}
        className="absolute top-0 left-0 h-1 bg-white/60"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 8, ease: "linear" }}
      />
    )}
  </div>
);

// Minimal Listening View (No Images)
interface MinimalListeningViewProps {
  pieceTitle: string;
  composer: string;
}

const MinimalListeningView: React.FC<MinimalListeningViewProps> = ({
  pieceTitle,
  composer,
}) => (
  <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
    {/* Background with minimal visual noise for listening */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-600/5 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-conic from-amber-500/5 to-transparent rounded-full blur-3xl animate-pulse opacity-30" />
    </div>

    {/* Minimal content during performance */}
    <div className="relative z-10 text-center space-y-6 px-8 max-w-sm">
      {/* Musical symbol - subtle and elegant */}
      <div 
        className="text-6xl text-amber-500/60 mx-auto animate-pulse"
        style={{ 
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic"
        }}
      >
        ♪
      </div>

      {/* Current piece info - very subtle */}
      <div className="space-y-2 opacity-70">
        <div 
          className="text-sm text-stone-100"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {pieceTitle}
        </div>
        
        {composer && (
          <div 
            className="text-xs italic text-amber-200"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {composer}
          </div>
        )}
      </div>

      {/* Listening indicator */}
      <div className="pt-4">
        <div 
          className="text-[8px] tracking-[0.5em] uppercase text-stone-500"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          W trakcie wykonania
        </div>
      </div>
    </div>

    {/* Subtle bottom indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center space-x-1">
        <div className="w-1 h-1 bg-amber-500/40 rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-amber-500/40 rounded-full animate-pulse delay-75" />
        <div className="w-1 h-1 bg-amber-500/40 rounded-full animate-pulse delay-150" />
      </div>
    </div>
  </div>
);
