import React, { useState } from "react";
import { ProgramPiece } from "./ProgramItem";
import ContentParser from "../ContentParser";

interface PieceDetailViewProps {
  piece: ProgramPiece;
  onBack: () => void;
}

export default function PieceDetailView({ piece, onBack }: PieceDetailViewProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const getStatusBadge = () => {
    if (piece.status === 'current') {
      return (
        <div className="inline-flex items-center gap-1.5 mb-3 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-destructive" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-destructive">
            Obecnie grany
          </span>
        </div>
      );
    }
    
    if (piece.status === 'done') {
      return (
        <div className="inline-flex items-center gap-1.5 mb-3 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted">
            Wykonany
          </span>
        </div>
      );
    }
    
    return null;
  };

  const getTabContent = () => {
    if (!piece.descriptions || piece.descriptions.length === 0) {
      return 'Informacje o utworze będą dostępne wkrótce.';
    }
    
    const selectedDescription = piece.descriptions[activeTab];
    return selectedDescription?.content || 'Opis będzie dostępny wkrótce.';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Hero Section */}
      <div className="flex-1 px-7 pt-7 pb-6 flex flex-col justify-end relative overflow-hidden min-h-80 max-h-80">
       {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 120% 80% at 50% 20%, rgba(139,58,42,0.25) 0%, transparent 60%),
                        radial-gradient(ellipse 80% 60% at 80% 80%, rgba(196,147,63,0.12) 0%, transparent 60%),
                        #1A1612`
          }}
        />
        
        {/* Composer portrait */}
        <div 
          className="w-[88px] h-[88px] rounded flex items-center justify-center flex-shrink-0 relative z-10 mb-4 border"
          style={{
            backgroundColor: 'rgb(var(--color-primary) / 0.1)',
            borderColor: 'rgb(var(--color-border))'
          }}
        >
          <span className="text-center leading-tight text-[9px] tracking-wide text-muted font-mono">
            
            <img src="http://localhost:3001/api/images/3465767d-ade5-48aa-aae8-0d27fbb57969" alt={`${piece.composerName} portrait`} className="absolute inset-0 w-full h-full object-cover rounded" />
          </span>
        </div>
        
        
        {/* Status badge */}
        {getStatusBadge()}
        
        {/* Title and composer */}
        <h1 className="text-[26px] font-black leading-[1.15] mb-1.5 relative z-10 text-foreground font-display">
          {piece.pieceTitle}
        </h1>
        
        <p className="text-base italic mb-1 relative z-10 text-accent font-display">
          {piece.composerName}
        </p>
        
        <p className="text-[9px] tracking-wider relative z-10 text-muted font-mono">
          {piece.compositionYear}
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap flex-shrink-0 border-t border-border">
        {piece.descriptions?.map((description, index) => (
          <button 
            key={description.position}
            onClick={() => setActiveTab(index)}
            className={`flex-1 min-w-fit py-2.5 px-3 text-center bg-transparent border-b-2 transition-all duration-200 text-[8px] tracking-[0.12em] uppercase font-mono ${
              activeTab === index 
                ? 'text-primary border-primary' 
                : 'text-muted border-transparent'
            }`}
          >
            {description.title}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 px-7 pt-5 pb-10 overflow-y-auto scrollbar-none">
        <div className="text-sm leading-[1.75] opacity-80 text-foreground font-body">
          {piece.descriptions && piece.descriptions.length > 0 ? (
            <ContentParser 
              content={getTabContent()} 
              className="text-sm leading-[1.75] opacity-80 text-foreground font-body"
            />
          ) : (
            <div>{getTabContent()}</div>
          )}
        </div>
        
        <button 
          onClick={onBack}
          className="mt-8 hover:opacity-75 transition-opacity flex items-center gap-2 text-primary text-[8px] tracking-[0.2em] uppercase font-mono"
        >
          ← Powrót do programu
        </button>
      </div>
    </div>
  );
}