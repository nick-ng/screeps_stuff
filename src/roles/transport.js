const utils = require("../utils");
const roleUtils = require("./utils");
const tasks = require("./tasks");
const creepUtils = require("../utils/creep");

const ROLE_NAME = "transport";

const getBluePrint = (spawn) => {
  return [CARRY, CARRY, MOVE];
};

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      //   const energyAvailable = spawn.room.energyAvailable;
      const creeps = spawn.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
          return creep.memory.role === ROLE_NAME;
        },
      });
      const extensions = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });

      if (extensions.length > 0 && creeps.length === 0) {
        spawn.spawnCreep(getBluePrint(spawn), ROLE_NAME, {
          memory: {
            role: ROLE_NAME,
            task: 0,
          },
        });
      }
    });
  },

  /** @param {Creep} creep **/
  run: (creep) => {
    const creepCapacity =
      creep.body.filter((bodyPart) => bodyPart.type === CARRY).length * 50;
    const spawns = creep.room.find(FIND_MY_SPAWNS, {
      filter: (spawn) =>
        spawn.store.getUsedCapacity(RESOURCE_ENERGY) > creepCapacity,
    });

    if (spawns.length === 0) {
      return creepUtils.getOffTheRoad(creep);
    }
    creep.memory.idle = false;
  },
};
