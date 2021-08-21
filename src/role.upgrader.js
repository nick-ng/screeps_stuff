const utils = require("./utils");
const creepUtils = require("./utils/creep");

const ROLE_NAME = "upgrader";
const MIN_UNITS = 1;

var roleUpgrader = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      if (
        spawn.room.energyAvailable <= creepUtils.getWorkerCost(spawn.room) ||
        spawn.room.memory.energyPerTick < 0
      ) {
        return;
      }
      utils.spawn(
        creepUtils.getWorkerBluePrint(spawn.room),
        ROLE_NAME,
        MIN_UNITS,
        {},
        i
      );
    });
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    if (
      (creep.room.energyAvailable <= 200 ||
        creep.room.memory.energyPerTick < 0) &&
      creep.room.energyAvailable < creep.room.energyCapacityAvailable
    ) {
      if (creep.store[RESOURCE_ENERGY] == 0) {
        return creepUtils.getOffTheRoad(creep);
      } else {
        creep.memory.idle = false;
        creep.memory.upgrading = true;
      }
    }

    if (!creep.memory.upgrading) {
      creep.say("🔄");
    }

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
    } else {
      const storage = utils.findStores(creep)[0];
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
};

module.exports = roleUpgrader;
