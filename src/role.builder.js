const utils = require("./utils");

const ROLE_NAME = "builder";
const MIN_UNITS = 1;

var roleBuilder = {
  spawn: () => {
    let targets = 0;
    Object.values(Game.rooms).forEach((room) => {
      const targetsb = room.find(FIND_CONSTRUCTION_SITES);
      targets += targetsb.length;
      const targetsc = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.hitsMax - structure.hits > 0;
        },
      });
      targets += targetsc.length;
      const targetsd = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType === "road" &&
            structure.hitsMax - structure.hits > 0
          );
        },
      });
      targets += targetsd.length;
    });

    if (targets > 0) {
      utils.spawn([WORK, CARRY, MOVE], ROLE_NAME, MIN_UNITS, {}, 0);
    }
  },
  /** @param {Creep} creep **/
  run: function (creep) {
    // creep.say(`b ${creep.room.energyAvailable}`);
    // if (creep.room.energyAvailable <= 200 && !creep.memory.building) {
    //   return;
    // }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      const target0 = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (target0) {
        creep.say("🙂");
        if (creep.build(target0) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target0, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
        return;
      }
      const target1 = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.hitsMax - structure.hits > 0;
        },
      });
      if (target1) {
        creep.say("😮");
        creep.room.visual.circle(target1.pos, {
          radius: 3,
          opacity: 0.1,
          stroke: "#ffffff",
        });
        if (creep.repair(target1) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target1, {
            visualizePathStyle: { stroke: "#ffff00" },
          });
        }
        return;
      }
      const target2 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType === "road" &&
            structure.hitsMax - structure.hits > 0
          );
        },
      });
      if (target2) {
        creep.say("😮");
        creep.room.visual.circle(target2.pos, {
          radius: 3,
          opacity: 0.1,
          stroke: "#ffffff",
        });
        if (creep.repair(target2) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target2, {
            visualizePathStyle: { stroke: "#ffff00" },
          });
        }
        return;
      }
    } else {
      const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) =>
          utils.isDepotStructure(structure) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 5,
      });
      if (!storage) {
        return;
      }
      creep.say("🔄");
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
};

module.exports = roleBuilder;
