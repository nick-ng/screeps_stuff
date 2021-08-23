const utils = require("./index");

const creepCost = (creepBody) =>
  creepBody.reduce((prev, curr) => {
    if (typeof curr === "string") {
      return prev + BODYPART_COST[curr];
    }
    return prev + BODYPART_COST[curr.type];
  }, 0);

const getOffTheRoad = (creep) => {
  creep.memory.idle = true;
  creep.room.visual.text("😴", creep.pos.x, creep.pos.y);
  return true;
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
      const obstacles = squareContents.filter(
        (t) =>
          t.type === "structure" ||
          (t.type === "creep" && pos.x !== creep.pos.x && pos.y !== creep.pos.y)
      );
      if (plains.length > 0 && obstacles.length === 0) {
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

const workerBluePrintPart = [WORK, CARRY, MOVE];

const getWorkerBluePrint = (room) => {
  const workers = getWorkers(room);
  const energyCapacityAvailable = room.energyCapacityAvailable;
  if (workers.length < 1) {
    return workerBluePrintPart;
  }

  const currentWorkerBluePrint = [...workerBluePrintPart];

  for (let n = 0; n < 99; n++) {
    if (
      creepCost(currentWorkerBluePrint.concat(workerBluePrintPart)) >=
      energyCapacityAvailable
    ) {
      return currentWorkerBluePrint;
    }
    currentWorkerBluePrint.push(...workerBluePrintPart);
  }

  return currentWorkerBluePrint;
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
