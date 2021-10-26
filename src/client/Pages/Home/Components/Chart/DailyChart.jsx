import React from "react";
import Chart from "./Chart";

export default class ChartComponent extends React.Component {
  render() {
    const { date, ticker } = this.props;
    return <Chart dateTimeFormat="%H:%M" date={date} ticker={ticker} />;
  }
}
