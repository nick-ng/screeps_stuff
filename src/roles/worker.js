const utils = require("../utils");
const creepUtils = require("../utils/creep");
const roleUtils = require("./utils");
const tasks = require("./tasks");

const ROLE_NAME = "worker";

const { getWorkers, getWorkerBluePrint, getWorkerCost } = creepUtils;

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const spawns = Game.spawns;
    Object.values(spawns).forEach((spawn, i) => {
      const creeps = getWorkers(spawn.room);

      let maxWorkers = 0;

      if (!spawn.room.memory.sources) {
        maxWorkers = 1;
      } else {
        Object.values(spawn.room.memory.sources).forEach((source) => {
          maxWorkers +=
            source.freeSquares + Math.floor(source.pathToSourceLength / 20);
        });
      }

      if (creeps.length < maxWorkers) {
        utils.spawn(getWorkerBluePrint(spawn.room), ROLE_NAME, 999, {}, i);
      }
    });
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    tasks.harvest(creep);
  },
};
