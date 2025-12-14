import { useState, useEffect } from "react";
import type { Dungeon } from "../model/Dungeon";
import { useFogStore } from "../state/fogStore";
import type { Token } from "../utils/fov";
import { hasBit } from "../model/Bits";

interface Props {
  dungeon: Dungeon;
  onSelect: (cell: { row: number; col: number }) => void;
  isMJ?: boolean;
}

const CELL = 10;

export default function DungeonMap({ dungeon, onSelect, isMJ = false }: Props) {
  const fog = useFogStore();
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    // recompute FOV when dungeon or tokens change
    // eslint-disable-next-line no-console
    console.log("calling computeFOV", tokens.length);
    fog.computeFOV(dungeon, tokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dungeon, tokens]);

  // When a dungeon is loaded and there are no tokens yet, spawn
  // a default player token at the map center so the player sees
  // an initial revealed area instead of a fully black map.
  useEffect(() => {
    if (tokens.length === 0) {
      const startRow = Math.floor(dungeon.height / 2);
      const startCol = Math.floor(dungeon.width / 2);
      setTokens([{ row: startRow, col: startCol, radius: 10 }]);
    }
    // run only when dungeon changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dungeon]);

  function toggleToken(row: number, col: number) {
    setTokens((prev) => {
      const exists = prev.find((t) => t.row === row && t.col === col);
      if (exists) return prev.filter((t) => !(t.row === row && t.col === col));
      return [...prev, { row, col, radius: 6 }];
    });
  }

  const cellsMap = fog.cells || {};

  // eslint-disable-next-line no-console
  console.log("tokens:", tokens.length, "cellsMap keys:", Object.keys(cellsMap).length);
  // helper to determine opaque cells (rooms/walls)
  const isOpaqueCell = (r: number, c: number) => {
    const v = dungeon.cells[r][c];
    const bits = dungeon.cell_bit || {};
    const block = bits["block"] ?? 1;
    const perimeter = bits["perimeter"] ?? 16;
    return hasBit(v, block) || hasBit(v, perimeter);
  };

  // helper: normalize coordinates coming from JSON (1-based or 0-based) to 0-based
  const toZero = (v?: number, max?: number) => {
    if (v == null || typeof v !== 'number') return undefined;
    if (v >= 0 && typeof max === 'number' && v < max) return v; // 0-based
    if (typeof max === 'number' && v >= 1 && v <= max) return v - 1; // 1-based
    return v; // leave as is, caller will check bounds
  };

  // overlay helpers
  const renderRoomsOverlay = () => {
    const rooms = dungeon.rooms || [];
    return (
      <g className="rooms-overlay">
        {rooms.map((room, idx) => {
          if (!room) return null;
          const n = toZero(room.north, dungeon.height);
          const s = toZero(room.south, dungeon.height);
          const w = toZero(room.west, dungeon.width);
          const e = toZero(room.east, dungeon.width);
          if (n == null || s == null || w == null || e == null) return null;
          const rx = w * CELL;
          const ry = n * CELL;
          const rw = (e - w + 1) * CELL;
          const rh = (s - n + 1) * CELL;
          return (
            <g key={room.id ?? idx}>
              <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill="none"
                stroke="#ff6600"
                strokeWidth={0.8}
                opacity={0.8}
                pointerEvents="none"
              />
              <text x={rx + 4} y={ry + 12} fontSize={10} fill="#ff6600">{room.id}</text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderDoorsOverlay = () => {
    const rooms = dungeon.rooms || [];
    const items: any[] = [];
    rooms.forEach((room, rIdx) => {
      if (!room || !room.doors) return;
      Object.entries(room.doors || {}).forEach(([dir, doors]) => {
        (doors || []).forEach((door: any, dIdx: number) => {
          const col = toZero(door.col, dungeon.width);
          const row = toZero(door.row, dungeon.height);
          if (row == null || col == null) return;
          const x = col * CELL + CELL * 0.15;
          const y = row * CELL + CELL * 0.15;
          const size = CELL * 0.7;
          items.push(
            <rect
              key={`door-${rIdx}-${dIdx}-${dir}-${row}-${col}`}
              x={x}
              y={y}
              width={size}
              height={size}
              fill="#0066ff"
              opacity={0.9}
              pointerEvents="none"
              className="door-overlay"
            />
          );
        });
      });
    });
    return <g className="doors-overlay">{items}</g>;
  };

  const renderCorridorMarks = () => {
    const feat = dungeon.corridor_features || {};
    const items: any[] = [];
    Object.entries(feat).forEach(([key, f]) => {
      (f.marks || []).forEach((m, idx) => {
        const col = toZero(m.col, dungeon.width);
        const row = toZero(m.row, dungeon.height);
        if (row == null || col == null) return;
        items.push(
          <circle
            key={`mark-${key}-${idx}-${row}-${col}`}
            cx={col * CELL + CELL / 2}
            cy={row * CELL + CELL / 2}
            r={CELL * 0.35}
            fill="#00cc33"
            opacity={0.9}
            pointerEvents="none"
          />
        );
      });
    });
    return <g className="corridor-overlay">{items}</g>;
  };

  const renderStairsOverlay = () => {
    const items: any[] = [];
    (dungeon.stairs || []).forEach((s, idx) => {
      const col = toZero(s.col, dungeon.width);
      const row = toZero(s.row, dungeon.height);
      if (row == null || col == null) return;
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      const half = CELL * 0.45;
      // triangle
      const p = `${cx},${cy - half} ${cx - half},${cy + half} ${cx + half},${cy + half}`;
      items.push(
        <polygon key={`stair-${idx}-${row}-${col}`} points={p} fill="#cc00ff" opacity={0.9} pointerEvents="none" />
      );
    });
    return <g className="stairs-overlay">{items}</g>;
  };

  // rendering size is responsive via CSS; viewBox already set below
  const safeWidth = dungeon.width ?? 0;
  const safeHeight = dungeon.height ?? 0;
  const viewBoxWidth = safeWidth * CELL;
  const viewBoxHeight = safeHeight * CELL;

  return (
    <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        viewBox={`0 0 ${Number.isFinite(viewBoxWidth) ? viewBoxWidth : 0} ${Number.isFinite(viewBoxHeight) ? viewBoxHeight : 0}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        style={{ border: "1px solid #ccc", maxWidth: "1400px", maxHeight: "80vh" }}
      >
        {isMJ && (
          <g id="debug-overlay">
            {renderRoomsOverlay()}
            {renderDoorsOverlay()}
            {renderCorridorMarks()}
            {renderStairsOverlay()}
          </g>
        )}
      {dungeon.cells.map((row, r) =>
        row.map((_, c) => {
          const k = `${r},${c}`;
          const state = cellsMap[k];
          let fill = isOpaqueCell(r, c) ? "#444" : "#ccc"; // base floor/wall color
          if (!isMJ) {
            if (state?.visibility === "seen") fill = "rgba(128,128,128,0.5)"; // seen (grayed)
            else if (state?.visibility === "hidden") fill = "rgba(0,0,0,0.6)"; // hidden
            // revealed keeps base fill
          }

          const hasToken = tokens.some((t) => t.row === r && t.col === c);

          // determine base fill: MJ sees floor/wall; players see via fog state
          if (isMJ) {
            // MJ: show walls as dark, floors as light
            fill = isOpaqueCell(r, c) ? "#444" : "#ccc";
          }

          return (
            <g key={`${r}-${c}`}>
              <rect
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                fill="transparent"
                onClick={() => onSelect({ row: r, col: c })}
                onDoubleClick={() => toggleToken(r, c)}
                style={{ cursor: "pointer" }}
              />
              <rect
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                fill={fill}
                stroke="#666"
                strokeWidth={0.3}
                pointerEvents="none"
              />
              {hasToken && (
                <circle
                  cx={c * CELL + CELL / 2}
                  cy={r * CELL + CELL / 2}
                  r={CELL / 3}
                  fill="red"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })
      )}
    </svg>
    </div>
  );
}
