import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";
import ProgramView, { ConcertProgram } from "@/components/ConcertProgram/ProgramView";
import PieceDetailView from "@/components/ConcertProgram/PieceDetailView";
import { ProgramPiece } from "@/components/ConcertProgram/ProgramItem";

// Feature data for about modal
const FEATURES = [
  {
    icon: "🎼",
    title: "Program na bieżąco",
    desc: "Aplikacja automatycznie śledzi przebieg koncertu — zawsze wiesz który utwór jest teraz wykonywany i co będzie następne.",
  },
  {
    icon: "📖",
    title: "Notatki o utworach",
    desc: "Podczas każdego utworu możesz czytać historię jego powstania oraz notatkę o kompozytorze.",
  },
  {
    icon: "🖼️",
    title: "Obrazki i slajdy",
    desc: "Prowadzący będzie wyświetlał dodatkowe materiały — ilustracje, partytury i zdjęcia związane z graną muzyką.",
  },
  {
    icon: "🔕",
    title: "Działa bezgłośnie",
    desc: "Aplikacja nie wydaje żadnych dźwięków. Możesz korzystać z niej swobodnie podczas koncertu — przyciemnij tylko ekran.",
  },
];

interface AboutModalProps {
  onClose: () => void;
}

function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-background border-t border-primary/30 rounded-t-3xl overflow-hidden animate-slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-white/15 rounded-full mx-auto mt-3" />
        <div className="p-7 pb-11">
          <div className="font-mono text-xs tracking-wider uppercase text-primary mb-2">
            Cyfrowy program koncertowy
          </div>
          <div className="font-serif text-2xl font-black text-cream leading-tight mb-1.5">
            Twój przewodnik
            <br />
            po <em className="italic text-accent">koncercie</em>
          </div>
          <div className="font-sans italic text-cream/60 leading-relaxed mb-6">
            Ta aplikacja zastępuje tradycyjną broszurkę — i robi znacznie
            więcej.
          </div>
          <div className="w-full h-px bg-gradient-to-r from-primary/40 to-transparent mb-5" />
          <div className="flex flex-col gap-4 mb-7">
            {FEATURES.map((feature, i) => (
              <div className="flex gap-3.5 items-start" key={i}>
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-sans text-sm font-semibold text-cream mb-0.5">
                    {feature.title}
                  </div>
                  <div className="font-sans text-sm leading-relaxed text-cream/50">
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full p-4 bg-primary/12 border border-primary/30 rounded-xl font-sans text-[15px] font-semibold text-accent hover:bg-primary/20 transition-colors"
            onClick={onClose}
          >
            Rozumiem, zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProgramModalProps {
  program: ConcertProgram | null;
  selectedPiece: ProgramPiece | null;
  onClose: () => void;
  onPieceClick: (piece: ProgramPiece) => void;
  onBackToProgram: () => void;
  loading: boolean;
}

function ProgramModal({ program, selectedPiece, onClose, onPieceClick, onBackToProgram, loading }: ProgramModalProps) {
  return (
    <div 
      className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full h-[90vh] bg-background border-t border-primary/30 rounded-t-3xl overflow-hidden animate-slide-in-from-bottom"
        onClick={e => e.stopPropagation()}
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
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l-8 8M4 4l8 8"/>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="h-full overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-primary font-mono text-sm">Ładowanie programu...</div>
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
                    mass: 0.8 
                  }}
                  className="h-full w-full"
                >
                  <PieceDetailView piece={selectedPiece} onBack={onBackToProgram} />
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
                    mass: 0.8 
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
                    <div className="text-cream/60 font-sans mb-2">Program koncertu</div>
                    <div className="text-cream/40 font-sans text-sm">będzie dostępny wkrótce</div>
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

export default function BeforeConcertPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();
  const [showAbout, setShowAbout] = useState(false);
  const [showProgram, setShowProgram] = useState(false);
  const [programData, setProgramData] = useState<ConcertProgram | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<ProgramPiece | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(false);

  useBackgroundColor(config.constants.pagesBackgroundColor.BEFORE_CONCERT, 500);

  // Get poster image from payload
  const posterUrl = payload?.backgroundImageUrl
    ? payload.backgroundImageUrl
    : "/concert-poster.jpg"; // fallback

  // Track page view for analytics
  React.useEffect(() => {
    sendEvent("page_change", {
      toPage: "BEFORE_CONCERT",
      url: window.location.href,
      internalTransition: false,
    });
  }, [sendEvent]);

  const handleShowProgram = async () => {
    sendEvent("before_concert_show_program", {
      action: "cta_clicked",
    });
    
    setLoadingProgram(true);
    try {
      // Try to fetch current concert program (this might not exist yet)
      // For now, show the program modal with mock data
      const mockProgram: ConcertProgram = {
        title: "Wieczór Muzyki Kameralnej",
        subtitle: "Filharmonia Wrocławska",
        date: "25 lutego 2025",
        pieces: [
          {
            pieceId: "kwartet-1",
            piecePosition: 1,
            composerName: "Franz Schubert",
            pieceTitle: "Kwartet smyczkowy nr 14 d-moll \"Śmierć i Dziewczyna\"",
            durationSeconds: 2520,
            compositionYear: 1824,
            descriptions: [
              {
                position: 1,
                title: "o utworze",
                content: "Jeden z najsłynniejszych kwartetów smyczkowych w historii muzyki, pełen dramatyzmu i ekspresji."
              },
              {
                position: 2,
                title: "o kompozytorze",
                content: "Franz Schubert był austriackim kompozytorem okresu romantyzmu, twórcą ponad 600 pieśni."
              }
            ],
            performers: [
              { name: "Artysta 1", instrument: "Skrzypce I" },
              { name: "Artysta 2", instrument: "Skrzypce II" },
              { name: "Artysta 3", instrument: "Altówka" },
              { name: "Artysta 4", instrument: "Wiolonczela" }
            ],
            status: "upcoming"
          },
          {
            pieceId: "kwartet-2",
            piecePosition: 2,
            composerName: "Maurice Ravel",
            pieceTitle: "Kwartet smyczkowy F-dur",
            durationSeconds: 1680,
            compositionYear: 1903,
            descriptions: [
              {
                position: 1,
                title: "o utworze",
                content: "Jedyny kwartet smyczkowy Ravela, pełen impresjonistycznych kolorów i wyrafinowanej harmonii."
              }
            ],
            performers: [
              { name: "Artysta 1", instrument: "Skrzypce I" },
              { name: "Artysta 2", instrument: "Skrzypce II" },
              { name: "Artysta 3", instrument: "Altówka" },
              { name: "Artysta 4", instrument: "Wiolonczela" }
            ],
            status: "upcoming"
          },
          {
            pieceId: "kwartet-3",
            piecePosition: 3,
            composerName: "Piotr Czajkowski",
            pieceTitle: "Kwartet smyczkowy nr 1 D-dur",
            durationSeconds: 1920,
            compositionYear: 1871,
            descriptions: [
              {
                position: 1,
                title: "o utworze",
                content: "Młodzieńcze dzieło pełne romantycznej ekspresji i melodyjnych linii."
              }
            ],
            performers: [
              { name: "Artysta 1", instrument: "Skrzypce I" },
              { name: "Artysta 2", instrument: "Skrzypce II" },
              { name: "Artysta 3", instrument: "Altówka" },
              { name: "Artysta 4", instrument: "Wiolonczela" }
            ],
            status: "upcoming"
          }
        ]
      };
      
      setProgramData(mockProgram);
      setShowProgram(true);
    } catch (error) {
      console.error("Failed to load program:", error);
      // Still show the program with mock data
      setShowProgram(true);
    } finally {
      setLoadingProgram(false);
    }
  };
  
  const handlePieceClick = (piece: ProgramPiece) => {
    sendEvent("program_piece_preview", {
      pieceId: piece.pieceId,
      pieceTitle: piece.pieceTitle,
      composer: piece.composerName
    });
    setSelectedPiece(piece);
  };
  
  const handleBackToProgram = () => {
    setSelectedPiece(null);
  };
  
  const handleCloseProgram = () => {
    setShowProgram(false);
    setSelectedPiece(null);
    setProgramData(null);
  };

  return (
    <FadeOutWrapper
      className="h-full relative overflow-hidden bg-zinc-900"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
    >
      {/* About button */}
      <button
        className="absolute top-14 right-5 z-20 flex items-center gap-1 px-3 py-1.5 bg-black/35 border border-white/20 rounded-full backdrop-blur-sm hover:bg-black/55 hover:border-primary/40 transition-all"
        onClick={() => setShowAbout(true)}
      >
        <div className="w-3.5 h-3.5 border-2 border-white/50 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-xs text-white/70 leading-none">
            i
          </span>
        </div>
        <span className="font-mono text-xs tracking-wider uppercase text-white/65">
          O aplikacji
        </span>
      </button>

      {/* Full-screen poster with dark background */}
      <div className="absolute inset-0 z-0 bg-black flex items-start justify-center pt-20">
        <img
          src={posterUrl}
          alt="Plakat koncertu"
          className="w-full h-auto max-h-screen object-contain"
        />
      </div>

      {/* Enhanced gradient overlays for smooth black transition */}
      <div className="absolute top-0 left-0 right-0 h-[25vh] bg-gradient-to-b from-black via-black/80 via-black/60 via-black/40 via-black/20 to-transparent pointer-events-none z-1" />
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] bg-gradient-to-t from-black via-black/95 via-black/85 via-black/70 via-black/50 via-black/30 to-transparent pointer-events-none z-1" />

      {/* Bottom content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col justify-end p-8 pb-14"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.8,
          delay: 0.2
        }}
      >
        {/* Waiting badge */}
        <motion.div 
          className="inline-flex items-center gap-2 mb-5 self-start"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.4
          }}
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="font-mono text-xs tracking-wider uppercase text-accent drop-shadow-lg">
            Koncert rozpocznie się za chwilę
          </span>
        </motion.div>

        {/* CTA button with glow effect */}
        <motion.button
          className="group w-full p-5 bg-white/8 border border-white/25 rounded-xl backdrop-blur-2xl hover:bg-white/15 hover:border-primary/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between gap-3 relative overflow-hidden shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)]"
          onClick={handleShowProgram}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.6
          }}
        >
          {/* Glowing background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none animate-pulse" />

          <div className="text-left">
            <div className="font-mono text-xs tracking-wider uppercase text-primary mb-1">
              Kliknij aby otworzyć
            </div>
            <div className="font-serif text-xl font-bold text-white leading-tight">
              Program koncertu
            </div>
          </div>

          <div className="w-10 h-10 bg-primary/25 border border-primary/50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/40 transition-colors shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]">
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </motion.button>
      </motion.div>

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      
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
