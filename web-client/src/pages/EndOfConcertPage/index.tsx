import React from "react";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

export default function EndOfConcertPage({
  shouldTransitionBegin,
  setTransitionFinished,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();

  useBackgroundColor(
    config.constants.pagesBackgroundColor.END_OF_CONCERT,
    2000
  );

  React.useEffect(() => {
    sendEvent('page_change', {
      toPage: 'END_OF_CONCERT',
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
      {/* Background with elegant farewell atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial gradient as defined in config */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/8 via-transparent to-transparent opacity-70" />
        
        {/* Decorative musical elements */}
        <div 
          className="absolute top-1/4 right-1/4 text-5xl text-amber-600/10 transform rotate-12 animate-pulse"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
        >
          ♪
        </div>
        <div 
          className="absolute bottom-1/4 left-1/4 text-4xl text-amber-600/10 transform -rotate-12 animate-pulse delay-75"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
        >
          ♫
        </div>
        <div 
          className="absolute top-1/2 left-1/5 text-3xl text-amber-600/10 animate-pulse delay-150"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
        >
          ♪
        </div>
      </div>

      {/* Main farewell content */}
      <div className="relative z-10 text-center space-y-10 px-8 max-w-lg">
        {/* Header */}
        <div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Koniec Koncertu
        </div>

        {/* Main farewell */}
        <div className="space-y-6">
          <h1 
            className="text-[52px] font-black leading-tight text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dziękujemy
          </h1>
          
          <div 
            className="text-xl italic text-amber-200 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Za wspólne przeżycie tego wyjątkowego wieczoru muzycznego
          </div>
        </div>

        {/* Elegant divider */}
        <div className="flex items-center justify-center space-x-4 py-6">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
          <div className="w-3 h-3 bg-amber-500 rounded-full opacity-70" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-60" />
        </div>

        {/* Appreciation message */}
        <div className="space-y-4">
          <div 
            className="text-base text-stone-300 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Mamy nadzieję, że muzyka poruszyła Twoje serce i zostawi trwałe wspomnienia
          </div>
          
          <div 
            className="text-sm text-stone-400"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Do zobaczenia na kolejnych koncertach
          </div>
        </div>

        {/* Final ornamental touch */}
        <div className="pt-4">
          <div 
            className="text-[9px] tracking-[0.5em] uppercase text-amber-400/60"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            ◦ ◦ ◦ Fin ◦ ◦ ◦
          </div>
        </div>
      </div>

      {/* Bottom signature */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div 
          className="text-[8px] tracking-[0.3em] uppercase text-stone-500"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Filharmonia Wrocławska
        </div>
      </div>
    </FadeOutWrapper>
  );
}
