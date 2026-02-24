import React, { useState } from "react";
import { StateNavigationComponentProps } from "@/providers/StateNavigationProvider";
import FadeOutWrapper from "@/components/FadeOutWrapper";
import config from "@/config";
import { useBackgroundColor } from "@/hooks/useBackgroundColor";
import { useUserActivity } from "@/providers/UserActivityProvider";
import ProgramView from "@/components/ConcertProgram/ProgramView";
import type ConcertProgram from "@/components/ConcertProgram/ProgramView";
import { ProgramPiece } from "@/components/ConcertProgram/ProgramItem";
import PieceDetailView from "@/components/ConcertProgram/PieceDetailView";

// Mock data - in real app this would come from payload/API
const MOCK_CONCERT_DATA: ConcertProgram = {
  title: "Wieczór Muzyki Kameralnej",
  subtitle: "Filharmonia Wrocławska",
  date: "25 lutego 2025",
  pieces: [
    {
      pieceId: "kwartet-smyczkowy-julia-labowska-1",
      piecePosition: 1,
      composerName: "Julia Łabowska",
      pieceTitle: "Kwartet smyczkowy",
      durationSeconds: 360,
      compositionYear: 2023,
      descriptions: [
        {
          position: 1,
          title: "o utworze",
          content:
            "Burza jest utworem, który powstał jako jedno z wielu zadań na zajęcia z kontrapunktu. Składa się on z dwóch części– Burza i Tęcza.",
        },
        {
          position: 2,
          title: "o kompozytorce",
          content:
            "Julia Łabowska jest młodą kompozytorką, która od najmłodszych lat była zafascynowana muzyką.",
        },
        {
          position: 3,
          title: "o wykonawcach",
          content:
            "Zuzanna Horna, Natalia Burnagiel, Julia Łabowska i Marysia Kokoszka to utalentowane młode muzyczki.",
        },
      ],
      performers: [
        { name: "Zuzanna Horna", instrument: "Skrzypce I" },
        { name: "Natalia Burnagiel", instrument: "Skrzypce II" },
        { name: "Julia Łabowska", instrument: "Altówka" },
        { name: "Marysia Kokoszka", instrument: "Wiolonczela" },
      ],
      status: "done",
    },
    {
      pieceId: "kwartet-smyczkowy-2",
      piecePosition: 2,
      composerName: "Maurice Ravel",
      pieceTitle: "Kwartet smyczkowy F-dur",
      durationSeconds: 1680,
      compositionYear: 1903,
      descriptions: [
        {
          position: 1,
          title: "o utworze",
          content:
            "Jedyny kwartet smyczkowy Ravela, pełen impresjonistycznych kolorów",
        },
        {
          position: 2,
          title: "o kompozytorze",
          content:
            "Maurice Ravel był francuskim kompozytorem impresjonistycznym, znanym z wyrafinowanej orkiestracji.",
        },
        {
          position: 3,
          title: "analiza",
          content:
            "Utwór składa się z czterech części, każda o unikalnym charakterze i nastroju.",
        },
      ],
      performers: [
        { name: "Performer 1", instrument: "Skrzypce I" },
        { name: "Performer 2", instrument: "Skrzypce II" },
        { name: "Performer 3", instrument: "Altówka" },
        { name: "Performer 4", instrument: "Wiolonczela" },
      ],
      status: "current",
    },
    {
      pieceId: "kwartet-smyczkowy-3",
      piecePosition: 3,
      composerName: "Piotr Czajkowski",
      pieceTitle: "Kwartet smyczkowy nr 1 D-dur",
      durationSeconds: 1920,
      compositionYear: 1871,
      descriptions: [
        {
          position: 1,
          title: "o utworze",
          content: "Młodzieńcze dzieło pełne romantycznej ekspresji",
        },
        {
          position: 2,
          title: "o kompozytorze",
          content:
            "Piotr Iljicz Czajkowski był rosyjskim kompozytorem epoki romantyzmu, twórcą niezapomnianych baletów.",
        },
        {
          position: 3,
          title: "historia",
          content:
            "Kwartet powstał w okresie młodości kompozytora i odzwierciedla jego wczesny styl.",
        },
        {
          position: 4,
          title: "technika",
          content:
            "Utwór wykorzystuje tradycyjne formy kwartetowe w innovacyjny sposób.",
        },
      ],
      performers: [
        { name: "Performer 1", instrument: "Skrzypce I" },
        { name: "Performer 2", instrument: "Skrzypce II" },
        { name: "Performer 3", instrument: "Altówka" },
        { name: "Performer 4", instrument: "Wiolonczela" },
      ],
      status: "upcoming",
    },
  ],
};

export default function RepertoireDisplayPage({
  shouldTransitionBegin,
  setTransitionFinished,
  payload,
}: StateNavigationComponentProps) {
  const { sendEvent } = useUserActivity();
  const [selectedPiece, setSelectedPiece] = useState<ProgramPiece | null>(null);

  useBackgroundColor(
    config.constants.pagesBackgroundColor.REPERTOIRE_DISPLAY,
    500,
  );

  React.useEffect(() => {
    sendEvent("page_change", {
      toPage: "REPERTOIRE_DISPLAY",
      url: window.location.href,
    });
  }, [sendEvent]);

  // Use program from payload or fallback to mock data
  const concertProgram: ConcertProgram = payload;

  const handlePieceClick = (piece: ProgramPiece) => {
    sendEvent("program_piece_clicked", {
      pieceId: piece.pieceId,
      pieceTitle: piece.pieceTitle,
      composer: piece.composerName,
    });
    setSelectedPiece(piece);
  };

  const handleBackToProgram = () => {
    setSelectedPiece(null);
    sendEvent("back_to_program", {
      fromPiece: selectedPiece?.pieceId,
    });
  };

  return (
    <FadeOutWrapper
      className="h-full flex flex-col overflow-auto relative bg-background text-foreground"
      shouldTransitionBegin={shouldTransitionBegin}
      setTransitionFinished={setTransitionFinished}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      {/* Background ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-8 text-6xl text-primary/5 leading-none transform rotate-12">
          ♪
        </div>
        <div className="absolute bottom-1/3 left-8 text-4xl text-primary/5 leading-none transform -rotate-12">
          ♫
        </div>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle, rgb(var(--color-primary) / 0.08) 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full">
        {selectedPiece ? (
          <PieceDetailView piece={selectedPiece} onBack={handleBackToProgram} />
        ) : (
          <div className="p-8">
            <ProgramView
              program={concertProgram}
              onPieceClick={handlePieceClick}
            />
          </div>
        )}
      </div>
    </FadeOutWrapper>
  );
}
