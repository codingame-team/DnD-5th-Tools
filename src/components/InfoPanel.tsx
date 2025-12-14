import type { Dungeon, RoomDoor } from "../model/Dungeon";
import { hasBit } from "../model/Bits";

interface Props {
  dungeon: Dungeon;
  selected: { row: number; col: number } | null;
}

const directionLabel = (direction: string) =>
  direction.charAt(0).toUpperCase() + direction.slice(1);

const findRoomForCell = (dungeon: Dungeon, row: number, col: number) => {
  const rooms = dungeon.rooms || [];
  return rooms.find((room) => {
    if (!room) return false;
    if (room.north == null || room.south == null || room.west == null || room.east == null) {
      return false;
    }
    return row >= room.north && row <= room.south && col >= room.west && col <= room.east;
  });
};

const renderDetailValue = (value: string | string[] | undefined) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>
    );
  }
  return <p>{value}</p>;
};

export default function InfoPanel({ dungeon, selected }: Props) {
  if (!selected) return <div>Select a cell</div>;

  const { row, col } = selected;
  const value = dungeon.cells[row][col];
  const bits = dungeon.cell_bit;
  const flags = Object.entries(bits)
    .filter(([_, bit]) => hasBit(value, bit))
    .map(([name]) => name);

  const room = findRoomForCell(dungeon, row, col);
  const roomContents = room?.contents;
  const detailEntries = roomContents?.detail
    ? Object.entries(roomContents.detail).filter(([, pieces]) => pieces)
    : [];

  const doorEntries = room?.doors
    ? Object.entries(room.doors).filter(([, list]) => list && list.length > 0)
    : [];

  const feature = Object.values(dungeon.corridor_features).find((f) =>
    f.marks.some((m) => m.row === row && m.col === col)
  );

  const stair = dungeon.stairs?.find((s) => s.row === row && s.col === col);

  // const wanderingMonsters = dungeon.wandering_monsters
  //   ? Object.entries(dungeon.wandering_monsters)
  //   : [];

  return (
    <div style={{ width: 320, padding: 8 }}>
      <h3>Cell {row}, {col}</h3>
      <p style={{ margin: "4px 0", color: "#666" }}>
        {dungeon.settings?.name} {dungeon.settings?.level ? `(Level ${dungeon.settings.level})` : ""}
      </p>

      <strong>Flags</strong>
      <ul>
        {flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>

      {room && (
        <section style={{ marginTop: 12 }}>
          <h4>Room {room.id}</h4>
          <p style={{ margin: "4px 0" }}>{room.summary || roomContents?.summary || "No summary"}</p>
          <p style={{ margin: "4px 0", color: "#666" }}>
            {room.shape || "room"} · {room.size || "unknown"} · {room.width ?? "?"}×{room.height ?? "?"}
          </p>
          {roomContents?.inhabited && <p>Inhabited: {roomContents.inhabited}</p>}
          {detailEntries.length > 0 && (
            <div>
              {detailEntries.map(([key, value]) => (
                <div key={key}>
                  <strong>{key.replace(/_/g, " ")}</strong>
                  {renderDetailValue(value as string | string[])}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {doorEntries.length > 0 && (
        <section style={{ marginTop: 12 }}>
          <h4>Doors</h4>
          {doorEntries.map(([direction, doors]) => (
            <div key={direction} style={{ marginBottom: 8 }}>
              <strong>{directionLabel(direction)}</strong>
              <ul>
                {(doors || []).map((door: RoomDoor) => (
                  <li key={`${direction}-${door.row}-${door.col}-${door.desc}`}>
                    <div>{door.desc}</div>
                    <small style={{ color: "#666" }}>
                      Type: {door.type}{door.trap ? ` · Trap: ${door.trap}` : ""}
                      {door.secret ? ` · Secret: ${door.secret}` : ""}
                      {door.out_id ? ` · Out: ${door.out_id}` : ""}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {feature && (
        <section style={{ marginTop: 12 }}>
          <h4>Corridor feature</h4>
          <p>{feature.summary}</p>
          <p style={{ fontSize: "0.9rem", color: "#444" }}>{feature.detail}</p>
        </section>
      )}

      {stair && (
        <section style={{ marginTop: 12 }}>
          <h4>Stair</h4>
          <p>
            {stair.key} stair heading {directionLabel(stair.dir)} (row {stair.row}, col {stair.col})
          </p>
        </section>
      )}

      {/* {wanderingMonsters.length > 0 && (
        <section style={{ marginTop: 12 }}>
          <h4>Wandering monsters</h4>
          <ul>
            {wanderingMonsters.map(([key, desc]) => (
              <li key={key}>{desc}</li>
            ))}
          </ul>
        </section>
      )} */}
    </div>
  );
}
