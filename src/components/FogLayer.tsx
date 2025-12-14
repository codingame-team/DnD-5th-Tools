import { useFogStore } from "../state/fogStore";

interface Props {
  width: number;
  height: number;
  isMJ: boolean;
}

export default function FogLayer({ width, height, isMJ }: Props) {
  const { cells } = useFogStore();

  return (
    <g>
      {Array.from({ length: height }).map((_, r) =>
        Array.from({ length: width }).map((_, c) => {
          const state = cells[`${r},${c}`];
          const hidden = !isMJ && state?.visibility !== "revealed";

          return hidden ? (
            <rect
              key={`${r}-${c}`}
              x={c * 10}
              y={r * 10}
              width={10}
              height={10}
              fill="black"
            />
          ) : null;
        })
      )}
    </g>
  );
}
