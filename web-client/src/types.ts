export interface Performer {
  name: string;
  instrument: string;
}

export interface PieceData {
  composerName: string;
  pieceTitle: string;
  durationSeconds: number;
  pieceDescription: string;
  performers: Performer[];
  piecePosition: number;
  pieceId: string;
}

// Repertoire-specific types for new digital repertoire pages
export interface RepertoireDisplayData {
  currentPiece: PieceData;
  nextPiece?: PieceData;
  customContent?: {
    title?: string;
    description?: string;
    images?: string[];
    notes?: string[];
  };
}

export interface CurrentPieceData {
  piece: PieceData;
  showPosition?: boolean;
  customTitle?: string;
  customText?: string;
}

export interface PieceTransitionData {
  previousPiece?: PieceData;
  nextPiece: PieceData;
  message?: string;
  duration?: number; // Duration in seconds
}
