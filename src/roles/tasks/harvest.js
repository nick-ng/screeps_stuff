const utils = require("../../utils");
const taskUtils = require("./utils");
const { DIGGING, HARVESTING, NOTHING } = require("./constants");

const isDepotStructure = (structure) => {
  return (
    structure.structureType == STRUCTURE_EXTENSION ||
    structure.structureType == STRUCTURE_SPAWN ||
    structure.structureType == STRUCTURE_TOWER
  );
};

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

const closestDepot = (creep) => {
  const goals = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        isDepotStructure(structure) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  });

  const b = goals
    .map((goal) => {
      return {
        goal,
        cost: PathFinder.search(creep.pos, { pos: goal.pos, range: 1 }).cost,
      };
    })
    .sort((a, b) => a.cost - b.cost);

  if (b.length === 0) {
    return null;
  }
  return b[0].goal;
};

const getWallsToDig = (creep, source) => {
  const positions = utils.getSquare(1).map((newPos) => {
    return { x: source.pos.x + newPos.x, y: source.pos.y + newPos.y };
  });

  const terrain = Game.map.getRoomTerrain(creep.room.name);

  return positions.filter((position) => {
    const squareContents = creep.room.lookAt(position.x, position.y);

    const hasObstacles = squareContents.some((item) => {
      return OBSTACLE_OBJECT_TYPES.includes(item.type);
    });

    if (hasObstacles) {
      return false;
    }

    return terrain.get(position.x, position.y) === TERRAIN_MASK_WALL;
  });
};

const harvest = (creep) => {
  const creepMemories = [];
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep.memory.task) {
      creep.memory.task = 0;
    }
    if (creep.memory.role === "worker") {
      creepMemories.push(creep.memory);
    }
  }
  const source0 = bestSource(creep, creepMemories);

  if (creep.memory.task <= HARVESTING) {
    creep.memory.task = HARVESTING;
    creep.say("b");
    if (creep.store.getFreeCapacity() > 0) {
      creep.memory.source = source0.id;
      if (creep.harvest(source0) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source0, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else {
        creep.memory.task = NOTHING;
        creep.memory.source = null;
      }
    } else {
      const target0 = closestDepot(creep);
      creep.memory.source = null;

      if (target0) {
        if (creep.transfer(target0, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target0, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      }
    }
  }
};

module.exports = harvest;
