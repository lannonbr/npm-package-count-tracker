let data = window.data;
let labels = data.map((d) => moment.unix(d.timestamp).format("YYYY-MM-DD"));

let max = moment
  .unix(Math.max(...data.map((d) => +d.timestamp)))
  .add(1, "day")
  .format("YYYY-MM-DD");
let min = moment
  .unix(Math.min(...data.map((d) => +d.timestamp)))
  .subtract(1, "day")
  .format("YYYY-MM-DD");

let ctx = document.getElementById("statsGraph").getContext("2d");

const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Count",
        data: data.map((d) => d.count),
        borderColor: "#16a34a",
        borderWidth: 1,
      },
    ],
  },
  options: {
    elements: {
      point: {
        radius: 5,
        hitRadius: 20,
      },
    },
    interaction: {
      mode: "x",
    },
    scales: {
      x: {
        type: "timeseries",
        time: {
          unit: "day",
          parser: "YYYY-MM-DD",
        },
        min: min,
        max: max,
      },
    },
  },
});
