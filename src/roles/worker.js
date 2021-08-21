const utils = require("../utils");
const roleUtils = require("./utils");
const tasks = require("./tasks");

const ROLE_NAME = "worker";

const getWorkers = (spawn) => {
  return spawn.room.find(FIND_MY_CREEPS, {
    filter: (creep) => {
      return creep.memory.role === ROLE_NAME;
    },
  });
};

const getWorkerBluePrint = (spawn) => {
  const workers = getWorkers(spawn);
  const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
  if (workers.length < 2 || energyCapacityAvailable < 400) {
    return [WORK, CARRY, MOVE];
  }

  return [CARRY, CARRY, WORK, WORK, MOVE, MOVE];
};

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      const creeps = getWorkers(spawn);
      const sources = spawn.room.find(FIND_SOURCES);

      const totalFreeSquares = sources
        .map((source) => {
          return roleUtils.getFreeSquares(spawn.room, source.pos);
        })
        .reduce((prev, curr) => prev + curr.length, 0);

      if (creeps.length < totalFreeSquares) {
        utils.spawn(getWorkerBluePrint(spawn), ROLE_NAME, 999, {}, i);
      }
    });
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    // tasks.upgradezz(creep);
    tasks.harvest(creep);
  },
};
