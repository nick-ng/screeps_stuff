const NOTHING = "NOTHING";
const HARVESTING = "HARVESTING";
const BUILDING = "BUILDING";
const UPGRADING = "UPGRADING";
const FIGHTING = "FIGHTING";

const priorityArray = [NOTHING, HARVESTING, UPGRADING, BUILDING, FIGHTING];

const priority = priorityArray.reduce((prev, curr, i) => {
  prev[curr] = i;
  return prev;
}, {});

module.exports = {
  NOTHING,
  HARVESTING,
  BUILDING,
  UPGRADING,
  FIGHTING,
  priorityArray,
  priority,
};
