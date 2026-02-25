import React from "react";
import ProgramItem, { ProgramPiece } from "./ProgramItem";

export interface ConcertProgram {
  title: string;
  suptitle?: string;
  subtitle: string;
  date: string;
  pieces: ProgramPiece[];
}

interface ProgramViewProps {
  program: ConcertProgram;
  onPieceClick?: (piece: ProgramPiece) => void;
}

export default function ProgramView({
  program,
  onPieceClick,
}: ProgramViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="text-xs tracking-[0.4em] uppercase font-mono text-primary-dark">
          {program.suptitle || "Program koncertu"}
        </div>

        <h1 className="text-[32px] font-black leading-tight text-foreground font-display">
          {program.title}
        </h1>

        <div className="text-base italic text-accent font-body">
          {program.subtitle} · {program.date}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-primary to-transparent opacity-70 ml-[16px]" />

      {/* Pieces list */}
      <div className="space-y-2">
        {program.pieces.map((piece, index) => (
          <>
            <ProgramItem
              key={piece.pieceId}
              piece={piece}
              isLast={index === program.pieces.length - 1}
              onClick={onPieceClick}
            />
            <div className="max-w-full w-auto h-px bg-primary/30 opacity-70 ml-[16px]" />
          </>
        ))}
      </div>

      {/* Concert Footer */}
      <div className="mt-12 pt-8 border-t border-primary/15">
        <div className="space-y-3 text-center">
          <div className="font-mono text-[8px] tracking-wider uppercase text-muted mb-4">
            ◦ ◦ ◦
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-wide text-muted">
                Redakcja programu:
              </span>
              <span className="font-serif text-cream">Dominik Łabuda</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-wide text-muted">
                Opieka merytoryczna:
              </span>
              <span className="font-serif text-cream text-right">
                mgr Urszula Koza, mgr Joanna Kołodziejska
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-wide text-muted">
                Grafika koncertowa:
              </span>
              <span className="font-serif text-cream">Lena Czekaj</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-wide text-muted">
                Skład programu:
              </span>
              <span className="font-serif text-cream">Dominik Łabuda</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-wide text-muted">
                Skład i opracowanie programu cyfrowego:
              </span>
              <span className="font-serif text-cream">
                Michał Kulbacki, Oleś Kulczewicz
              </span>
            </div>
          </div>

          <div className="font-mono text-[8px] tracking-wider uppercase text-muted mt-6 opacity-60">
            ◦ ◦ ◦
          </div>
        </div>
      </div>
    </div>
  );
}
