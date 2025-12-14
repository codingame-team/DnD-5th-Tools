export type Visibility = "hidden" | "revealed" | "seen";

export interface CellState {
  visibility: Visibility;
  note?: string;
}

// No runtime placeholders: `CellState` is a TypeScript-only interface.
