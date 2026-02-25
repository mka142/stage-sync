import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProgramView, { ConcertProgram } from "@/components/ConcertProgram/ProgramView";
import PieceDetailView from "@/components/ConcertProgram/PieceDetailView";
import { ProgramPiece } from "@/components/ConcertProgram/ProgramItem";

interface ProgramModalProps {
  program: ConcertProgram;
  selectedPiece: ProgramPiece | null;
  onClose: () => void;
  onPieceClick: (piece: ProgramPiece) => void;
  onBackToProgram: () => void;
  loading?: boolean;
}

export function ProgramModal({
  program,
  selectedPiece,
  onClose,
  onPieceClick,
  onBackToProgram,
  loading = false,
}: ProgramModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full h-[90vh] bg-background border-t border-primary/30 rounded-t-3xl overflow-hidden animate-slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="px-7 pt-6 pb-4 border-b border-primary/20 flex items-center justify-between">
          <div className="w-9 h-1 bg-white/15 rounded-full" />
          <div className="font-mono text-xs tracking-wider uppercase text-primary">
            Program koncertu
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4l-8 8M4 4l8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-primary font-mono text-sm">
                Ładowanie programu...
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {selectedPiece ? (
                <motion.div
                  key="piece-detail-modal"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="h-full w-full"
                >
                  <PieceDetailView
                    piece={selectedPiece}
                    onBack={onBackToProgram}
                  />
                </motion.div>
              ) : program ? (
                <motion.div
                  key="program-view-modal"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="h-full overflow-y-auto p-7"
                >
                  <ProgramView program={program} onPieceClick={onPieceClick} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <div className="text-cream/60 font-sans mb-2">
                      Program koncertu
                    </div>
                    <div className="text-cream/40 font-sans text-sm">
                      będzie dostępny wkrótce
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgramModal;