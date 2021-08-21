const creepUtils = require("./utils/creep");

const updateRoomMemory = (room, data) => {
  if (!room.memory) {
    room.memory = {};
  }

  if (room.memory.lastUpdated === Game.time) {
    return;
  }

  room.memory = {
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

module.exports = {
  run: () => {
    Object.values(Game.spawns).forEach((spawn) => {
      updateRoomEnergyStats(spawn.room);
      const roomStats = `Energy: ${spawn.room.energyAvailable}/${
        spawn.room.energyCapacityAvailable
      } (${spawn.room.memory.energyPerTick.toFixed(3)}/T)`;
      const workerStats = `Worker Cost: ${creepUtils.getWorkerCost(
        spawn.room
      )}`;

      spawn.room.visual.text(roomStats, 25, 25).text(workerStats, 25, 26);
    });
  },
};
