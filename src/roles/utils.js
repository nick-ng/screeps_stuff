const utils = require("../utils");

const getFreeSquares = (room, sourcePos, options = {}) => {
  const { swampClear } = options;
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

    switch (terrain.get(position.x, position.y)) {
      case TERRAIN_MASK_WALL:
        return false;
      case TERRAIN_MASK_SWAMP:
        return false || swampClear;
      case 0:
        break;
    }
    return true;
  });
};

module.exports = {
  getFreeSquares,
};
