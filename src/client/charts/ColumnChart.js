import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const ColumnChart = ({ data }) => {
  const options = {
    chart: {
      type: "column",
      height: 600,
      scrollablePlotArea: {
        minWidth: 500,
        opacity: 0,
        scrollPositionX: 0,
      },
    },

    title: {
      text: "Trades by Price",
      align: "left",
    },
    xAxis: {
      type: "category",
      labels: {
        rotation: -45,
        style: {
          fontSize: "13px",
          fontFamily: "Verdana, sans-serif",
        },
      },
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
    plotOptions: {
      column: {
        borderWidth: 1,
      },
    },
    series: [
      {
        name: "Price",
        data: Object.keys(data)
          .map((price) => [price, data[price]])
          .sort((a, b) => a[0] - b[0]),
        dataLabels: {
          enabled: true,
          rotation: -90,
          color: "#FFFFFF",
          align: "right",
          format: "{point.y:.1f}", // one decimal
          y: 10, // 10 pixels down from the top
          style: {
            fontSize: "13px",
            fontFamily: "Verdana, sans-serif",
          },
        },
      },
    ],
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default ColumnChart;
