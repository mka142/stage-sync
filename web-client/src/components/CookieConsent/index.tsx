import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show consent popup after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] bg-black/85 backdrop-blur-lg border border-white/20 rounded-xl p-5 shadow-2xl"
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.8,
          }}
        >
          <div className="space-y-4">
            {/* Icon and title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 16 16"
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 10V6" />
                  <path d="M8 14v-1" />
                </svg>
              </div>
              <div>
                <div className="font-sans text-sm font-semibold text-white">
                  Pliki cookies
                </div>
                <div className="font-mono text-xs text-amber-400/80">
                  Zgodna na przetwarzanie
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs leading-relaxed text-stone-300">
              <div className="mb-2">
                Ta strona oraz serwer <span className="font-semibold text-white">stage-sync</span> zbierają 
                anonimowe dane o interakcjach użytkowników w celu poprawy działania aplikacji.
              </div>
              <div className="text-stone-400">
                Dane obejmują podstawowe informacje o sposobie korzystania z aplikacji.
                Nie zbieramy danych osobowych.
              </div>
            </div>

            {/* Accept button */}
            <button
              onClick={handleAccept}
              className="w-full p-3 bg-amber-500/15 border border-amber-500/30 rounded-lg font-sans text-sm font-medium text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/40 hover:text-amber-200 active:scale-[0.98] transition-all duration-200 backdrop-blur-sm"
            >
              Rozumiem i akceptuję
            </button>

            {/* Small disclaimer */}
            <div className="text-[10px] text-stone-500 text-center leading-tight">
              Kontynuując korzystanie ze strony wyrażasz zgodę na zbieranie tych danych
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;