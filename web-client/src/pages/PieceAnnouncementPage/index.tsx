import React from "react";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

export default function PieceAnnouncementPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();

  useBackgroundColor(
    config.constants.pagesBackgroundColor.PIECE_ANNOUNCEMENT,
    500
  );

  React.useEffect(() => {
    sendEvent('page_change', {
      toPage: 'PIECE_ANNOUNCEMENT',
      url: window.location.href
    });
  }, [sendEvent]);

  // Extract piece data from payload
  const pieceData = payload || {};
  const pieceTitle = pieceData.pieceTitle || "Utwór";
  const composer = pieceData.composer || "Kompozytor";
  const year = pieceData.year || "";
  const duration = pieceData.duration || "";
  const pieceDescription = pieceData.pieceDescription || "";

  return (
    <FadeOutWrapper
      className="h-full flex flex-col justify-center px-8 relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
      style={{ 
        color: '#F5F0E8', 
        fontFamily: "'Cormorant Garamond', serif" 
      }}
    >
      {/* Background ornamental elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-4 text-6xl text-amber-600/5 leading-none transform rotate-12">
          ♪
        </div>
        <div className="absolute bottom-1/4 left-4 text-4xl text-amber-600/5 leading-none transform -rotate-12">
          ♫
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/8 via-transparent to-transparent opacity-60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg space-y-8">
        {/* Header */}
        <div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500 mb-6"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Kolejny Utwór
        </div>

        {/* Piece title */}
        <div className="space-y-4">
          <h1 
            className="text-[36px] font-black leading-none text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {pieceTitle}
          </h1>
          
          <div 
            className="text-xl italic text-amber-200"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {composer}
          </div>
        </div>

        {/* Piece details */}
        <div className="flex items-center gap-6">
          {year && (
            <div 
              className="text-[10px] tracking-[0.15em] uppercase text-stone-400"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {year}
            </div>
          )}
          
          {duration && (
            <>
              <div className="w-1 h-1 bg-amber-500 rounded-full opacity-60" />
              <div 
                className="text-[10px] tracking-[0.15em] uppercase text-stone-400"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {duration}
              </div>
            </>
          )}
        </div>

        {/* Elegant divider */}
        <div className="w-16 h-px bg-gradient-to-r from-amber-500 to-transparent opacity-70" />

        {/* Description */}
        {pieceDescription && (
          <div 
            className="text-base leading-relaxed text-stone-300 max-w-md"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {pieceDescription}
          </div>
        )}

        {/* Status indicator */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span 
              className="text-[9px] tracking-[0.2em] uppercase text-amber-200"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Przygotuj się na występ
            </span>
          </div>
        </div>
      </div>
    </FadeOutWrapper>
  );
}
