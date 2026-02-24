import React from "react";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

export default function ConcertStartPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();

  useBackgroundColor(config.constants.pagesBackgroundColor.CONCERT_START, 500);

  React.useEffect(() => {
    sendEvent('page_change', {
      toPage: 'CONCERT_START',
      url: window.location.href
    });
  }, [sendEvent]);

  return (
    <FadeOutWrapper
      className="h-full flex flex-col items-center justify-center relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
      style={{ 
        color: '#F5F0E8', 
        fontFamily: "'Cormorant Garamond', serif" 
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/15 via-amber-600/5 to-transparent opacity-80" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-conic from-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 px-8 max-w-md">
        {/* Musical symbol */}
        <div 
          className="text-8xl text-amber-500 opacity-90 animate-pulse mx-auto"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
        >
          ♪
        </div>

        {/* Main heading */}
        <div className="space-y-4">
          <h1 
            className="text-[40px] font-black leading-tight text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Koncert się rozpoczyna
          </h1>
          
          <div 
            className="text-lg italic text-amber-200"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Zapraszamy do zanurzenia się w świecie muzyki
          </div>
        </div>

        {/* Elegant divider */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500 opacity-60" />
          <div className="w-2 h-2 bg-amber-500 rounded-full opacity-80" />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500 opacity-60" />
        </div>

        {/* Subtitle */}
        <div 
          className="text-sm tracking-[0.2em] uppercase text-stone-400"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Przygotuj się na niezapomniane doświadczenie
        </div>
      </div>

      {/* Bottom ornament */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500/60"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          ◦ ◦ ◦
        </div>
      </div>
    </FadeOutWrapper>
  );
}
