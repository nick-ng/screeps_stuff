const searchOptions = {
  filter: (structure) => {
    return (
      structure.structureType === "road" &&
      structure.hitsMax - structure.hits > 0
    );
  },
};

const repairRoads = (creep, maxRange = 3) => {
  const targets = creep.pos.findInRange(
    FIND_STRUCTURES,
    maxRange,
    searchOptions
  );
  if (targets.length === 0) {
    return false;
  }
  const target2 = creep.pos.findClosestByPath(FIND_STRUCTURES, searchOptions);

  if (target2) {
    creep.say("😮");
    creep.room.visual.circle(target2.pos, {
      fill: "transparent",
      radius: 3,
      opacity: 0.5,
      stroke: "#00ff00",
    });
    if (creep.repair(target2) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target2, {
        visualizePathStyle: { stroke: "#ffff00" },
      });
    }
    return true;
  }

  return false;
};

module.exports = repairRoads;
