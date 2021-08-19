const manhattanRing = (distance) => {
  const ring = [];
  for (let x = 0; x <= distance; x++) {
    const y = distance - x;
    ring.push({ x, y });
    if (y !== 0) ring.push({ x, y: -y });
    if (x !== 0) ring.push({ x: -x, y });
    if (x !== 0 && y !== 0) ring.push({ x: -x, y: -y });
  }
  return ring;
};

const getSquare = (distance) => {
  const square = [];
  for (let x = 0; x <= distance; x++) {
    for (let y = 0; y <= distance; y++) {
      if (y !== 0) {
        square.push({ x, y: -y });
      }
      if (x !== 0) {
        square.push({ x: -x, y });
      }
      if (x !== 0 && y !== 0) {
        square.push({ x, y });
        square.push({ x: -x, y: -y });
      }
    }
  }
  return square;
};

const squareClear = ({ x, y }, room) => {
  const squareContents = room.lookAt(x, y);

  const hasObstacles = squareContents.some((item) => {
    return OBSTACLE_OBJECT_TYPES.includes(item.type);
  });

  if (hasObstacles) {
    return false;
  }
  const terrain = Game.map.getRoomTerrain(room.name);
  switch (terrain.get(x, y)) {
    case TERRAIN_MASK_WALL:
      return false;
    case TERRAIN_MASK_SWAMP:
      return false;
    case 0:
      break;
  }
  return true;
};

const siteClear = ({ x, y }, room) => {
  return [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ].every((coords) => {
    const xx = x + coords.x;
    const yy = y + coords.y;
    return squareClear({ x: xx, y: yy }, room);
  });
};

module.exports = {
  spawn: (blueprint, role, minUnits = 2, options, spawnIndex = 0) => {
    var count = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == role
    ).length;

    if (count < minUnits) {
      var newName = role + Game.time;
      Object.values(Game.spawns)[spawnIndex].spawnCreep(blueprint, newName, {
        memory: { role: role, task: 0 },
        ...options,
      });
    }
  },
  cleanMemory: () => {
    for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory:", name);
      }
    }
  },
  findStores: (creep) =>
    creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        );
      },
    }),
  manhattanRing,
  getSquare,
  squareClear,
  siteClear,
};
