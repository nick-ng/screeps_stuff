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

    const target0 = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    const target1 = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.hitsMax - structure.hits > 0;
      },
    });

    // If nothing to do, get off the road
    if (!target0 && !target1) {
      for (let n = 0; n < 10; n++) {
        const ring = utils.manhattanRing(n, creep.pos);
        for (const pos of ring) {
          const squareContents = creep.room.lookAt(pos.x, pos.y);
          const roads = squareContents.filter(
            (t) =>
              t.type === "structure" && t.structure.structureType === "road"
          );
          if (roads.length > 0) {
            break;
          }
          const plains = squareContents.filter(
            (t) => t.type === "terrain" && t.terrain === "plain"
          );
          if (plains.length > 0) {
            creep.room.visual.text("😴", pos.x, pos.y);
            if (creep.pos.x !== pos.x || creep.pos.y !== pos.y) {
              creep.moveTo(pos.x, pos.y);
            }
            return;
          }
        }
      }
    }

    if (creep.memory.building) {
      if (target0) {
        creep.say("🙂");
        if (creep.build(target0) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target0, {
            visualizePathStyle: { stroke: "#ffffff" },
          });
        }
        return;
      }

      if (target1) {
        creep.say("😮");
        creep.room.visual.circle(target1.pos, {
          fill: "transparent",
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
