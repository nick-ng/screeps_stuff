const utils = require("./index");

const creepCost = (creepBody) =>
  creepBody.reduce((prev, curr) => {
    if (typeof curr === "string") {
      return prev + BODYPART_COST[curr];
    }
    return prev + BODYPART_COST[curr.type];
  }, 0);

const getOffTheRoad = (creep) => {
  for (let n = 0; n < 10; n++) {
    const ring = utils.manhattanRing(n, creep.pos);
    for (const pos of ring) {
      const squareContents = creep.room.lookAt(pos.x, pos.y);
      const roads = squareContents.filter(
        (t) =>
          t.type === "structure" && t.structure.structureType === STRUCTURE_ROAD
      );
      if (roads.length > 0) {
        continue;
      }
      const plains = squareContents.filter(
        (t) => t.type === "terrain" && t.terrain === "plain"
      );
      if (plains.length > 0) {
        creep.room.visual.text("😴", pos.x, pos.y);
        if (creep.pos.x !== pos.x || creep.pos.y !== pos.y) {
          creep.moveTo(pos.x, pos.y);
        }
        return true;
      }
    }
  }

  return false;
};

const getCreepsByRole = (room, role) => {
  return room.find(FIND_MY_CREEPS, {
    filter: (creep) => {
      return creep.memory.role === role;
    },
  });
};

const getWorkers = (room) => {
  return getCreepsByRole(room, "worker");
};

const getWorkerBluePrint = (room) => {
  const workers = getWorkers(room);
  const energyCapacityAvailable = room.energyCapacityAvailable;
  if (
    workers.length < 3 ||
    (energyCapacityAvailable < 400 && room.memory.energyPerTick < 1)
  ) {
    return [WORK, CARRY, MOVE];
  }

  return [CARRY, CARRY, WORK, WORK, MOVE, MOVE];
};

const getWorkerCost = (room) => {
  return creepCost(getWorkerBluePrint(room));
};

module.exports = {
  creepCost,
  getOffTheRoad,
  getCreepsByRole,
  getWorkers,
  getWorkerBluePrint,
  getWorkerCost,
};
