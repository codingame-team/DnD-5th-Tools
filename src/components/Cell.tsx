import { useFogStore } from "../state/fogStore";

interface Props {
  row: number;
  col: number;
  isMJ: boolean;
}

export default function Cell({ row, col, isMJ }: Props) {
  const { cells, revealCell, hideCell } = useFogStore();
  const cell = cells[`${row},${col}`];

  const visibility = cell?.visibility ?? "hidden";

  return (
    <rect
      x={col * 10}
      y={row * 10}
      width={10}
      height={10}
      fill={
        visibility === "hidden"
          ? "black"
          : visibility === "seen"
          ? "#555"
          : "transparent"
      }
      onClick={() => isMJ && revealCell(row, col)}
      onContextMenu={e => {
        e.preventDefault();
        isMJ && hideCell(row, col);
      }}
    />
  );
}
