import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import FadeOutWrapper from "@/components/FadeOutWrapper";
import config from "@/config";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import ProgramView from "@/components/ConcertProgram/ProgramView";
import type { ConcertProgram } from "@/components/ConcertProgram/ProgramView";
import { ProgramPiece } from "@/components/ConcertProgram/ProgramItem";
import PieceDetailView from "@/components/ConcertProgram/PieceDetailView";

interface RepertoireDisplayPageProps extends StateNavigationComponentProps {
  payload: ConcertProgram; // Expecting the concert program data to be passed in payload
}

export default function RepertoireDisplayPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: RepertoireDisplayPageProps) {
  const { sendEvent, events } = useUserActivity();
  const [selectedPiece, setSelectedPiece] = useState<{
    piece: ProgramPiece | null;
    internalTransition: boolean | null;
  }>({ piece: null, internalTransition: null }); // Keep null as initial state

  useBackgroundColor(
    config.constants.pagesBackgroundColor.REPERTOIRE_DISPLAY,
    500,
  );

  React.useEffect(() => {
    sendEvent("page_change", {
      toPage: "REPERTOIRE_DISPLAY",
      url: window.location.href,
      metadata: { internalTransition: false },
    });
  }, [sendEvent]);

  // Use program from payload or fallback to mock data
  const concertProgram: ConcertProgram = payload;

  // Check for current piece and auto-navigate to its detail view
  React.useEffect(() => {
    if (concertProgram?.pieces) {
      const currentPiece = concertProgram.pieces.find(
        (piece) => piece.status === "current",
      );
      if (currentPiece) {
        setSelectedPiece({ piece: currentPiece, internalTransition: false });
        sendEvent("auto_navigate_to_current_piece", {
          fromPage: "REPERTOIRE_DISPLAY",
          metadata: {
            internalTransition: false,
            pieceId: currentPiece.pieceId,
            pieceTitle: currentPiece.pieceTitle,
            composer: currentPiece.composerName,
          },
        });
      } else {
        setSelectedPiece({ piece: null, internalTransition: false });
      }
    }
  }, [concertProgram, sendEvent]);

  const handlePieceClick = (piece: ProgramPiece) => {
    sendEvent("program_piece_clicked", {
      metadata: {
        fromPage: "REPERTOIRE_DISPLAY",
        internalTransition: true,
        pieceId: piece.pieceId,
        pieceTitle: piece.pieceTitle,
        composer: piece.composerName,
      },
    });
    setSelectedPiece({ piece, internalTransition: true });
  };

  const handleBackToProgram = () => {
    setSelectedPiece({ piece: null, internalTransition: true });
    sendEvent("back_to_program", {
      fromPage: "REPERTOIRE_DISPLAY",
      metadata: {
        internalTransition: true,
        fromPiece: selectedPiece?.piece?.pieceId,
      },
    });
  };

  if (selectedPiece.internalTransition === null) {
    // Still determining if this is an auto-transition or user-initiated
    return null; // or a loading spinner
  }

  return (
    <FadeOutWrapper
      className="h-full flex flex-col overflow-auto relative bg-background text-foreground"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
    >
      {/* Background ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-8 text-6xl text-primary/5 leading-none transform rotate-12">
          ♪
        </div>
        <div className="absolute bottom-1/3 left-8 text-4xl text-primary/5 leading-none transform -rotate-12">
          ♫
        </div>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle, rgb(var(--color-primary) / 0.08) 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait" initial={true}>
          {selectedPiece.piece ? (
            <>
              {!selectedPiece.internalTransition ? (
                <motion.div
                  key={`transition-overlay-${selectedPiece.piece.pieceId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <PieceDetailView
                    piece={selectedPiece.piece}
                    onBack={handleBackToProgram}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`piece-detail-${selectedPiece.piece.pieceId}`}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="w-full"
                >
                  <PieceDetailView
                    piece={selectedPiece.piece}
                    onBack={handleBackToProgram}
                  />
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              key={`program-view-${concertProgram?.title || "default"}`}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
              }}
              className="p-8 w-full"
            >
              <ProgramView
                program={concertProgram}
                onPieceClick={handlePieceClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeOutWrapper>
  );
}
