import { useEffect, useState } from "react";
import DungeonMap from "./components/DungeonMap";
import InfoPanel from "./components/InfoPanel";
import type { Dungeon } from "./model/Dungeon";

export default function App() {
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [isMJ, setIsMJ] = useState(true);

  useEffect(() => {
    const dungeonUrl = new URL("./assets/The Prison of Gloomy Woe 01.json", import.meta.url).href;
    fetch(dungeonUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // compute width/height from cells if not present in JSON
        const height = data.height ?? (data.cells ? data.cells.length : 0);
        const width = data.width ?? (data.cells && data.cells[0] ? data.cells[0].length : 0);
        const normalized = { ...data, width, height };
        // eslint-disable-next-line no-console
        console.log("Loaded dungeon:", { width: normalized.width, height: normalized.height, cells: (data.cells || []).length });
        setDungeon(normalized);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error("Failed to load dungeon:", err);
      });
  }, []);

  if (!dungeon) return <p>Loading dungeon…</p>;

  return (
    <>
      <button onClick={() => setIsMJ(!isMJ)}>
        Mode: {isMJ ? "MJ" : "Joueur"}
      </button>
      <div style={{ display: "flex", gap: 16 }}>
        <DungeonMap dungeon={dungeon} onSelect={setSelected} isMJ={isMJ} />
        <InfoPanel dungeon={dungeon} selected={selected} />
      </div>
    </>
  );
}
