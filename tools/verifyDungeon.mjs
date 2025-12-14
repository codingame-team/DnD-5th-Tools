#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

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

  if (!Number.isFinite(d.width) || !Number.isFinite(d.height)) {
    // compute width/height from cells
    if (d.cells && d.cells.length) {
      d.height = d.height ?? d.cells.length;
      d.width = d.width ?? (d.cells[0] ? d.cells[0].length : 0);
      warnings.push('Missing width/height, inferred from cells');
    } else {
      errors.push('Missing width/height and cells');
    }
  } else {
    if (!d.cells || d.cells.length !== d.height)
      errors.push(`cells.length (${d.cells ? d.cells.length : 0}) != height (${d.height})`);
    else if (d.cells.some(row => row.length !== d.width)){
      const bad = d.cells.map((r,i) => (r.length !== d.width ? `${i}(${r.length})` : null)).filter(Boolean);
      errors.push(`rows with wrong length: ${bad.join(',')}`);
    }
  }
  // helper to normalize possibly 1-based coords
  function normCoord(val, max, label) {
    // accept 0-based [0, max-1]
    if (typeof val !== 'number') return { ok: false };
    if (val >= 0 && val < max) return { ok: true, val, shifted: false };
    // accept 1-based [1, max]
    if (val >= 1 && val <= max) return { ok: true, val: val - 1, shifted: true };
    return { ok: false };
  }

  // rooms
  if (d.rooms) {
    d.rooms.forEach((room, idx) => {
      if (!room) return;
      const rId = room.id ?? idx;
      let north = room.north ?? null;
      let south = room.south ?? null;
      let west = room.west ?? null;
      let east = room.east ?? null;
      // normalize coordinates that may be 1-based
      if (north != null) {
        const n = normCoord(north, d.height, 'north');
        if (!n.ok) errors.push(`room ${rId} north out of bounds: ${north}`);
        else { if (n.shifted) warnings.push(`room ${rId} north appears 1-based, normalized`); north = n.val; }
      }
      if (south != null) {
        const s = normCoord(south, d.height, 'south');
        if (!s.ok) errors.push(`room ${rId} south out of bounds: ${south}`);
        else { if (s.shifted) warnings.push(`room ${rId} south appears 1-based, normalized`); south = s.val; }
      }
      if (west != null) {
        const w = normCoord(west, d.width, 'west');
        if (!w.ok) errors.push(`room ${rId} west out of bounds: ${west}`);
        else { if (w.shifted) warnings.push(`room ${rId} west appears 1-based, normalized`); west = w.val; }
      }
      if (east != null) {
        const e = normCoord(east, d.width, 'east');
        if (!e.ok) errors.push(`room ${rId} east out of bounds: ${east}`);
        else { if (e.shifted) warnings.push(`room ${rId} east appears 1-based, normalized`); east = e.val; }
      }
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
          const nr = normCoord(door.row, d.height, 'door.row');
          const nc = normCoord(door.col, d.width, 'door.col');
          if (!nr.ok || !nc.ok) {
            errors.push(`door in room ${rId} at ${door.row},${door.col} out of bounds`);
          } else {
            if (nr.shifted || nc.shifted) warnings.push(`door in room ${rId} at ${door.row},${door.col} appears 1-based, normalized`);
          }
        });
      });
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
        const nr = normCoord(m.row, d.height, 'mark.row');
        const nc = normCoord(m.col, d.width, 'mark.col');
        if (!nr.ok || !nc.ok) errors.push(`corridor feature ${k} mark ${m.row},${m.col} out of bounds`);
        else { if (nr.shifted || nc.shifted) warnings.push(`corridor feature ${k} mark ${m.row},${m.col} appears 1-based, normalized`); }
      });
    });
  }

  // stairs
  if (d.stairs) {
    d.stairs.forEach((s, idx) => {
      const nr = normCoord(s.row, d.height, 'stair.row');
      const nc = normCoord(s.col, d.width, 'stair.col');
      if (!nr.ok || !nc.ok) errors.push(`stair ${idx} at ${s.row},${s.col} out of bounds`);
      else { if (nr.shifted || nc.shifted) warnings.push(`stair ${idx} at ${s.row},${s.col} appears 1-based, normalized`); }
    });
  }

  const bits = d.cell_bit || {};
  if (!bits || typeof bits !== 'object') errors.push('no cell_bit');

  const nCorridorMarks = Object.values(d.corridor_features||{}).reduce((acc, f) => acc + (Array.isArray(f.marks) ? f.marks.length : 0), 0);
  return { errors, warnings, summary: { rooms: (d.rooms || []).length, corridorMarks: nCorridorMarks, stairs: (d.stairs || []).length } };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const file = process.argv[2] || 'src/assets/The Prison of Gloomy Woe 01.json';
  const p = path.resolve(file);
  if (!fs.existsSync(p)) {
    console.error('file not found', p);
    process.exit(2);
  }
  const d = loadDungeon(p);
  const r = checkDungeon(d);
  console.log('Summary:', r.summary);
  console.log('Warnings:', r.warnings.length ? '\n' + r.warnings.join('\n') : 'none');
  console.log('Errors:', r.errors.length ? '\n' + r.errors.join('\n') : 'none');
  if (r.errors.length > 0) process.exit(1);
}
