const utils = require("./utils");

const ROLE_NAME = "builder";
const MIN_UNITS = 1;

var roleBuilder = {
  spawn: () => {
    let targets = 0;
    Object.values(Game.rooms).forEach((room) => {
      const targetsb = room.find(FIND_CONSTRUCTION_SITES);
      targets += targetsb.length;
    });

    if (targets > 0) {
      utils.spawn([WORK, CARRY, MOVE], ROLE_NAME, MIN_UNITS, {}, 0);
    }
  },
  /** @param {Creep} creep **/
  run: function (creep) {
    creep.say(`b ${creep.room.energyAvailable}`);
    if (creep.room.energyAvailable <= 200 && !creep.memory.building) {
      return;
    }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      const target0 = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target0) {
        if (creep.build(target0) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target0, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      }
    } else {
      const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) =>
          utils.isDepotStructure(structure) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 20,
      });
      if (!storage) {
        return;
      }
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
};

module.exports = roleBuilder;
