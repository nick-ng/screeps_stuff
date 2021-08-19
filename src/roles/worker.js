const utils = require("../utils");
const roleUtils = require("./utils");
const tasks = require("./tasks");

const ROLE_NAME = "worker";

const getWorkerBluePrint = (availableEnergy) => {
  return [WORK, CARRY, MOVE];
};

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      const creeps = spawn.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
          return creep.memory.role === ROLE_NAME;
        },
      });
      const sources = spawn.room.find(FIND_SOURCES);
      const totalFreeSquares = sources
        .map((source) => {
          return roleUtils.getFreeSquares(spawn.room, source.pos);
        })
        .reduce((prev, curr) => prev + curr.length, 0);

      if (creeps.length < totalFreeSquares) {
        utils.spawn(getWorkerBluePrint(), ROLE_NAME, 999, {}, i);
      }
    });
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    // tasks.upgradezz(creep);
    tasks.harvest(creep);
  },
};
