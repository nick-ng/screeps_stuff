const utils = require("./utils");

const roles = require("./roles");
const roleUpgrader = require("./role.upgrader");
const roleBuilder = require("./role.builder");

const buildingController = require("./buildingController");
const spawnController = require("./spawnController");

const loop = function () {
  utils.cleanMemory();

  // roles.shooter.spawn();
  roleUpgrader.spawn();
  roleBuilder.spawn();
  roles.worker.spawn();
  // const tower = Game.getObjectById('fede217bf67fd7953f15b64c');
  // if (tower) {
  //   const closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
  //     filter: (structure) => structure.hits < structure.hitsMax
  //   });
  //   if (closestDamagedStructure) {
  //     tower.repair(closestDamagedStructure);
  //   }

  //   const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  //   if (closestHostile) {
  //     tower.attack(closestHostile);
  //   }
  // }

  buildingController.build();
  spawnController.run();

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep.memory.task) {
      creep.memory.task = 0;
    }
    if (creep.memory.role === "worker") {
      roles.worker.run(creep);
    }
    if (creep.memory.role === "shooter") {
      roles.shooter.run(creep);
    }
    if (creep.memory.role === "upgrader") {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role === "builder") {
      roleBuilder.run(creep);
    }
  }
};

module.exports = {
  loop,
};
