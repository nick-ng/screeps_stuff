const utils = require("../../utils");
const taskUtils = require("./utils");
const { UPGRADING, NOTHING } = require("./constants");

const upgradezz = (creep) => {
  if (creep.room.energyAvailable <= 200 && creep.memory.subTask !== "upgrade") {
    creep.memory.task = NOTHING;
    creep.memory.subTask = null;
    creep.say("e");
    return;
  }

  if (
    creep.memory.task === UPGRADING ||
    (creep.memory.task < UPGRADING && creep.room.energyAvailable > 260)
  ) {
    creep.memory.task = UPGRADING;
    creep.say(creep.memory.subTask);
    if (
      creep.memory.subTask !== "harvest" &&
      creep.store[RESOURCE_ENERGY] === 0 &&
      creep.room.energyAvailable > 200
    ) {
      creep.memory.subTask = "harvest";
    } else if (
      creep.memory.subTask !== "upgrade" &&
      creep.store.getFreeCapacity() == 0
    ) {
      creep.memory.subTask = "upgrade";
    } else if (
      creep.memory.subTask === "upgrade" &&
      creep.store[RESOURCE_ENERGY] === 0 &&
      creep.room.energyAvailable <= 200
    ) {
      creep.memory.subTask = null;
      creep.memory.task = NOTHING;
      creep.say("c");
      return;
    }

    if (creep.memory.subTask === "upgrade") {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
    } else if (creep.memory.subTask === "harvest") {
      const storage = taskUtils.getClosestNonEmptyStore(creep);
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  } else {
    creep.memory.task = NOTHING;
    creep.memory.subTask = null;
    creep.say("d");
    return;
  }
  creep.say(creep.memory.subTask);
};

module.exports = upgradezz;
