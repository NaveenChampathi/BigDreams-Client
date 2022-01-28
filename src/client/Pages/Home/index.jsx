import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import NotificationWidget from "client/Pages/Home/Components/NotificationWidget";
import HistoryWidget from "client/Pages/Home/Components/History";
import Chart from "client/Pages/Home/Components/Chart/index";
import DailyChart from "client/Pages/Home/Components/Chart/DailyChart";
import "./styles.scss";

const useStyles = makeStyles({
  flex: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  container: {
    marginLeft: "12px",
    marginRight: "12px",
    overflowX: "auto",
    height: "calc(100% - 64px)",
  },
  notificationWidgetContainer: {
    maxHeight: "350px",
    margin: "12px 0",
    // width: 1000,
  },
  chartContainer: {
    textAlign: "initial",
    margin: "12px",
    height: "630px",
    flex: 1,
    backgroundColor: "white",
  },
  dailyChartContainer: {
    textAlign: "initial",
    margin: "12px 12px 12px 0px",
    backgroundColor: "white",
    flex: 1,
  },
  flexWrap: {
    display: "flex",
    flexWrap: "wrap",
  },
});

const Home = () => {
  const classes = useStyles();
  const [date, setDate] = useState(null);
  const [ticker, setTicker] = useState(null);
  const [timeframe, setTimeframe] = useState(1);

  const onGapperItemClick = (_date, _ticker) => {
    setDate(_date);
    setTicker(_ticker);
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.flex}>
          <HistoryWidget onGapperItemClick={onGapperItemClick} />
          <div className={classes.chartContainer}>
            <Chart date={date} ticker={ticker} />
            <div className={classes.flexWrap}>
              <div className={classes.dailyChartContainer}>
                <DailyChart date={date} ticker={ticker} />
              </div>
              <div className={classes.notificationWidgetContainer}>
                <NotificationWidget onAlertClick={onGapperItemClick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
