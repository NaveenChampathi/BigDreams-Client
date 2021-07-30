import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TrendingUp, TrendingDown } from "@material-ui/icons";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";

// const getChartData = (data) => {
//   return [
//     {
//       time: "4.00PM",
//       preMarketPrice: data.close,
//     },
//     {
//       time: "8.00AM",
//       preMarketPrice: data.preMarketHigh,
//     },
//     {
//       time: "9.00AM",
//       preMarketPrice: data.preMarketLow,
//     },
//     {
//       time: "9.30AM",
//       preMarketPrice: data.open,
//       price: data.open,
//     },
//     {
//       time: "11.00AM",
//       price: data.high,
//     },
//     {
//       time: "12.00PM",
//       price: data.low,
//     },
//     {
//       time: "3:59PM",
//       price: data.close,
//     },
//   ];
// };

const chartStyles = makeStyles({
  chartContainer: {
    position: "relative",
  },
  chart: {
    position: "absolute",
    backgroundColor: "azure",
    zIndex: 999,
  },
});

const StockChart = ({ data }) => {
  const classes = chartStyles();
  // const chartData = getChartData(data);

  // const [showChart, setChartVisibility] = useState(false);

  return (
    <div
      className={classes.chartContainer}
      onMouseEnter={() => setChartVisibility(true)}
      onMouseLeave={() => setChartVisibility(false)}
    >
      <div className={classes.chartIcon}>
        {data.close > data.open ? <TrendingUp /> : <TrendingDown />}
      </div>
      {/* <div className={`${classes.chart}`}>
        {showChart && (
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="preMarketPrice"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={`${data.close > data.open ? "green" : "red"}`}
            />
          </LineChart>
        )}
      </div> */}
    </div>
  );
};

export default StockChart;
