const utils = require("./utils");

const buildRoads = (room) => {
  const sources = room.find(FIND_SOURCES);
  const depots = room.find(FIND_MY_STRUCTURES, {
    filter: utils.isDepotStructure,
  });
  sources.forEach((source) => {
    const target = source.pos.findClosestByPath(depots.map((a) => a.pos));

    if (target && source) {
      const path = room.findPath(source.pos, target, {
        ignoreCreeps: true,
        ignoreRoads: true,
        plainCost: 1,
        swampCost: 1,
      });

      path.forEach((a) => {
        const { x, y } = a;

        if (
          utils.squareClear(a, room, { swampClear: true, wallClear: false })
        ) {
          const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
          if (![0, -7].includes(result)) {
            room.visual.text(result, x, y);
          }
        }
      });

      const square = utils.getSquare(1).map((a) => ({
        x: a.x + source.pos.x,
        y: a.y + source.pos.y,
      }));
      square.forEach((a) => {
        const { x, y } = a;
        if (utils.squareClear(a, room, { swampClear: true, wallClear: true })) {
          // room.visual.text("🚧", x, y);
          // room.createConstructionSite(x, y, STRUCTURE_ROAD);
        }
      });
    }
  });
};

const buildExtension = (room) => {
  const extensions = room.find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_EXTENSION },
  });
  const mySpawns = room.find(FIND_MY_SPAWNS);

  const maxExtensions =
    CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

  // build roads
  buildRoads(room);

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
