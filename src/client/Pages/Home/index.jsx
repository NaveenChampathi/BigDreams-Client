import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import NotificationWidget from "client/Pages/Home/Components/NotificationWidget";
import HistoryWidget from "client/Pages/Home/Components/History";
import Chart from "client/Pages/Home/Components/Chart/index";
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
  },
  chartContainer: {
    textAlign: "initial",
    margin: "12px",
    height: "560px",
    width: "1000px",
    backgroundColor: "white",
  },
});

const Home = () => {
  const classes = useStyles();
  const [date, setDate] = useState(null);
  const [ticker, setTicker] = useState(null);

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
            <div className={classes.notificationWidgetContainer}>
              <NotificationWidget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
