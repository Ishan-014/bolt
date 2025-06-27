import { atom } from "jotai";

export type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "settings"
  | "conversation"
  | "homepage";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "homepage",
};

export const screenAtom = atom<ScreenState>(initialScreenState);