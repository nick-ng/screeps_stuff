const utils = require("./utils");

const buildExtension = (room) => {
  const extensions = room.find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_EXTENSION },
  });
  const mySpawns = room.find(FIND_MY_SPAWNS);

  const maxExtensions =
    CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

  if (maxExtensions > extensions.length) {
    for (let i = 2; i < 3; i++) {
      const sites = utils.manhattanRing(i);
      for (const site of sites) {
        const actualX = mySpawns[0].pos.x + site.x;
        const actualY = mySpawns[0].pos.y + site.y;
        if (utils.siteClear({ x: actualX, y: actualY }, room)) {
          room.createConstructionSite(actualX, actualY, STRUCTURE_EXTENSION);
          return;
        }
      }
    }
  }
};

module.exports = {
  build: () => {
    Object.values(Game.rooms).forEach((room) => {
      buildExtension(room);
    });
  },
};
