const priorityArray = [
  "NOTHING",
  "HARVESTING",
  "DIGGING",
  "UPGRADING",
  "BUILDING",
  "FIGHTING",
];

const priority = priorityArray.reduce((prev, curr, i) => {
  prev[curr] = i;
  return prev;
}, {});

module.exports = priority;
