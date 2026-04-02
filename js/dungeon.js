// ============================================================
// DUNGEON.JS - Procedural Dungeon Generation (BSP-based)
// ============================================================

const TILE = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  STAIRS_DOWN: 4,
  STAIRS_UP: 5,
  CHEST: 6,
};

class Room {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.centerX = Math.floor(x + w / 2);
    this.centerY = Math.floor(y + h / 2);
    this.connected = false;
  }

  intersects(other, padding = 1) {
    return (
      this.x - padding < other.x + other.w &&
      this.x + this.w + padding > other.x &&
      this.y - padding < other.y + other.h &&
      this.y + this.h + padding > other.y
    );
  }
}

class DungeonGenerator {
  constructor() {
    this.width = 60;
    this.height = 40;
  }

  generate(level) {
    const map = [];
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = TILE.VOID;
      }
    }

    const roomCount = 6 + Math.min(level, 6);
    const rooms = this.placeRooms(map, roomCount);
    this.connectRooms(map, rooms);
    this.placeDoors(map, rooms);
    this.addWalls(map);

    return { map, rooms };
  }

  placeRooms(map, count) {
    const rooms = [];
    let attempts = 0;

    while (rooms.length < count && attempts < 500) {
      attempts++;
      const w = 4 + Math.floor(Math.random() * 6);
      const h = 4 + Math.floor(Math.random() * 5);
      const x = 2 + Math.floor(Math.random() * (this.width - w - 4));
      const y = 2 + Math.floor(Math.random() * (this.height - h - 4));
      const room = new Room(x, y, w, h);

      let overlaps = false;
      for (const other of rooms) {
        if (room.intersects(other, 2)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.carveRoom(map, room);
        rooms.push(room);
      }
    }

    return rooms;
  }

  carveRoom(map, room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        map[y][x] = TILE.FLOOR;
      }
    }
  }

  connectRooms(map, rooms) {
    // Connect rooms using minimum spanning tree approach
    const connected = [rooms[0]];
    const remaining = rooms.slice(1);
    rooms[0].connected = true;

    while (remaining.length > 0) {
      let bestDist = Infinity;
      let bestFrom = null;
      let bestTo = null;
      let bestIdx = -1;

      for (const from of connected) {
        for (let i = 0; i < remaining.length; i++) {
          const to = remaining[i];
          const dist = Math.abs(from.centerX - to.centerX) + Math.abs(from.centerY - to.centerY);
          if (dist < bestDist) {
            bestDist = dist;
            bestFrom = from;
            bestTo = to;
            bestIdx = i;
          }
        }
      }

      if (bestFrom && bestTo) {
        this.carveCorridor(map, bestFrom.centerX, bestFrom.centerY, bestTo.centerX, bestTo.centerY);
        bestTo.connected = true;
        connected.push(bestTo);
        remaining.splice(bestIdx, 1);
      }
    }

    // Add a couple extra connections for loops
    for (let i = 0; i < Math.min(2, rooms.length - 1); i++) {
      const a = rooms[Math.floor(Math.random() * rooms.length)];
      const b = rooms[Math.floor(Math.random() * rooms.length)];
      if (a !== b) {
        this.carveCorridor(map, a.centerX, a.centerY, b.centerX, b.centerY);
      }
    }
  }

  carveCorridor(map, x1, y1, x2, y2) {
    let x = x1;
    let y = y1;

    // Randomly choose horizontal-first or vertical-first
    if (Math.random() < 0.5) {
      while (x !== x2) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          map[y][x] = TILE.FLOOR;
        }
        x += x2 > x1 ? 1 : -1;
      }
      while (y !== y2) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          map[y][x] = TILE.FLOOR;
        }
        y += y2 > y1 ? 1 : -1;
      }
    } else {
      while (y !== y2) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          map[y][x] = TILE.FLOOR;
        }
        y += y2 > y1 ? 1 : -1;
      }
      while (x !== x2) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          map[y][x] = TILE.FLOOR;
        }
        x += x2 > x1 ? 1 : -1;
      }
    }
    if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
      map[y][x] = TILE.FLOOR;
    }
  }

  placeDoors(map, rooms) {
    for (const room of rooms) {
      // Check edges of room for corridor connections
      for (let x = room.x; x < room.x + room.w; x++) {
        this.tryPlaceDoor(map, x, room.y - 1, x, room.y);
        this.tryPlaceDoor(map, x, room.y + room.h, x, room.y + room.h - 1);
      }
      for (let y = room.y; y < room.y + room.h; y++) {
        this.tryPlaceDoor(map, room.x - 1, y, room.x, y);
        this.tryPlaceDoor(map, room.x + room.w, y, room.x + room.w - 1, y);
      }
    }
  }

  tryPlaceDoor(map, cx, cy, rx, ry) {
    if (cx < 0 || cx >= this.width || cy < 0 || cy >= this.height) return;
    if (rx < 0 || rx >= this.width || ry < 0 || ry >= this.height) return;
    // Place door where corridor meets room edge
    if (map[cy][cx] === TILE.FLOOR && map[ry][rx] === TILE.FLOOR) {
      if (Math.random() < 0.3) {
        map[cy][cx] = TILE.DOOR;
      }
    }
  }

  addWalls(map) {
    const wallMap = [];
    for (let y = 0; y < this.height; y++) {
      wallMap[y] = [];
      for (let x = 0; x < this.width; x++) {
        wallMap[y][x] = map[y][x];
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] === TILE.VOID) {
          // Check if adjacent to a floor or door tile
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
                if (map[ny][nx] === TILE.FLOOR || map[ny][nx] === TILE.DOOR) {
                  wallMap[y][x] = TILE.WALL;
                }
              }
            }
          }
        }
      }
    }

    // Copy wall map back
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        map[y][x] = wallMap[y][x];
      }
    }
  }

  getRandomFloorTile(map, rooms, exclude = []) {
    let attempts = 0;
    while (attempts < 200) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const x = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      const y = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
      if (map[y][x] === TILE.FLOOR) {
        const blocked = exclude.some(e => e.x === x && e.y === y);
        if (!blocked) return { x, y, room };
      }
      attempts++;
    }
    // Fallback - scan for any floor tile
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] === TILE.FLOOR) {
          const blocked = exclude.some(e => e.x === x && e.y === y);
          if (!blocked) return { x, y, room: rooms[0] };
        }
      }
    }
    return { x: rooms[0].centerX, y: rooms[0].centerY, room: rooms[0] };
  }
}
