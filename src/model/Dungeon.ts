export interface Mark {
  row: number;
  col: number;
}

export interface Feature {
  key: string;
  summary: string;
  detail: string;
  marks: Mark[];
}

export interface RoomDoor {
  col: number;
  row: number;
  desc: string;
  type: string;
  trap?: string;
  secret?: string;
  out_id?: number;
}

export interface RoomDoors {
  north?: RoomDoor[];
  south?: RoomDoor[];
  east?: RoomDoor[];
  west?: RoomDoor[];
}

export interface RoomContentsDetail {
  [key: string]: string | string[] | undefined;
}

export interface RoomContents {
  detail?: RoomContentsDetail;
  summary?: string;
  inhabited?: string;
}

export interface Room {
  id: string;
  area?: number;
  col?: number;
  row?: number;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  width?: number;
  height?: number;
  shape?: string;
  size?: string;
  polygon?: number;
  contents?: RoomContents;
  doors?: RoomDoors;
  summary?: string;
}

export interface Stair {
  col: number;
  row: number;
  dir: string;
  key: string;
}

export type DungeonSettings = Record<string, string>;

export interface Dungeon {
  width: number;
  height: number;
  cells: number[][];
  rooms: Room[];
  corridor_features: Record<string, Feature>;
  cell_bit: Record<string, number>;
  stairs?: Stair[];
  settings?: DungeonSettings;
  wandering_monsters?: Record<string, string>;
}
