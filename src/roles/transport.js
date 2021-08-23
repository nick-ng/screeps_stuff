const utils = require("../utils");
const roleUtils = require("./utils");
const tasks = require("./tasks");
const creepUtils = require("../utils/creep");

const ROLE_NAME = "transport";

const getBluePrint = (spawn) => {
  return [CARRY, CARRY, MOVE];
};

const closestTarget = (creep, targets) => {
  const b = targets
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

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      if (spawn.room.energyCapacityAvailable < 600) {
        return;
      }
      //   const energyAvailable = spawn.room.energyAvailable;
      const creeps = spawn.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
          return creep.memory.role === ROLE_NAME;
        },
      });

      if (creeps.length === 0) {
        spawn.spawnCreep(getBluePrint(spawn), `${ROLE_NAME}${Game.time}`, {
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
        spawn.store.getUsedCapacity(RESOURCE_ENERGY) >= creepCapacity,
    });
    const extensions = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });

    if (extensions.length > 0 && creep.store[RESOURCE_ENERGY] >= 50) {
      const target = closestTarget(creep, extensions);
      if (target) {
        creep.memory.idle = false;
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#0000ff" },
          });
        }
        return;
      }
    }

    const drops = creep.room
      .find(FIND_DROPPED_RESOURCES)
      .sort((a, b) => (b.energy || 0) - (a.energy || 0));
    if (drops.length > 0) {
      creep.memory.idle = false;
      if (creep.pickup(drops[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(drops[0], {
          visualizePathStyle: { stroke: "#ff0000" },
        });
      }
      return;
    }

    if (spawns.length > 0) {
      const target = closestTarget(creep, spawns);
      if (target) {
        creep.memory.idle = false;
        if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
        return;
      }
    }

    return creepUtils.getOffTheRoad(creep);
  },
};
