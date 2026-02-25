import React from "react";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

export default function OvationPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();

  useBackgroundColor(config.constants.pagesBackgroundColor.OVATION, 500);

  React.useEffect(() => {
    sendEvent('page_change', {
      fromPage: 'SYSTEM',
      toPage: 'OVATION',
      url: window.location.href
    });
  }, [sendEvent]);

  const message = payload?.message || "Brawo!";

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
      {/* Background celebration effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/20 via-amber-600/5 to-transparent opacity-90" />
        
        {/* Floating musical notes */}
        <div 
          className="absolute top-1/4 left-1/4 text-3xl text-amber-500/30 animate-bounce"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            animationDelay: "0s"
          }}
        >
          ♪
        </div>
        <div 
          className="absolute top-1/3 right-1/3 text-4xl text-amber-500/20 animate-bounce"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            animationDelay: "0.5s"
          }}
        >
          ♫
        </div>
        <div 
          className="absolute bottom-1/3 left-1/3 text-2xl text-amber-500/25 animate-bounce"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            animationDelay: "1s"
          }}
        >
          ♪
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 px-8 max-w-lg">
        {/* Applause indicator */}
        <div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500 animate-pulse"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Aplauz
        </div>

        {/* Main celebration message */}
        <div className="space-y-6">
          <h1 
            className="text-[48px] font-black leading-tight text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {message}
          </h1>
          
          <div 
            className="text-lg italic text-amber-200"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Wspaniałe wykonanie!
          </div>
        </div>

        {/* Celebration ornament */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-200" />
          </div>
          <div className="w-12 h-px bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-60" />
        </div>

        {/* Audience appreciation */}
        <div 
          className="text-sm text-stone-300"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Publiczność wyraża swoje uznanie dla artystów
        </div>
      </div>

      {/* Bottom celebration indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500/60 rounded-full animate-pulse" />
          <div 
            className="w-3 h-3 bg-amber-500/60 rounded-full animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div 
            className="w-3 h-3 bg-amber-500/60 rounded-full animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    </FadeOutWrapper>
  );
}
