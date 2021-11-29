import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Chart from "client/Pages/Home/Components/Chart/index";
import DailyChart from "client/Pages/Home/Components/Chart/DailyChart";
import { updateTickerType } from "client/apis/haltsApi";
import HaltedTickers from "./Components/HaltedTickers";

const useStyles = makeStyles({
  chartContainer: {
    textAlign: "initial",
    margin: "12px",
    backgroundColor: "white",
    flex: 1,
  },
  dailyChartContainer: {
    textAlign: "initial",
    margin: "12px",
    backgroundColor: "white",
    flex: 1,
    width: 1000,
  },
  flexContainer: {
    display: "flex",
  },
});

const HaltResume = () => {
  const classes = useStyles();
  const [date, setDate] = useState(null);
  const [ticker, setTicker] = useState(null);

  const getChartDate = (date) => {
    // const [year, month, day] = date.split("T")[0].split("-");
    // return [year, month, day].join("-");
    return date.split("T")[0];
  };

  const setTickerData = (date, ticker) => {
    setDate(getChartDate(date));
    setTicker(ticker);
  };

  const updateType = (id, type, value) => {
    updateTickerType(id, type, value);
  };

  return (
    <>
      <div className={classes.flexContainer}>
        <div>
          <HaltedTickers
            onRowClick={setTickerData}
            selectedTicker={ticker}
            updateType={updateType}
          />
        </div>
        <div className={classes.chartContainer}>
          <Chart date={date} ticker={ticker} />
        </div>
      </div>
      <div className={classes.dailyChartContainer}>
        <DailyChart date={date} ticker={ticker} />
      </div>
    </>
  );
};

export default HaltResume;
