const getRenewed = (creep) => {
  const ttl = creep.ticksToLive;
  console.log("ttl", ttl);
};

module.exports = {
  getRenewed,
};
