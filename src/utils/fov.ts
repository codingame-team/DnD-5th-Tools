import type { Dungeon } from "../model/Dungeon";
import { hasBit } from "../model/Bits";

export interface Token {
  row: number;
  col: number;
  radius: number;
}

const key = (r: number, c: number) => `${r},${c}`;

function bresenham(x0: number, y0: number, x1: number, y1: number) {
  const cells: Array<[number, number]> = [];
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  let x = x0;
  let y = y0;
  while (true) {
    cells.push([y, x]); // row, col (y, x)
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return cells;
}

function isOpaque(dungeon: Dungeon, row: number, col: number) {
  if (row < 0 || col < 0 || row >= dungeon.height || col >= dungeon.width)
    return true;
  const v = dungeon.cells[row][col];
  const bits = dungeon.cell_bit || {};
  const block = bits["block"] ?? 1;
  const perimeter = bits["perimeter"] ?? 16;
  // consider a cell opaque if it has block or perimeter bit
  return hasBit(v, block) || hasBit(v, perimeter);
}

export function computeFOV(dungeon: Dungeon, tokens: Token[]) {
  // eslint-disable-next-line no-console
  console.log("computeFOV called with tokens", tokens);
  const visible = new Set<string>();

  for (const t of tokens) {
    const r0 = t.row;
    const c0 = t.col;
    const rmin = Math.max(0, r0 - t.radius);
    const rmax = Math.min(dungeon.height - 1, r0 + t.radius);
    const cmin = Math.max(0, c0 - t.radius);
    const cmax = Math.min(dungeon.width - 1, c0 + t.radius);

    for (let r = rmin; r <= rmax; r++) {
      for (let c = cmin; c <= cmax; c++) {
        const dr = r - r0;
        const dc = c - c0;
        if (dr * dr + dc * dc > t.radius * t.radius) continue;
        // cast line from token center to cell center
        const line = bresenham(c0, r0, c, r);
        // eslint-disable-next-line no-console
        console.log("line length", line.length, "for r", r, "c", c);
        let blocked = false;
        for (const [rr, cc] of line) {
          if (rr === r && cc === c) break; // target cell itself may be opaque but visible
          if (isOpaque(dungeon, rr, cc)) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          visible.add(key(r, c));
          // eslint-disable-next-line no-console
          console.log("adding visible", key(r, c));
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log("visible size before return", visible.size);
  return visible;
}

// `Token` is a TypeScript-only interface; no runtime placeholder is necessary.
