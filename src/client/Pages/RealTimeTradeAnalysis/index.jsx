import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Button, makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import ColumnChart from "../../charts/ColumnChart";
import { useState } from "react";

import { getTrades } from "../../apis/historyApi";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    margin: "16px 24px",
  },
  textField: {
    margin: 8,
  },
  submit: {
    margin: 16,
  },
  chartContainer: {
    margin: 8,
    padding: 8,
  },
}));

const TradesTable = (data) => {};

const StackColumnChart = ({ data, segments }) => {
  let xAxisLabels = [];
  let columnsData = [];

  if (Object.keys(data).length) {
    xAxisLabels = Object.keys(data);
    columnsData = segments.map((segment) => ({
      name: segment,
      data: xAxisLabels.map((label) => data[label][segment] || null),
    }));

    // columnsData = columnsData.sort((a, b) => b.data[0] - a.data[0]);
  }

  const options = {
    chart: {
      type: "column",
      height: 600,
      scrollablePlotArea: {
        minWidth: 500,
        scrollPositionX: 0,
        opacity: 0,
      },
    },

    title: {
      text: "Trades by Time/Price",
      align: "left",
    },
    xAxis: {
      categories: xAxisLabels,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Volume",
      },
    },
    legend: {
      enabled: true,
    },
    tooltip: {
      headerFormat: "<b>{point.x}</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
    },
    plotOptions: {
      series: {
        grouping: true,
        shadow: false,
        pointWidth: 8,
      },
    },
    series: columnsData,
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

const TradeAnalysis = () => {
  const classes = useStyles();
  const [symbol, setSymbol] = useState("COGT");
  const [startDateTime, setStartDateTime] = useState("2022-06-10T11:47");
  const [endDateTime, setEndDateTime] = useState("2022-06-10T11:51");
  const [formattedTradesByTimeAndPrice, setFormattedTradesByTimeAndPrice] =
    useState({});
  const [formattedTradesByPrice, setFormattedTradesByPrice] = useState({});

  const getTradesData = async () => {
    console.log({
      symbol,
      startDateTime,
      endDateTime,
    });
    const trades = await getTrades(
      `${startDateTime}:00-04:00`,
      `${endDateTime}:00-04:00`,
      symbol
    );

    const formattedTradesByTimeAndPrice = {};

    trades.forEach((t) => {
      const price = parseFloat(t.Price).toFixed(2);
      const _time = t.Timestamp.split("T")[1]?.split("-")[0];
      const [hours, minutes] = _time.split(":");
      const timeHourMinutes = `${hours}:${minutes}`;

      if (!formattedTradesByTimeAndPrice[timeHourMinutes]) {
        formattedTradesByTimeAndPrice[timeHourMinutes] = {
          [price]: t.Size,
        };
      } else {
        if (!formattedTradesByTimeAndPrice[timeHourMinutes][price]) {
          formattedTradesByTimeAndPrice[timeHourMinutes] = {
            ...formattedTradesByTimeAndPrice[timeHourMinutes],
            [price]: t.Size,
          };
        } else {
          formattedTradesByTimeAndPrice[timeHourMinutes][price] += t.Size;
        }
      }
    });

    setFormattedTradesByTimeAndPrice(formattedTradesByTimeAndPrice);

    let formattedTradesByPrice = {};

    trades.forEach((t) => {
      const _time = t.Timestamp.split("T")[1]?.split("-")[0];
      const price = parseFloat(t.Price).toFixed(2);

      const [hours, minutes] = _time.split(":");

      if (!formattedTradesByPrice[price]) {
        formattedTradesByPrice[price] = t.Size;
      } else {
        formattedTradesByPrice[price] += t.Size;
      }
    });

    setFormattedTradesByPrice(formattedTradesByPrice);
  };

  return (
    <div>
      <h1>Trades Analysis</h1>
      <div>
        <div className={classes.container}>
          <div>
            <TextField
              id="datetime-local"
              label="Symbol"
              defaultValue=""
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value?.toUpperCase())}
            />
          </div>
          <div>
            <TextField
              id="datetime-local-start"
              label="Start time"
              type="datetime-local"
              defaultValue="2017-05-24T10:30"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
            />
          </div>
          <div>
            <TextField
              id="datetime-local-end"
              label="End time"
              type="datetime-local"
              defaultValue="2017-05-24T10:30"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
            />
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={getTradesData}
              className={classes.submit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
      <div className={classes.chartContainer}>
        <StackColumnChart
          data={formattedTradesByTimeAndPrice}
          segments={Object.keys(formattedTradesByPrice)}
        />
      </div>
      <div className={classes.chartContainer}>
        <ColumnChart data={formattedTradesByPrice} />
      </div>
    </div>
  );
};

export default TradeAnalysis;
