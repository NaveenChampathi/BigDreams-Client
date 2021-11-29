import React from "react";
import Chart, { MinutesStockChart } from "./Chart";
import { getData } from "client/Pages/Home/utils";

export default class ChartComponent extends React.Component {
  componentDidMount() {
    getData().then((data) => {
      this.setState({ data });
    });
  }
  render() {
    const { date, ticker, timeframe } = this.props;
    if (this.state == null) {
      return <div>Loading...</div>;
    }
    return (
      <MinutesStockChart
        dateTimeFormat="%H:%M"
        date={date}
        ticker={ticker}
        timeframe={timeframe}
      />
    );
  }
}
