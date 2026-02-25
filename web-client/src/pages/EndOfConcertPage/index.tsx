import React, { useState } from "react";
import { motion } from "framer-motion";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";
import ProgramModal from "@/components/ProgramModal";
import { ConcertProgram } from "@/components/ConcertProgram/ProgramView";
import { ProgramPiece } from "@/components/ConcertProgram/ProgramItem";

export default function EndOfConcertPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();
  const [showProgram, setShowProgram] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<ProgramPiece | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(false);

  useBackgroundColor(
    config.constants.pagesBackgroundColor.END_OF_CONCERT,
    2000
  );

  const programData = payload as ConcertProgram;

  React.useEffect(() => {
    sendEvent('page_change', {
      fromPage: 'SYSTEM',
      toPage: 'END_OF_CONCERT',
      url: window.location.href
    });
  }, [sendEvent]);

  const handleShowProgram = async () => {
    sendEvent("end_concert_show_program", {
      fromPage: "END_OF_CONCERT",
      metadata: { shownProgram: true },
    });
    setShowProgram(true);
  };

  const handlePieceClick = (piece: ProgramPiece) => {
    sendEvent("program_piece_preview", {
      fromPage: "END_OF_CONCERT",
      metadata: {
        pieceId: piece.pieceId,
        pieceTitle: piece.pieceTitle,
        composer: piece.composerName,
      },
    });
    setSelectedPiece(piece);
  };

  const handleBackToProgram = () => {
    sendEvent("back_to_program", {
      fromPage: "END_OF_CONCERT",
      metadata: { returnedToProgram: true },
    });
    setSelectedPiece(null);
  };

  const handleCloseProgram = () => {
    sendEvent("end_concert_close_program", {
      fromPage: "END_OF_CONCERT",
      metadata: { shownProgram: false },
    });
    setShowProgram(false);
    setSelectedPiece(null);
  };

  return (
    <FadeOutWrapper
      className="h-full flex flex-col items-center justify-center relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
    >
      {/* Background with elegant farewell atmosphere */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Radial gradient as defined in config */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/8 via-transparent to-transparent opacity-70" />
        
        {/* Decorative musical elements with staggered animation */}
        <motion.div 
          className="absolute top-1/4 right-1/4 text-5xl text-amber-600/10 transform rotate-12"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 12 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "backOut" }}
        >
          ♪
        </motion.div>
        <motion.div 
          className="absolute bottom-1/4 left-1/4 text-4xl text-amber-600/10 transform -rotate-12"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
          initial={{ opacity: 0, scale: 0, rotate: 180 }}
          animate={{ opacity: 0.1, scale: 1, rotate: -12 }}
          transition={{ duration: 1.2, delay: 1.2, ease: "backOut" }}
        >
          ♫
        </motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/5 text-3xl text-amber-600/10"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.6, ease: "backOut" }}
        >
          ♪
        </motion.div>
      </motion.div>

      {/* Main farewell content */}
      <motion.div 
        className="relative z-10 text-center space-y-10 px-8 max-w-lg"
        style={{ 
          color: '#F5F0E8', 
          fontFamily: "'Cormorant Garamond', serif" 
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.3,
          ease: "easeOut"
        }}
      >
        {/* Header */}
        <motion.div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500"
          style={{ fontFamily: "'DM Mono', monospace" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.5,
            ease: "easeOut"
          }}
        >
          Koniec Koncertu
        </motion.div>

        {/* Main farewell */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.8,
            ease: "easeOut"
          }}
        >
          <h1 
            className="text-[52px] font-black leading-tight text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dziękujemy
          </h1>
          
          <motion.div 
            className="text-xl italic text-amber-200 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 1.2
            }}
          >
            Za wspólne przeżycie tego wyjątkowego wieczoru muzycznego
          </motion.div>
        </motion.div>

        {/* Elegant divider */}
        <motion.div 
          className="flex items-center justify-center space-x-4 py-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 1.5,
            ease: "easeOut"
          }}
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
          <motion.div 
            className="w-3 h-3 bg-amber-500 rounded-full opacity-70"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="w-16 h-px bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-60" />
        </motion.div>

        {/* Appreciation message */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 1.8,
            ease: "easeOut"
          }}
        >
          <div 
            className="text-base text-stone-300 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Dziękujemy za udział w dzisiejszym koncercie
          </div>
          
          <div 
            className="text-sm text-stone-400"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Do zobaczenia na kolejnych koncertach
          </div>
        </motion.div>

        {/* Program button */}
        <motion.button
          className="group w-full max-w-sm mx-auto p-4 bg-white/8 border border-white/20 rounded-xl backdrop-blur-sm hover:bg-white/12 hover:border-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between gap-3 relative overflow-hidden"
          onClick={handleShowProgram}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 2.1,
          }}
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />

          <div className="text-left">
            <div className="font-mono text-xs tracking-wider uppercase text-amber-400 mb-1">
              Wspomnienie koncertu
            </div>
            <div className="font-serif text-lg font-semibold text-white">
              Zobacz program
            </div>
          </div>

          <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
            <svg
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5 text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v10M3 8l5-5 5 5" />
            </svg>
          </div>
        </motion.button>

        {/* Final ornamental touch */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 2.4,
            ease: "easeOut"
          }}
        >
          <div 
            className="text-[9px] tracking-[0.5em] uppercase text-amber-400/60"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            ◦ ◦ ◦ Fin ◦ ◦ ◦
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom signature */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: 2.8,
          ease: "easeOut"
        }}
      >
        <div 
          className="text-[8px] tracking-[0.3em] uppercase text-stone-500"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Akademia Muzyczna im. Karola Lipińskiego we Wrocławiu
        </div>
      </motion.div>

      {/* Program modal */}
      {showProgram && (
        <ProgramModal
          program={programData}
          selectedPiece={selectedPiece}
          onClose={handleCloseProgram}
          onPieceClick={handlePieceClick}
          onBackToProgram={handleBackToProgram}
          loading={loadingProgram}
        />
      )}
    </FadeOutWrapper>
  );
}
