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
      <div className="flex-shrink-0 px-7 pt-4 pb-5 relative overflow-hidden bg-background">
       {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 140% 100% at 60% -10%, rgba(139,58,42,0.2) 0%, transparent 55%),
                        radial-gradient(ellipse 80% 60% at 10% 100%, rgba(196,147,63,0.08) 0%, transparent 60%)`
          }}
        />
        
        {/* Thin decorative top rule */}
        <div className="w-7 h-px bg-primary opacity-60 mb-3 relative z-10" />
        
     
        
        
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
        
        {/* Performers Section */}
        {piece.performers && piece.performers.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-primary/[0.18] flex flex-col gap-1.5 relative z-10">
            {/* Ensembles - performers with name "orchestra" */}
            {piece.performers
              .filter(p => p.name.toLowerCase().includes('orchestra') || p.name.toLowerCase().includes('orkiestra'))
              .map((performer) => (
                <div key={`ensemble-${performer.name}-${performer.instrument}`}>
                  <span className="font-serif text-[13px] font-bold text-cream">
                    {performer.name}
                  </span>
                </div>
              ))}
            
            {/* Regular performers - not orchestra, not conductor */}
            {piece.performers
              .filter(p => 
                !p.name.toLowerCase().includes('orchestra') && 
                !p.name.toLowerCase().includes('orkiestra') &&
                !p.instrument.toLowerCase().includes('dyrygent')
              )
              .map((performer) => (
                <div key={`performer-${performer.name}-${performer.instrument}`} className="flex justify-between items-baseline gap-2">
                  <span className="font-serif text-[13px] font-semibold text-cream">
                    {performer.name}
                  </span>
                  <span className="font-sans text-xs italic text-muted flex-shrink-0 text-right">
                    {performer.instrument}
                  </span>
                </div>
              ))}
            
            {/* Conductor - performers with instrument "dyrygent" or "dyrygentka" */}
            {piece.performers
              .filter(p => p.instrument.toLowerCase().includes('dyrygent'))
              .map((conductor) => (
                <div key={`conductor-${conductor.name}-${conductor.instrument}`} className="flex justify-between items-baseline mt-0.5 pt-1.5 border-t border-primary/10">
                  <span className="font-mono text-[8px] tracking-wider uppercase text-primary opacity-70">
                    Dyrygent
                  </span>
                  <span className="font-serif text-[13px] italic font-semibold text-cream">
                    {conductor.name}
                  </span>
                </div>
              ))}
          </div>
        )}
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