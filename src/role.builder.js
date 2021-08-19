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
    creep.say(`${creep.room.energyAvailable}`);
    if (creep.room.energyAvailable <= 200) {
      return;
    }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
      }
    } else {
      const storage = utils.findStores(creep)[0];
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
};

module.exports = roleBuilder;
