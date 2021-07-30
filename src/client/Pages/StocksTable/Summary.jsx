import React, { useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";

const chartStyles = makeStyles({
  chartContainer: {
    position: "relative",
    display: "flex",
  },
  chart: {
    position: "absolute",
    backgroundColor: "azure",
    zIndex: 999,
    right: 0,
    top: '40px',
  },
  summaryItem: {
    display: "flex",
    width: "300px",
    justifyContent: "space-between",
  },
});

const Summary = ({ summary, children }) => {
  const classes = chartStyles();

  const [showChart, setChartVisibility] = useState(false);

  return (
    <div
      className={classes.chartContainer}
      onMouseEnter={() => setChartVisibility(true)}
      onMouseLeave={() => setChartVisibility(false)}
    >
      {children}{" "}
      <div className={`${classes.chart}`}>
        {" "}
        {showChart && (
          <div
            style={{
              padding: "16px 20px",
              border: "1px solid gray"
            }}
          >
            <div className={classes.summaryItem}>
              <div> Avg Range </div> <div> {summary.avgRange} % </div>{" "}
            </div>{" "}
            <div className={classes.summaryItem}>
              <div> Avg Push after market Open </div>{" "}
              <div> {summary.avgPushAfterMarketOpen} % </div>{" "}
            </div>{" "}
            <div className={classes.summaryItem}>
              <div> Max Push after market Open </div>{" "}
              <div> {summary.maxPushAfterMarketOpen} % </div>{" "}
            </div>{" "}
            <div className={classes.summaryItem}>
              <div> Min Push after market Open </div>{" "}
              <div> {summary.minPushAfterMarketOpen} % </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};

export default Summary;
