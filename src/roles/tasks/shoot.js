const { DIGGING } = require("./constants");
const taskUtils = require("./utils");

const shoot = (creep) => {
  const creepMemories = [];
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep.memory.task) {
      creep.memory.task = 0;
    }
    if (creep.memory.role === "worker") {
      creepMemories.push(creep.memory);
    }
  }
  const source0 = taskUtils.bestSource(creep, creepMemories);
  const wallsToDig = taskUtils.getWallsToDig(creep, source0);

  if (
    creep.memory.task <= DIGGING &&
    creepMemories.filter((mem) => mem.source === source0.id).length > 0 &&
    wallsToDig.length > 0
  ) {
    if (!creep.memory.digTarget) {
      creep.memory.digTarget = wallsToDig[0];
    }
    const attackResult = creep.rangedAttack(creep.memory.digTarget);
    console.log(
      "attackResult",
      attackResult,
      JSON.stringify(creep.memory.digTarget)
    );
    if (creep.rangedAttack(creep.memory.digTarget) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.memory.digTarget, {
        visualizePathStyle: { stroke: "#33ff33" },
      });
    }
  }
};

module.exports = shoot;
