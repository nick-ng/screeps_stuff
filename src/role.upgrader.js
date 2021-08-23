const utils = require("./utils");
const creepUtils = require("./utils/creep");

const ROLE_NAME = "upgrader";
const MAX_UNITS = 1;

var roleUpgrader = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      if (spawn.room.memory.energyPerTick < 0) {
        return;
      }

      if (
        creepUtils.getCreepsByRole(spawn.room, ROLE_NAME).length < MAX_UNITS ||
        (spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length <=
          creepUtils.getCreepsByRole(spawn.room, "builder").length &&
          spawn.room.energyAvailable === spawn.room.energyCapacityAvailable)
      )
        spawn.spawnCreep(
          creepUtils.getWorkerBluePrint(spawn.room),
          `${ROLE_NAME}${Game.time}`,
          {
            memory: { role: ROLE_NAME, task: 0 },
          }
        );
    });
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.room.energyAvailable <= 200) {
      if (creep.store[RESOURCE_ENERGY] == 0) {
        return creepUtils.getOffTheRoad(creep);
      } else {
        creep.memory.idle = false;
        creep.memory.upgrading = true;
      }
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
