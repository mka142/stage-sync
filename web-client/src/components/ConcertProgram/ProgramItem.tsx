import React from "react";
import clsx from "clsx";

export interface PieceImage {
  id: string;
  filename: string;
  originalName: string;
  uploadedAt: string;
  description?: string;
  alt?: string;
}

export interface ProgramPiece {
  pieceId: string;
  piecePosition: number;
  composerName: string;
  pieceTitle: string;
  durationSeconds: number;
  compositionYear: number;
  descriptions: Array<{
    position: number;
    title: string;
    content: string;
  }>;
  performers: Array<{
    name: string;
    instrument: string;
  }>;
  images?: PieceImage[];
  status?: "current" | "done" | "upcoming";
}

interface ProgramItemProps {
  piece: ProgramPiece;
  isLast: boolean;
  onClick?: (piece: ProgramPiece) => void;
}

export default function ProgramItem({
  piece,
  isLast,
  onClick,
}: ProgramItemProps) {
  const getOpacity = () => {
    if (piece.status === 'done') return 'opacity-40';
    if (piece.status === 'upcoming') return 'opacity-60';
    return '';
  };

  return (
    <div
      className={`flex gap-4 py-4 cursor-pointer hover:bg-primary/5 transition-colors rounded-lg  ${getOpacity()}`}
      onClick={() => onClick?.(piece)}
    >
      {/* Number column */}
      <div className="flex flex-col items-center min-w-[32px]">
        <div className="text-sm text-primary mb-2 font-mono">
          {piece.piecePosition}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-primary/30 min-h-[60px]" />
        )}
      </div>

      {/* Info column */}
      <div className="flex-1 space-y-2">
        {/* Status badges */}
        {piece.status === "current" && (
          <div className="inline-flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[8px] tracking-[0.2em] uppercase text-accent font-mono">
              Teraz grane
            </span>
          </div>
        )}

        {piece.status === "done" && (
          <div className="inline-flex items-center gap-2">
            <span className="text-[8px] tracking-[0.2em] uppercase text-muted font-mono">
              ✓ Zagrane
            </span>
          </div>
        )}

        {/* Title */}
        <div
          className={clsx(`text-lg text-foreground leading-tight text-left font-display`, {
            "font-semibold": piece.status === "current",
            "font-normal": piece.status !== "current",
          })}
        >
          {piece.pieceTitle}
        </div>

        {/* Composer and year */}
        <div className="text-sm italic text-accent font-body">
          {piece.composerName} · {piece.compositionYear}
        </div>

        {/* Description */}
        {piece.descriptions && piece.descriptions[0] && (
          <div className="text-xs text-muted leading-relaxed font-body">
            {piece.descriptions[0].content.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </div>
        )}

        {/* Duration */}
        <div className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono">
          ~{Math.ceil(piece.durationSeconds / 60)} min
        </div>
      </div>
    </div>
  );
}
