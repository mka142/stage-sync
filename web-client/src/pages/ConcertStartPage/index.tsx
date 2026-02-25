import React from "react";
import { motion } from "framer-motion";
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
      fromPage: 'SYSTEM',
      toPage: 'CONCERT_START',
      url: window.location.href
    });
  }, [sendEvent]);

  return (
    <FadeOutWrapper
      className="h-full flex flex-col items-center justify-center relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
    >
      {/* Background gradient */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-amber-600/15 via-amber-600/5 to-transparent opacity-80" />
        <motion.div 
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-conic from-amber-500/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 text-center space-y-8 px-8 max-w-md"
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
        {/* Musical symbol */}
        <motion.div 
          className="text-8xl text-amber-500 opacity-90 mx-auto"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic"
          }}
          initial={{ 
            opacity: 0, 
            scale: 0,
            rotate: -180
          }}
          animate={{ 
            opacity: 0.9, 
            scale: 1,
            rotate: 0
          }}
          transition={{ 
            duration: 1.2,
            delay: 0.8,
            ease: "backOut",
            scale: {
              type: "spring",
              stiffness: 200,
              damping: 15
            }
          }}
        >
          ♪
        </motion.div>

        {/* Main heading */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.2,
            ease: "easeOut"
          }}
        >
          <h1 
            className="text-[40px] font-black leading-tight text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {payload.title}
          </h1>
          
          <motion.div 
            className="text-lg italic text-amber-200"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 1.5
            }}
          >
            {payload.subtitle}
          </motion.div>
        </motion.div>

        {/* Elegant divider */}
        <motion.div 
          className="flex items-center justify-center space-x-3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 1.8,
            ease: "easeOut"
          }}
        >
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500 opacity-60" />
          <motion.div 
            className="w-2 h-2 bg-amber-500 rounded-full opacity-80"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500 opacity-60" />
        </motion.div>

        {/* Subtitle */}
        <motion.div 
          className="text-sm tracking-[0.2em] uppercase text-stone-400"
          style={{ fontFamily: "'DM Mono', monospace" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 2.2,
            ease: "easeOut"
          }}
        >
          {payload.footnote}
        </motion.div>
      </motion.div>

      {/* Bottom ornament */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: 2.5,
          ease: "easeOut"
        }}
      >
        <div 
          className="text-xs tracking-[0.4em] uppercase text-amber-500/60"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          ◦ ◦ ◦
        </div>
      </motion.div>
    </FadeOutWrapper>
  );
}
