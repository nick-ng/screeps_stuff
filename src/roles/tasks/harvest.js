const utils = require("../../utils");
const roleUtils = require("../utils");
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

const sortedSources = (creep) => {
  const sources = creep.room.find(FIND_SOURCES);
  const goals = getEmptyDepots(creep).map((a) => ({
    pos: a.pos,
    range: 1,
  }));
  return sources
    .map((source) => {
      // source.pos
      return {
        source,
        cost: PathFinder.search(source.pos, goals).cost,
      };
    })
    .sort((a, b) => a.cost - b.cost)
    .map((a) => a.source);
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

  if (creep.memory.task <= HARVESTING) {
    creep.memory.task = HARVESTING;

    if (typeof creep.memory.source === "string") {
      creep.memory.source = null;
    }
    if (creep.memory.source) {
      const sourceFreeSquares = roleUtils.getFreeSquares(
        creep.room,
        creep.memory.source.pos
      );
      const creepsHarvestingSource = creepMemories.filter(
        (memory) => memory.source && memory.source.id === creep.memory.source.id
      );

      if (creepsHarvestingSource > sourceFreeSquares) {
        creep.memory.source = null;
      }
    } else {
      for (const source of sortedSources(creep)) {
        const sourceFreeSquares = roleUtils.getFreeSquares(
          creep.room,
          source.pos
        );
        const creepsHarvestingSource = creepMemories.filter((memory) => {
          return memory.source && memory.source.id === source.id;
        });

        if (creepsHarvestingSource.length < sourceFreeSquares.length) {
          creep.memory.source = source;
          break;
        }
      }
    }

    if (creep.store.getFreeCapacity() > 0) {
      // creep.say(creep.memory.source.id);
      const source0 = creep.room.find(FIND_SOURCES, {
        filter: (source) => source.id === creep.memory.source.id,
      })[0];
      const result = creep.harvest(source0);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source0, {
          visualizePathStyle: { stroke: "#ffaa00" },
        });
      } else {
        creep.memory.task = NOTHING;
      }
    } else {
      const target0 = closestDepot(creep);

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
