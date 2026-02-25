import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import config from "@/config";
import FadeOutWrapper from "@/components/FadeOutWrapper";

interface ContentData {
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  caption?: string;
  imageEffect?: "grainAnimation" | null;
}

// True stochastic grain — canvas-based, fully unpredictable
function GrainCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const stateRef = React.useRef({
    // per-frame intensity walks randomly
    intensity: 0.32,
    targetInt: 0.32,
    // grain size walks randomly
    grainSize: 1,
    targetSize: 1,
    // slow spatial "clouds" — low-freq noise blobs
    blobs: Array.from({ length: 6 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.15 + Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      str: 0.2 + Math.random() * 0.35,
    })),
    frame: 0,
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function render() {
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      s.frame++;

      // Walk intensity unpredictably
      // Every ~8-40 frames pick a new target (random interval)
      if (s.frame % (8 + Math.floor(Math.random() * 32)) === 0) {
        s.targetInt = 0.08 + Math.random() * 0.52;
      }
      // Lerp speed itself varies — faster spikes, slower fades
      const lerpSpeed = s.intensity < s.targetInt ? 0.12 : 0.04;
      s.intensity = lerp(s.intensity, s.targetInt, lerpSpeed);
      // Add frame-level jitter on top
      const frameInt = s.intensity + (Math.random() - 0.5) * 0.08;

      // Walk grain size
      if (s.frame % (20 + Math.floor(Math.random() * 60)) === 0) {
        s.targetSize = 0.8 + Math.random() * 1.6;
      }
      s.grainSize = lerp(s.grainSize, s.targetSize, 0.03);

      // Move blobs
      s.blobs.forEach((b) => {
        b.x += b.vx + (Math.random() - 0.5) * 0.0003;
        b.y += b.vy + (Math.random() - 0.5) * 0.0003;
        // Wrap
        if (b.x < -0.3) b.x = 1.3;
        if (b.x > 1.3) b.x = -0.3;
        if (b.y < -0.3) b.y = 1.3;
        if (b.y > 1.3) b.y = -0.3;
        // Random velocity nudge
        if (Math.random() < 0.005) {
          b.vx = (Math.random() - 0.5) * 0.0012;
          b.vy = (Math.random() - 0.5) * 0.0012;
        }
      });

      // Build spatial weight map (low-res, 32×32)
      const MAP = 32;
      const weight = new Float32Array(MAP * MAP);
      for (let my = 0; my < MAP; my++) {
        for (let mx = 0; mx < MAP; mx++) {
          const nx = mx / MAP;
          const ny = my / MAP;
          let w = 0.5; // base weight
          s.blobs.forEach((b) => {
            const dx = nx - b.x;
            const dy = ny - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            w += b.str * Math.max(0, 1 - dist / b.r);
          });
          weight[my * MAP + mx] = Math.min(w, 1.4);
        }
      }

      // Draw grain
      ctx.clearRect(0, 0, W, H);

      // Number of grains scales with intensity and frame jitter
      const count = Math.floor(W * H * 0.18 * (0.5 + frameInt));
      const gs = s.grainSize;

      for (let i = 0; i < count; i++) {
        const px = Math.random() * W;
        const py = Math.random() * H;

        // Sample spatial weight at this position
        const mx = Math.min(MAP - 1, Math.floor((px / W) * MAP));
        const my = Math.min(MAP - 1, Math.floor((py / H) * MAP));
        const w = weight[my * MAP + mx];

        // Brightness: mostly white/light, occasionally darker speck
        const bright =
          Math.random() < 0.85
            ? 180 + Math.floor(Math.random() * 75) // light grain
            : 20 + Math.floor(Math.random() * 80); // dark speck

        // Alpha: modulated by spatial weight × global intensity × random spike
        const spike = Math.random() < 0.03 ? 2.5 : 1.0; // rare bright flashes
        const alpha = Math.min(
          1,
          w * frameInt * (0.4 + Math.random() * 0.6) * spike,
        );

        ctx.fillStyle = `rgba(${bright},${bright},${bright},${alpha})`;

        if (gs <= 1 || Math.random() < 0.7) {
          ctx.fillRect(px, py, gs, gs);
        } else {
          // Occasional larger irregular clump
          ctx.beginPath();
          ctx.arc(px, py, gs * (0.5 + Math.random() * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay"
      style={{ zIndex: 2 }}
    />
  );
}

// ImageAnimation Component
interface ImageAnimationProps {
  type: "grainAnimation" | null;
  className?: string;
}

const ImageAnimation: React.FC<ImageAnimationProps> = ({
  type,
  className = "",
}) => {
  if (type !== "grainAnimation") return null;

  return <GrainCanvas />;
};

export default function PieceListeningPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();

  // Extract piece info from payload
  const pieceTitle = payload?.pieceTitle || "";
  const composer = payload?.composer || "";
  const pieceId = payload?.pieceId || "";

  useBackgroundColor(
    config.constants.pagesBackgroundColor.PIECE_LISTENING,
    500,
  );

  React.useEffect(() => {
    sendEvent("page_change", {
      fromPage: "SYSTEM",
      toPage: "PIECE_LISTENING",
      url: window.location.href,
      metadata: {
        pieceId,
        pieceTitle,
        composer,
      },
    });
  }, [sendEvent]);

  return (
    <FadeOutWrapper
      className="h-full relative overflow-hidden"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
    >
      <ContentView
        content={payload.content}
        pieceTitle={pieceTitle}
        composer={composer}
      />
    </FadeOutWrapper>
  );
}

// Content View Component
interface ContentViewProps {
  content: ContentData;
  pieceTitle: string;
  composer: string;
}

const ContentView: React.FC<ContentViewProps> = ({
  content,
  pieceTitle,
  composer,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleImageClick = () => {
    if (content.type === "image" && content.imageUrl) {
      setIsFullscreen(true);
    }
  };

  const handleFullscreenClick = () => {
    setIsFullscreen(false);
  };

  // Fullscreen image view
  if (isFullscreen && content.type === "image" && content.imageUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-black overflow-auto cursor-pointer"
        onClick={handleFullscreenClick}
      >
        <img
          src={content.imageUrl}
          alt=""
          className="min-w-full min-h-full object-contain"
        />
        <ImageAnimation type={content.imageEffect ?? null} />
      </motion.div>
    );
  }
  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Background with gradient based on content type */}
      <div className="absolute inset-0 z-0">
        {content.type === "text" && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 120% 70% at 20% 10%, rgba(139,58,42,0.28) 0%, transparent 55%), 
                          radial-gradient(ellipse 80% 80% at 85% 90%, rgba(196,147,63,0.12) 0%, transparent 55%), 
                          var(--ink)`,
            }}
          />
        )}
        {content.type === "image" && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 100% 60% at 50% 0%, rgba(30,20,10,0.9) 0%, transparent 50%), 
                          radial-gradient(ellipse 100% 50% at 50% 100%, rgba(10,8,6,0.95) 0%, transparent 55%), 
                          #0D0A08`,
            }}
          />
        )}
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-9 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full flex flex-col justify-center"
        >
          {content.type === "text" && (
            <div className="font-display text-xl italic font-normal leading-relaxed text-cream/90">
              {content.content}
            </div>
          )}

          {content.type === "image" && (
            <div className="relative w-full h-full flex flex-col justify-center">
              {content.imageUrl ? (
                <>
                  <div
                    className="relative w-full aspect-[4/3] cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={handleImageClick}
                  >
                    <img
                      src={content.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <ImageAnimation type={content.imageEffect} />
                    {/* Top overlay */}
                    <div
                      className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(13,10,8,0.75) 0%, transparent 100%)",
                      }}
                    />
                    {/* Bottom overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(13,10,8,1) 0%, rgba(13,10,8,0.7) 40%, transparent 100%)",
                      }}
                    />
                    {/* Caption */}
                    {content.caption && (
                      <div className="absolute bottom-24 left-0 right-0 px-8 pointer-events-none">
                        <div className="font-body text-sm italic leading-relaxed text-cream/75">
                          {content.caption}
                        </div>
                      </div>
                    )}
                    {/* Small click indicator - always visible */}
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                      <div className="bg-black/30 text-cream/60 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase backdrop-blur-sm">
                        ⌘
                      </div>
                    </div>
                    {/* Click hint overlay - on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/10">
                      <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase">
                        Kliknij aby powiększyć
                      </div>
                    </div>
                  </div>

                  {/* Content below image if present */}
                  {content.content && (
                    <div className="mt-6">
                      <div className="font-display text-lg italic font-normal leading-relaxed text-cream/85">
                        {content.content}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="w-full aspect-[4/3] flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(160deg, #1a1008 0%, #0a0806 100%)",
                  }}
                >
                  <span className="font-mono text-xs tracking-wider uppercase text-primary/25">
                    obraz
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar - Now Playing */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-7 py-3.5 pb-7">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,8,6,0.98) 0%, rgba(10,8,6,0.85) 60%, transparent 100%)",
          }}
        />
        <div className="relative flex items-center justify-center">
          {/* Now Playing Info */}
          <div className="text-center">
            <div className="font-mono text-xs tracking-wider uppercase text-primary opacity-60 mb-1">
              Trwa wykonanie
            </div>
            <div className="font-display text-sm font-semibold text-cream/80 leading-tight">
              {pieceTitle}
            </div>
            <div className="font-display text-xs italic text-muted">
              {composer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
