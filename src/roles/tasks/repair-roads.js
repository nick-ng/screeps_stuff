const repairRoads = (creep) => {
  const target2 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      return (
        structure.structureType === "road" &&
        structure.hitsMax - structure.hits > 0
      );
    },
  });

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
