const utils = require("../utils");
const tasks = require("./tasks");

const ROLE_NAME = "shooter";
const MAX_UNITS = 1;

module.exports = {
  roleName: ROLE_NAME,
  spawn: () => {
    const creepsOfType = Object.values(Game.creeps).filter(
      (creep) => creep.memory.role === ROLE_NAME
    );
    if (creepsOfType.length < MAX_UNITS) {
      utils.spawn([RANGED_ATTACK, MOVE], ROLE_NAME, 999, {}, 0);
    }
  },

  /** @param {Creep} creep **/
  run: function (creep) {
    tasks.shoot(creep);
  },
};
