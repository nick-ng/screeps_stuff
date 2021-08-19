const utils = require("./utils");

const buildExtension = (room) => {
  const extensions = room.find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_EXTENSION },
  });
  const mySpawns = room.find(FIND_MY_SPAWNS);

  const maxExtensions =
    CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

  // build roads
  const sources = room.find(FIND_SOURCES);
  const depots = room.find(FIND_MY_STRUCTURES, {
    filter: utils.isDepotStructure,
  });
  // console.log("depots", depots);
  sources.forEach((source) => {
    const target = source.pos.findClosestByPath(depots.map((a) => a.pos));

    if (target && source) {
      const path = room.findPath(source.pos, target, {
        ignoreCreeps: true,
        ignoreRoads: true,
        plainCost: 1,
        swampCost: 1,
      });
      // for (let i = 1; i < path.length; i++) {
      //   room.visual.line(path[i].x, path[i].y, path[i - 1].x, path[i - 1].y);
      // }
      path.forEach((a) => {
        const { x, y } = a;
        if (utils.squareClear(a, room, { swampClear: true })) {
          room.createConstructionSite(x, y, STRUCTURE_ROAD);
        }
      });
    }
  });

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
