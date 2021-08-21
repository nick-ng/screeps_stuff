const creepUtils = require("./utils/creep");
const roleUtils = require("./roles/utils");

const updateRoomMemory = (room, data) => {
  if (!room.memory) {
    room.memory = {};
  }

  if (room.memory.lastUpdated === Game.time) {
    return;
  }

  room.memory = {
    ...room.memory,
    ...data,
    lastUpdated: Game.time,
  };
};

const getRoomEnergyStats = (room) => {
  const { energyHistory, lastUpdated } = room.memory;
  if (lastUpdated === Game.time) {
    return {};
  }

  const newData = {};

  if (!energyHistory) {
    newData.energyHistory = [room.energyAvailable];
  } else {
    newData.energyHistory = energyHistory
      .concat([room.energyAvailable])
      .slice(-50);
  }

  let energyPerTick = 0;
  for (let n = 1; n < newData.energyHistory.length; n++) {
    const energyChange =
      (newData.energyHistory[n] - newData.energyHistory[n - 1]) /
      (newData.energyHistory.length - 1);
    energyPerTick += energyChange;
  }
  newData.energyPerTick = energyPerTick;

  return newData;
};

const getRoomSources = (room) => {
  if (room.memory.sources) {
    return room.memory.sources;
  }

  const newSources = {};

  room.find(FIND_SOURCES).forEach((source) => {
    const spawns = room.find(FIND_MY_SPAWNS);
    const freeSquares = roleUtils.getFreeSquares(spawns[0].room, source.pos, {
      swampClear: true,
    });

    const pathToSource = room.findPath(source.pos, spawns[0].pos, {
      ignoreCreeps: true,
      ignoreRoads: true,
      plainCost: 1,
      swampCost: 1,
    });

    newSources[source.id] = {
      freeSquares: freeSquares.length,
      pathToSourceLength: pathToSource.length,
    };
  });
  return { sources: newSources };
};

const getRoomRoadStats = (room) => {
  const { roads, lastUpdated } = room.memory;
  if (lastUpdated === Game.time) {
    return {};
  }

  const newRoads = !roads
    ? {}
    : Object.keys(roads).reduce((prev, curr) => {
        const value = roads[curr] - 0.03;

        if (value > 0) {
          prev[curr] = Math.min(value, 100);
        }

        return prev;
      }, {});

  const creeps = room.find(FIND_MY_CREEPS, {
    filter: (creep) => creep.memory.role !== "builder",
  });

  creeps.forEach((creep) => {
    if (creep.memory.idle) {
      return;
    }
    const { pos } = creep;

    // Ignore positions that already have construction sites or structures
    const posContents = room.lookAt(pos).filter((content) => {
      return content.type === "constructionSite" || content.type == "structure";
    });
    if (posContents.length > 0) {
      return;
    }

    const posKey = `${pos.x}_${pos.y}`;

    if (newRoads[posKey]) {
      newRoads[posKey] += 1;
    } else {
      newRoads[posKey] = 1;
    }
  });

  return { roads: newRoads };
};

module.exports = {
  run: () => {
    Object.values(Game.spawns).forEach((spawn) => {
      updateRoomMemory(spawn.room, {
        ...getRoomSources(spawn.room),
        ...getRoomEnergyStats(spawn.room),
        ...getRoomRoadStats(spawn.room),
      });

      const roomStats = `Energy: ${spawn.room.energyAvailable}/${
        spawn.room.energyCapacityAvailable
      } (${(spawn.room.memory.energyPerTick || 0).toFixed(3)}/T)`;

      const workerStats = `Worker Cost: ${creepUtils.getWorkerCost(
        spawn.room
      )}`;

      spawn.room.visual.text(roomStats, 25, 25).text(workerStats, 25, 26);

      Object.keys(spawn.room.memory.roads).forEach((key) => {
        if (spawn.room.memory.roads[key] < 8) {
          return;
        }
        const [x, y] = key.split("_").map((a) => parseInt(a, 10));

        spawn.room.visual.text(
          Math.floor(Math.min(spawn.room.memory.roads[key], 99)),
          x,
          y
        );
      });
    });
  },
};
