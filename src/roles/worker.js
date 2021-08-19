const utils = require("../utils");
const tasks = require("./tasks");

const ROLE_NAME = "worker";
const MIN_UNITS = 2;
const MAX_UNITS = 2;

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const creepsOfType = Object.values(Game.creeps).filter(
      (creep) => creep.memory.role === ROLE_NAME
    );
    if (creepsOfType.length < MAX_UNITS) {
      utils.spawn([WORK, CARRY, MOVE], ROLE_NAME, 999, {}, 0);
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    // tasks.upgradezz(creep);
    tasks.harvest(creep);
  },
};
