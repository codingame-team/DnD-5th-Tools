#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadDungeon(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

function inBounds(d, r, c) {
  return r >= 0 && r < d.height && c >= 0 && c < d.width;
}

function checkDungeon(d) {
  const errors = [];
  const warnings = [];

  // basic sizes
  if (!Number.isFinite(d.width) || !Number.isFinite(d.height)) {
    errors.push('Missing width/height');
  } else {
    if (!d.cells || d.cells.length !== d.height)
      errors.push(`cells.length (${d.cells ? d.cells.length : 0}) != height (${d.height})`);
    else if (d.cells.some(row => row.length !== d.width)){
      const bad = d.cells.map((r,i) => (r.length !== d.width ? `${i}(${r.length})` : null)).filter(Boolean);
      errors.push(`rows with wrong length: ${bad.join(',')}`);
    }
  }

  // rooms
  if (d.rooms) {
    d.rooms.forEach((room, idx) => {
      const rId = room.id ?? idx;
      const north = room.north ?? null;
      const south = room.south ?? null;
      const west = room.west ?? null;
      const east = room.east ?? null;
      if ([north,south,west,east].some(v => v == null)) warnings.push(`room ${rId} missing bounds`);
      if (Number.isFinite(north) && Number.isFinite(south) && north > south) errors.push(`room ${rId} north>south`);
      if (Number.isFinite(west) && Number.isFinite(east) && west > east) errors.push(`room ${rId} west>east`);
      if (north != null && (north < 0 || north >= d.height)) errors.push(`room ${rId} north out of bounds: ${north}`);
      if (south != null && (south < 0 || south >= d.height)) errors.push(`room ${rId} south out of bounds: ${south}`);
      if (west != null && (west < 0 || west >= d.width)) errors.push(`room ${rId} west out of bounds: ${west}`);
      if (east != null && (east < 0 || east >= d.width)) errors.push(`room ${rId} east out of bounds: ${east}`);
      // check doors coordinates
      const doors = room.doors || {};
      Object.entries(doors).forEach(([dir, arr]) => {
        if (!Array.isArray(arr)) return;
        arr.forEach((door) => {
          if (!inBounds(d, door.row, door.col)) errors.push(`door in room ${rId} at ${door.row},${door.col} out of bounds`);
        });
      });
      // marks in contents (not uniform) - skip
    });
  } else {
    warnings.push('no rooms array in dungeon');
  }

  // corridor_features
  if (d.corridor_features) {
    Object.entries(d.corridor_features).forEach(([k, feat]) => {
      if (!feat.marks || !Array.isArray(feat.marks)) {
        warnings.push(`corridor feature ${k} without marks`);
        return;
      }
      feat.marks.forEach((m) => {
        if (!inBounds(d, m.row, m.col)) errors.push(`corridor feature ${k} mark ${m.row},${m.col} out of bounds`);
      });
    });
  }

  // stairs
  if (d.stairs) {
    d.stairs.forEach((s, idx) => {
      if (!inBounds(d, s.row, s.col)) errors.push(`stair ${idx} at ${s.row},${s.col} out of bounds`);
    });
  }

  // check cell bits are present
  const bits = d.cell_bit || {};
  if (!bits || typeof bits !== 'object') errors.push('no cell_bit');

  // ensure all doors and corridor features map to a visible cell conditionally
  const nCorridorMarks = Object.values(d.corridor_features||{}).reduce((acc, f) => acc + (Array.isArray(f.marks) ? f.marks.length : 0), 0);
  return { errors, warnings, summary: { rooms: (d.rooms || []).length, corridorMarks: nCorridorMarks, stairs: (d.stairs || []).length } };
}

if (require.main === module) {
  const file = process.argv[2] || 'src/assets/The Prison of Gloomy Woe 01.json';
  const p = path.resolve(file);
  if (!fs.existsSync(p)) {
    console.error('file not found', p);
    process.exit(2);
  }
  const d = loadDungeon(p);
  const r = checkDungeon(d);
  console.log('Summary:', r.summary);
  console.log('Warnings:', r.warnings.join('\n') || 'none');
  console.log('Errors:', r.errors.join('\n') || 'none');
  if (r.errors.length > 0) process.exit(1);
}
