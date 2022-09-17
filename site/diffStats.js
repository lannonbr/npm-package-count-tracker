const { monthStats } = require("./src/_data/stats.json");

const lastWeek = monthStats.slice(-7);
const lastDay = monthStats.slice(-2);

const lastDayDiff = lastDay[1].count - lastDay[0].count;
const lastWeekDiff = lastWeek[6].count - lastWeek[0].count;

console.log(JSON.stringify({ lastDayDiff, lastWeekDiff }));
