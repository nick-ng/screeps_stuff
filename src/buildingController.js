const utils = require("./utils");

const roadObstacleFilter = (item) => {
  if (item.type === "structure") {
    return true;
  }
  if (item.type === "constructionSite") {
    return true;
  }
  return OBSTACLE_OBJECT_TYPES.includes(item.type);
};

const buildRoads = (room) => {
  let extraRoadPos = {};
  let extraRoadValue = 10;
  let buildExtraRoad = false;
  Object.keys(room.memory.roads).forEach((key) => {
    const [x, y] = key.split("_").map((a) => parseInt(a, 10));

    const value = room.memory.roads[key];

    if (value > extraRoadValue) {
      extraRoadPos = { x, y };
      extraRoadValue = value;
      buildExtraRoad = true;
    }
  });

  if (buildExtraRoad) {
    const { x, y } = extraRoadPos;
    if (
      utils.squareClear(extraRoadPos, room, {
        swampClear: true,
        wallClear: false,
        customObstacleFilter: roadObstacleFilter,
      })
    ) {
      room.visual.text("🚗", x, y);
      room.createConstructionSite(x, y, STRUCTURE_ROAD);
      room.memory.roads = null;
    }
  }

  if (
    room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_ROAD;
      },
    }).length > 0
  ) {
    return;
  }
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
          utils.squareClear(a, room, {
            plainsClear: false,
            swampClear: true,
            wallClear: false,
            customObstacleFilter: roadObstacleFilter,
          })
        ) {
          room.visual.text("🚗", x, y);
          const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
          if (![0].includes(result)) {
            room.visual.text(result, x, y);
          }
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

  const extensionConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: {
      structureType: STRUCTURE_EXTENSION,
    },
  });

  if (
    extensionConstructionSites.length === 0 &&
    extensions.length < maxExtensions
  ) {
    for (let i = 4; i < 50; i++) {
      const sites = _.shuffle(utils.manhattanRing(i));
      for (const site of sites) {
        const actualX = mySpawns[0].pos.x + site.x;
        const actualY = mySpawns[0].pos.y + site.y;
        if (actualX < 0 || actualX > 49) {
          continue;
        }
        if (actualY < 0 || actualY > 49) {
          continue;
        }
        if (
          utils.siteClear({ x: actualX, y: actualY }, room, {
            swampClear: true,
          })
        ) {
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
