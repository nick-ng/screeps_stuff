const utils = require("./utils");
const creepUtils = require("./utils/creep");

const ROLE_NAME = "builder";
const MAX_UNITS = 1;

const buildTarget = (creep) => {
  const targeta = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => {
      const look = creep.room.lookAt(site.pos);
      const isRoad =
        look.filter(
          (item) =>
            item.type === "constructionSite" &&
            item.constructionSite.structureType === "road"
        ).length > 0;
      const isSwamp =
        look.filter(
          (item) => item.type === "terrain" && item.terrain === "swamp"
        ).length > 0;
      return isRoad && isSwamp;
    },
  });

  if (targeta) {
    return targeta;
  }

  return creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
};

var roleBuilder = {
  spawn: () => {
    Object.values(Game.spawns).forEach((spawn) => {
      const constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
      const repairSites = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.hitsMax - structure.hits > 0;
        },
      });

      if (constructionSites.length === 0 && repairSites.length === 0) {
        return;
      }

      if (creepUtils.getCreepsByRole(spawn.room, "worker").length === 0) {
        return;
      }

      if (
        creepUtils.getCreepsByRole(spawn.room, ROLE_NAME).length < MAX_UNITS ||
        spawn.room.energyAvailable === spawn.room.energyCapacityAvailable
      ) {
        spawn.spawnCreep(
          creepUtils.getWorkerBluePrint(spawn.room),
          `${ROLE_NAME}${Game.time}`,
          {
            memory: { role: ROLE_NAME, task: 0 },
          }
        );
      }
    });
  },
  /** @param {Creep} creep **/
  run: (creep) => {
    // creep.say(`b ${creep.room.energyAvailable}`);
    const workers = creep.room.find(FIND_MY_CREEPS, {
      filter: (creepa) => {
        return creepa.memory.role === "worker";
      },
    });

    if (
      creep.room.energyAvailable <= creepUtils.getWorkerCost(creep.room) &&
      workers.length < 1 &&
      creep.store[RESOURCE_ENERGY] === 0
    ) {
      creepUtils.getOffTheRoad(creep);
      return;
    }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
    }

    const target0 = buildTarget(creep);
    const target1 = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.hitsMax - structure.hits > 0;
      },
    });

    // If nothing to do, get off the road
    if (!target0 && !target1) {
      creepUtils.getOffTheRoad(creep);
      return;
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
