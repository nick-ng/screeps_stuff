/**
 * @param {number} distance
 * @param {?{x: number, y: number}} origin
 */
const manhattanRing = (distance, origin = null) => {
  const ring = [];
  for (let x = 0; x <= distance; x++) {
    const y = distance - x;
    ring.push({ x, y });
    if (y !== 0) ring.push({ x, y: -y });
    if (x !== 0) ring.push({ x: -x, y });
    if (x !== 0 && y !== 0) ring.push({ x: -x, y: -y });
  }

  if (origin) {
    return ring.map((a) => ({
      x: a.x + origin.x,
      y: a.y + origin.y,
    }));
  }

  return ring;
};

/**
 * @param {number} distance
 * @param {?{x: number, y: number}} origin
 */
const getSquare = (distance, origin = null) => {
  const square = [];
  for (let x = 0; x <= distance; x++) {
    for (let y = 0; y <= distance; y++) {
      if (x !== 0 && y !== 0) {
        square.push({ x, y });
        square.push({ x: -x, y: -y });
        square.push({ x: x, y: -y });
        square.push({ x: -x, y: y });
      } else if (y !== 0) {
        square.push({ x, y: -y });
        square.push({ x, y });
      } else if (x !== 0) {
        square.push({ x: -x, y });
        square.push({ x, y });
      }
    }
  }

  if (origin) {
    return square.map((a) => ({
      x: a.x + origin.x,
      y: a.y + origin.y,
    }));
  }

  return square;
};

const squareClear = ({ x, y }, room, options = {}) => {
  const { swampClear, plainsClear, wallClear, customObstacleFilter } = options;
  const squareContents = room.lookAt(x, y);

  const hasObstacles = squareContents.some((item) => {
    if (typeof customObstacleFilter === "function") {
      return customObstacleFilter(item);
    }
    return (
      OBSTACLE_OBJECT_TYPES.concat(["constructionSite"]).includes(item.type) ||
      (item.type === "structure" && item.structureType !== STRUCTURE_ROAD)
    );
  });

  if (hasObstacles) {
    return false;
  }
  const terrain = Game.map.getRoomTerrain(room.name);
  switch (terrain.get(x, y)) {
    case TERRAIN_MASK_WALL:
      return wallClear || false;
    case TERRAIN_MASK_SWAMP:
      return swampClear || false;
    case 0:
      if (typeof plainsClear === "undefined") {
        return true;
      } else {
        return plainsClear;
      }
  }
  return true;
};

const siteClear = ({ x, y }, room, options) => {
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
    return squareClear({ x: xx, y: yy }, room, options);
  });
};

const isDepotStructure = (structure) => {
  return (
    structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN ||
    structure.structureType == STRUCTURE_TOWER
  );
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
    creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 5
        );
      },
    }),
  manhattanRing,
  getSquare,
  squareClear,
  siteClear,
  isDepotStructure,
};
