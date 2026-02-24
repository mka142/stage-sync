import React from "react";
import ProgramItem, { ProgramPiece } from "./ProgramItem";

export interface ConcertProgram {
  title: string;
  subtitle: string;
  date: string;
  pieces: ProgramPiece[];
}

interface ProgramViewProps {
  program: ConcertProgram;
  onPieceClick?: (piece: ProgramPiece) => void;
}

export default function ProgramView({ program, onPieceClick }: ProgramViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="text-xs tracking-[0.4em] uppercase font-mono text-primary-dark">
          Wieczór Muzyki Kameralnej
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
    </div>
  );
}