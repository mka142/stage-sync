import React, { useEffect, useState } from "react";

import "../styles/globals.css";
import "./index.css";

import {
  StateNavigationPage,
  WithStateNavigation,
} from "./providers/StateNavigationProvider";
import BeforeConcert from "./pages/BeforeConcertPage";
import ConcertStartPage from "./pages/ConcertStartPage";
import OvationPage from "./pages/OvationPage";
import RepertoireDisplayPage from "./pages/RepertoireDisplayPage";
import PieceListeningPage from "./pages/PieceListeningPage";
import EndOfConcertPage from "./pages/EndOfConcertPage";
import { LoadingWithBackgroundTransition } from "./components/Loading";
import { UserActivityTrackingProvider } from "./providers/UserActivityTrackingProvider";
import CookieConsent from "./components/CookieConsent";

import { useAppState } from "./hooks/useAppState";
import { EventType } from "./config";
import config from "./config";

function getColor(color: string | { [key: string]: string } | undefined) {
  if (typeof color === "string") {
    return color;
  } else if (typeof color === "object" && color !== null) {
    return color?.color || "#000000";
  } else {
    return "#000000";
  }
}

export function App() {
  const { state, connectionStatus, userId } = useAppState();
  const [loadingState, setLoadingState] = useState({
    shouldBeginTransition: false,
    transitionFinished: false,
  });

  const isLoading =
    connectionStatus !== "connected" ||
    !userId ||
    !loadingState.transitionFinished;

  useEffect(() => {
    if (connectionStatus === "connected" && userId) {
      setLoadingState((prev) => ({ ...prev, shouldBeginTransition: true }));
    } else if (connectionStatus !== "connected" || !userId) {
      setLoadingState({
        shouldBeginTransition: false,
        transitionFinished: false,
      });
    }
  }, [connectionStatus, userId]);

  if (isLoading && !state) {
    return (
      <>
        <LoadingWithBackgroundTransition
          startBackgroundColor="#000000"
          finishBackgroundColor={
            state
              ? getColor(config.constants.pagesBackgroundColor[state.type])
              : "#000000"
          }
          shouldTransitionBegin={loadingState.shouldBeginTransition}
          setTransitionFinished={(finished) =>
            setLoadingState((prev) => ({
              ...prev,
              transitionFinished: finished,
            }))
          }
        />
      </>
    );
  }

  return (
    <>
      <UserActivityTrackingProvider>
        <WithStateNavigation state={state}>
          <StateNavigationPage<EventType>
            pageState="BEFORE_CONCERT"
            component={BeforeConcert}
          />
          <StateNavigationPage<EventType>
            pageState="CONCERT_START"
            component={ConcertStartPage}
          />
          <StateNavigationPage<EventType>
            pageState="REPERTOIRE_DISPLAY"
            component={RepertoireDisplayPage}
          />
          <StateNavigationPage<EventType>
            pageState="PIECE_LISTENING"
            component={PieceListeningPage}
          />
          <StateNavigationPage<EventType>
            pageState="OVATION"
            component={OvationPage}
          />
          <StateNavigationPage<EventType>
            pageState="END_OF_CONCERT"
            component={EndOfConcertPage}
          />
        </WithStateNavigation>
      </UserActivityTrackingProvider>
      
      <CookieConsent />
    </>
  );
}

export default App;
