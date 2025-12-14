import { create } from "zustand";
import type { CellState } from "../model/CellState";
import type { Dungeon } from "../model/Dungeon";
import { computeFOV } from "../utils/fov";
import type { Token } from "../utils/fov";

interface FogState {
  cells: Record<string, CellState>;
  revealCell: (row: number, col: number) => void;
  hideCell: (row: number, col: number) => void;
  setNote: (row: number, col: number, note: string) => void;
  computeFOV: (dungeon: Dungeon, tokens: Token[]) => void;
}

const key = (r: number, c: number) => `${r},${c}`;

export const useFogStore = create<FogState>((set) => ({
  cells: {},

  revealCell: (row, col) =>
    set((state) => ({
      cells: {
        ...state.cells,
        [key(row, col)]: { visibility: "revealed" }
      }
    })),

  hideCell: (row, col) =>
    set((state) => ({
      cells: {
        ...state.cells,
        [key(row, col)]: { visibility: "hidden" }
      }
    })),

  setNote: (row, col, note) =>
    set((state) => ({
      cells: {
        ...state.cells,
        [key(row, col)]: {
          ...state.cells[key(row, col)],
          note
        }
      }
    })),

  computeFOV: (dungeon: Dungeon, tokens: Token[]) =>
    set((state) => {
      const visible = computeFOV(dungeon, tokens);
      // eslint-disable-next-line no-console
      console.log("in computeFOV", tokens.length, "visible size:", visible.size);
      const newCells: Record<string, CellState> = { ...state.cells };

      for (let r = 0; r < dungeon.height; r++) {
        for (let c = 0; c < dungeon.width; c++) {
          const k = key(r, c);
          if (visible.has(k)) {
            newCells[k] = { ...(newCells[k] || {}), visibility: "revealed" };
          } else {
            const prev = newCells[k];
            if (prev && prev.visibility === "revealed") {
              newCells[k] = { ...prev, visibility: "seen" };
            } else if (!prev) {
              newCells[k] = { visibility: "hidden" };
            }
          }
        }
      }

      return { cells: newCells };
    })
}));
