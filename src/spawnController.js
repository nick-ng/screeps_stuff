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

const updateRoomEnergyStats = (room) => {
  const { energyHistory, lastUpdated } = room.memory;
  if (lastUpdated === Game.time) {
    return;
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

  updateRoomMemory(room, newData);
};

const updateRoomSources = (room) => {
  if (room.memory.sources) {
    return;
  }

  const newSources = {};

  room.find(FIND_SOURCES).forEach((source) => {
    const spawns = room.find(FIND_MY_SPAWNS);
    const freeSquares = roleUtils.getFreeSquares(spawns[0].room, source.pos);

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

  updateRoomMemory(room, { sources: newSources });
};

module.exports = {
  run: () => {
    Object.values(Game.spawns).forEach((spawn) => {
      updateRoomSources(spawn.room);
      updateRoomEnergyStats(spawn.room);

      const roomStats = `Energy: ${spawn.room.energyAvailable}/${
        spawn.room.energyCapacityAvailable
      } (${(spawn.room.memory.energyPerTick || 0).toFixed(3)}/T)`;
      const workerStats = `Worker Cost: ${creepUtils.getWorkerCost(
        spawn.room
      )}`;

      spawn.room.visual.text(roomStats, 25, 25).text(workerStats, 25, 26);
    });
  },
};
