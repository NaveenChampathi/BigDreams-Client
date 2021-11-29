import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getAllHaltedCrap } from "client/apis/haltsApi";
import { getAllGappedTickers } from "client/apis/historyApi";

import { Bar } from "react-chartjs-2";

const useStyles = makeStyles({
  yearlyChart: {
    height: 300,
  },
});

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
  maintainAspectRatio: false,
  color: "blue",
  borderColor: "blue",
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Stats = () => {
  const [haltedTickersData, setHaltedTickersData] = useState({
    labels: [],
    datasets: [],
  });
  const [gappedUpTickersData, setGappedUpTickersData] = useState({
    labels: [],
    datasets: [],
  });

  const classes = useStyles();

  const constructData = (res, label) => {
    const labels = [];
    const data = [];
    Object.keys(res).forEach((year) => {
      Object.keys(res[year]).forEach((month) => {
        labels.push(`${months[month]}, ${year}`);
        data.push(res[year][month].length);
      });
    });

    // const labels = Object.keys(res);

    // const data = labels.map((year) => {
    //   const yearData = res[year];
    //   return Object.keys(yearData).reduce((prevCount, currMonth) => {
    //     return prevCount + yearData[currMonth].length;
    //   }, 0);
    // });

    return {
      labels: labels,
      datasets: [
        {
          label: label,
          data,
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    getAllHaltedCrap().then(({ results }) => {
      const categorizedResults = {};

      results.forEach((res) => {
        const year = new Date(res.haltDate).getFullYear();
        const month = new Date(res.haltDate).getMonth();

        if (!categorizedResults[year]) {
          categorizedResults[year] = {};
        }

        if (!categorizedResults[year][month]) {
          categorizedResults[year][month] = [];
        }

        categorizedResults[year][month].push(res);
      });

      // console.log(categorizedResults);
      setHaltedTickersData(constructData(categorizedResults, "Halted Tickers"));
    });
  }, []);

  useEffect(() => {
    getAllGappedTickers({ gapUp: 30, volume: 3000000 }).then(({ results }) => {
      const categorizedResults = {};

      results.forEach((res) => {
        const year = new Date(res.TimeStamp).getFullYear();
        const month = new Date(res.TimeStamp).getMonth();

        if (!categorizedResults[year]) {
          categorizedResults[year] = {};
        }

        if (!categorizedResults[year][month]) {
          categorizedResults[year][month] = [];
        }

        categorizedResults[year][month].push(res);
      });

      // console.log(categorizedResults);
      setGappedUpTickersData(
        constructData(categorizedResults, "Gapped Up Tickers")
      );
    });
  }, []);

  return (
    <div>
      <div>
        <Bar
          className={classes.yearlyChart}
          data={haltedTickersData}
          options={options}
        />
      </div>

      <div>
        <Bar
          className={classes.yearlyChart}
          data={gappedUpTickersData}
          options={options}
        />
      </div>
    </div>
  );
};

export default Stats;
