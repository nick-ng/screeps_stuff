const utils = require("../../utils");

const { isDepotStructure } = utils;

const getEmptyDepots = (creep) => {
  return creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        isDepotStructure(structure) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });
};

const getClosestNonEmptyStore = (creep) => {
  const stores = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        isDepotStructure(structure) &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 10
      );
    },
  });

  const sortedStores = stores
    .map((a) => {
      return {
        store: a,
        cost: PathFinder.search(creep.pos, { pos: a.pos, range: 1 }),
      };
    })
    .sort((a, b) => a.cost - b.cost);
  if (sortedStores.length === 0) {
    return null;
  }

  return sortedStores[0].store;
};

const bestSource = (creep) => {
  const sources = creep.room.find(FIND_SOURCES);
  const goals = getEmptyDepots(creep).map((a) => ({
    pos: a.pos,
    range: 1,
  }));
  const b = sources
    .map((source) => {
      // source.pos
      return {
        source,
        cost: PathFinder.search(source.pos, goals).cost,
      };
    })
    .sort((a, b) => a.cost - b.cost);
  return b[0].source;
};

const getWallsToDig = (creep, source) => {
  const roomPosition = creep.room.getPositionAt(source.pos.x, source.pos.y);
  const a = roomPosition.findInRange(FIND_STRUCTURES);

  return [];
  const positions = utils.getSquare(1).map((newPos) => {
    return { x: source.pos.x + newPos.x, y: source.pos.y + newPos.y };
  });

  const terrain = Game.map.getRoomTerrain(creep.room.name);

  return positions
    .filter((position) => {
      const squareContents = creep.room.lookAt(position.x, position.y);

      const hasObstacles = squareContents.some((item) => {
        return OBSTACLE_OBJECT_TYPES.includes(item.type);
      });

      if (hasObstacles) {
        return false;
      }

      return terrain.get(position.x, position.y) === TERRAIN_MASK_WALL;
    })
    .map((position) => creep.room.getPositionAt(position.x, position.y));
};

module.exports = {
  bestSource,
  getEmptyDepots,
  isDepotStructure,
  getWallsToDig,
  getClosestNonEmptyStore,
};
