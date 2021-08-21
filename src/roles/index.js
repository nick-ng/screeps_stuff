const roleWorker = require("./worker");
const roleShooter = require("./shooter");
const roleTransport = require("./transport");

module.exports = {
  worker: roleWorker,
  shooter: roleShooter,
  transport: roleTransport,
};
