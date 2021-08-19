const utils = require("../utils");

const getFreeSquares = (room, sourcePos, swampClear = false) => {
  const positions = utils.getSquare(1).map((newPos) => {
    return { x: sourcePos.x + newPos.x, y: sourcePos.y + newPos.y };
  });

  const terrain = Game.map.getRoomTerrain(room.name);

  return positions.filter((position) => {
    const squareContents = room.lookAt(position.x, position.y);
    const hasObstacles = squareContents.some((item) => {
      return OBSTACLE_OBJECT_TYPES.filter(
        (type) => type !== "creep" && type !== "powerCreep"
      ).includes(item.type);
    });

    if (hasObstacles) {
      return false;
    }

    const terrainValue = terrain.get(position.x, position.y);
    switch (terrainValue) {
      case TERRAIN_MASK_WALL:
        return false;
      case TERRAIN_MASK_SWAMP:
        return swampClear;
      case 0:
        break;
    }
    return true;
  });
};

module.exports = {
  getFreeSquares,
};
