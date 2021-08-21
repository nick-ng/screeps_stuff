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

module.exports = {
  creepCost,
  getOffTheRoad,
};
