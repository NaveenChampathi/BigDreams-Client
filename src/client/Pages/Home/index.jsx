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
  },
  container: {
    marginLeft: "12px",
    marginRight: "12px",
  },
  notificationWidgetContainer: {
    maxHeight: "350px",
    margin: "12px 0",
    width: 1000,
  },
  chartContainer: {
    textAlign: "initial",
    margin: "12px",
    height: "560px",
    flex: 1,
    backgroundColor: "white",
  },
  dailyChartContainer: {
    textAlign: "initial",
    margin: "12px",
    backgroundColor: "white",
    flex: 1,
  },
  tickerSymbol: {
    fontSize: 34,
    margin: 16,
    color: "gray",
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
            <div className={classes.flex}>
              <div className={classes.tickerSymbol}>{ticker}</div>
              <div>
                <ButtonGroup variant="contained" aria-label="text button group">
                  <Button
                    variant={timeframe === 1 ? "contained" : "outlined"}
                    onClick={() => setTimeframe(1)}
                  >
                    1Min
                  </Button>
                  <Button
                    variant={timeframe === 5 ? "contained" : "outlined"}
                    onClick={() => setTimeframe(5)}
                  >
                    5Mins
                  </Button>
                  <Button
                    variant={timeframe === 15 ? "contained" : "outlined"}
                    onClick={() => setTimeframe(15)}
                  >
                    15Mins
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <Chart date={date} ticker={ticker} timeframe={timeframe} />
            <div className={classes.flex}>
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
