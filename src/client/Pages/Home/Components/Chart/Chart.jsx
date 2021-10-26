import { format } from "d3-format";
import { timeFormat, timeParse } from "d3-time-format";
import { IconButton } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import * as React from "react";

import {
  getIntradayBars,
  getIntradayTrades,
  getDailyBars,
} from "client/apis/historyApi";

import {
  elderRay,
  ema,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CurrentCoordinate,
  BarSeries,
  CandlestickSeries,
  VolumeProfileSeries,
  ElderRaySeries,
  LineSeries,
  MovingAverageTooltip,
  SingleValueTooltip,
  lastVisibleItemBasedZoomAnchor,
  XAxis,
  YAxis,
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateX,
  MouseCoordinateY,
  ZoomButtons,
  withDeviceRatio,
  withSize,
  StraightLine,
} from "react-financial-charts";

import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
// import StraightLine from "react-financial-charts/series/src/StraightLine";

const parseDate = timeParse("%Y-%m-%d");

const parseData = () => {
  return (d) => {
    const date = parseDate(d.date);
    if (date === null) {
      d.date = new Date(Number(d.date));
    } else {
      d.date = new Date(date);
    }

    for (const key in d) {
      if (key !== "date" && Object.prototype.hasOwnProperty.call(d, key)) {
        d[key] = +d[key];
      }
    }

    return d;
  };
};

const withOHLCData = (dataSet = "DAILY") => {
  return (OriginalComponent) => {
    return class WithOHLCData extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          message: `Please query a ticker and select a date for chart`,
        };
      }

      fetchData(date, ticker) {
        if (dataSet === "DAILY") {
          // Daily Data
          getDailyBars(date, ticker)
            .then((data) => {
              this.setState({
                data: data.map((d) => ({
                  date: new Date(new Date(d.Timestamp)),
                  timestamp: d.Timestamp,
                  open: d.OpenPrice,
                  high: d.HighPrice,
                  low: d.LowPrice,
                  close: d.ClosePrice,
                  volume: d.Volume,
                  vwap: d.vw,
                })),
              });
            })
            .catch((err) => {
              console.log(err);
              this.setState({
                message: `Failed to fetch data.`,
              });
            });
        } else {
          // Intraday bars
          getIntradayBars(date, ticker)
            .then((data) => {
              this.setState({
                data: data.map((d) => ({
                  date: new Date(
                    new Date(d.Timestamp).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                    })
                  ),
                  timestamp: d.Timestamp,
                  open: d.OpenPrice,
                  high: d.HighPrice,
                  low: d.LowPrice,
                  close: d.ClosePrice,
                  volume: d.Volume,
                  vwap: d.vw,
                })),
              });
            })
            .catch((err) => {
              console.log(err);
              this.setState({
                message: `Failed to fetch data.`,
              });
            });
        }
        // Intraday Trades
        // getIntradayTrades(date, ticker)
        //   .then((data) => {
        //     console.log(
        //       data.map((d) => ({
        //         ...d,
        //         date: new Date(
        //           new Date(d.Timestamp).toLocaleString("en-US", {
        //             timeZone: "America/New_York",
        //           })
        //         ),
        //       }))
        //     );
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //     this.setState({
        //       message: `Failed to fetch data.`,
        //     });
        //   });
      }

      componentDidMount() {
        const { date, ticker } = this.props;

        if (date && ticker) {
          this.fetchData(date, ticker);
        }
      }

      refreshData() {
        const { date, ticker } = this.props;

        if (date && ticker) {
          this.fetchData(date, ticker);
        }
      }

      componentDidUpdate(prevProps) {
        const { date, ticker } = this.props;
        const { date: prevDate, ticker: prevTicker } = prevProps;

        if (date !== prevDate || ticker !== prevTicker) {
          this.fetchData(date, ticker);
        }
      }

      render() {
        const { data, message } = this.state;
        if (data === undefined) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {message}
            </div>
          );
        }

        return (
          <div>
            <div style={{ textAlign: "right" }}>
              <IconButton
                color="inherit"
                aria-label="refresh"
                onClick={this.refreshData.bind(this)}
              >
                <RefreshIcon />
              </IconButton>
            </div>
            <div>
              <OriginalComponent {...this.props} data={data} />
            </div>
          </div>
        );
      }
    };
  };
};

class StockChart extends React.Component {
  constructor() {
    super();
    this.margin = { left: 0, right: 48, top: 0, bottom: 24 };
    this.pricesDisplayFormat = format(".2f");
    this.xScaleProvider =
      discontinuousTimeScaleProviderBuilder().inputDateAccessor((d) => d.date);
  }

  render() {
    const { props, margin, xScaleProvider } = this;
    const {
      data: initialData,
      dateTimeFormat = "%d %b",
      height,
      ratio,
      width,
      date,
    } = props;

    const ema12 = ema()
      .id(1)
      .options({ windowSize: 12 })
      .merge((d, c) => {
        d.ema12 = c;
      })
      .accessor((d) => d.ema12);

    const ema26 = ema()
      .id(2)
      .options({ windowSize: 26 })
      .merge((d, c) => {
        d.ema26 = c;
      })
      .accessor((d) => d.ema26);

    const elder = elderRay();

    const calculatedData = elder(ema26(ema12(initialData)));

    const { data, xScale, xAccessor, displayXAccessor } =
      xScaleProvider(calculatedData);

    const max = xAccessor(data[data.length - 1]);
    const min = xAccessor(data[Math.max(0, data.length - 100)]);
    const xExtents = [min, max + 5];

    const gridHeight = height - margin.top - margin.bottom;

    const elderRayHeight = 100;
    const elderRayOrigin = (_, h) => [0, h - elderRayHeight];
    const barChartHeight = gridHeight / 4;
    const barChartOrigin = (_, h) => [0, h - barChartHeight - elderRayHeight];
    const chartHeight = gridHeight - elderRayHeight;

    const timeDisplayFormat = timeFormat(dateTimeFormat);

    const getMarketOpenTime = () => {
      let openMarketTimeIndex = 299;

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].timestamp.includes("T09:30")) {
            openMarketTimeIndex = i;
            break;
          }
        }
      }

      return openMarketTimeIndex;
    };

    return (
      <ChartCanvas
        height={height}
        ratio={ratio}
        width={width}
        margin={margin}
        data={data}
        displayXAccessor={displayXAccessor}
        seriesName="Data"
        xScale={xScale}
        xAccessor={xAccessor}
        xExtents={xExtents}
        zoomAnchor={lastVisibleItemBasedZoomAnchor}
      >
        <Chart
          id={2}
          height={barChartHeight}
          origin={barChartOrigin}
          yExtents={this.barChartExtents}
        >
          <YAxis
            axisAt="left"
            orient="right"
            ticks={5}
            tickFormat={format(".2s")}
          />
          <MouseCoordinateY
            at="left"
            orient="right"
            displayFormat={format(".4s")}
          />
          <BarSeries
            fillStyle={this.volumeColor}
            yAccessor={this.volumeSeries}
          />
        </Chart>
        <Chart id={3} height={chartHeight} yExtents={this.candleChartExtents}>
          <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" />
          <YAxis showGridLines tickFormat={this.pricesDisplayFormat} />
          <CandlestickSeries />
          <VolumeProfileSeries />
          {/* <LineSeries yAccessor={(d) => d.close} /> */}
          {/* <LineSeries
            yAccessor={ema26.accessor()}
            strokeStyle={ema26.stroke()}
          />
          <CurrentCoordinate
            yAccessor={ema26.accessor()}
            fillStyle={ema26.stroke()}
          />
          <LineSeries
            yAccessor={ema12.accessor()}
            strokeStyle={ema12.stroke()}
          />
          <CurrentCoordinate
            yAccessor={ema12.accessor()}
            fillStyle={ema12.stroke()}
          /> */}
          <MouseCoordinateY
            rectWidth={margin.right}
            displayFormat={this.pricesDisplayFormat}
          />
          <MouseCoordinateX displayFormat={timeDisplayFormat} />
          <EdgeIndicator
            itemType="last"
            rectWidth={margin.right}
            fill={this.openCloseColor}
            lineStroke={this.openCloseColor}
            displayFormat={this.pricesDisplayFormat}
            yAccessor={this.yEdgeIndicator}
          />
          <StraightLine
            type="vertical"
            lineDash={"LongDash"}
            xValue={getMarketOpenTime()}
            lineWidth={2}
          />
          {/* <MovingAverageTooltip
            origin={[8, 24]}
            options={[
              {
                yAccessor: ema26.accessor(),
                type: "EMA",
                stroke: ema26.stroke(),
                windowSize: ema26.options().windowSize,
              },
              {
                yAccessor: ema12.accessor(),
                type: "EMA",
                stroke: ema12.stroke(),
                windowSize: ema12.options().windowSize,
              },
            ]}
          /> */}

          <ZoomButtons />
          <OHLCTooltip origin={[8, 16]} />
        </Chart>
        {/* <Chart
          id={4}
          height={elderRayHeight}
          yExtents={[0, elder.accessor()]}
          origin={elderRayOrigin}
          padding={{ top: 8, bottom: 8 }}
        >
          <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" />
          <YAxis ticks={4} tickFormat={this.pricesDisplayFormat} />

          <MouseCoordinateX displayFormat={timeDisplayFormat} />
          <MouseCoordinateY
            rectWidth={margin.right}
            displayFormat={this.pricesDisplayFormat}
          />

          <ElderRaySeries yAccessor={elder.accessor()} />

          <SingleValueTooltip
            yAccessor={elder.accessor()}
            yLabel="Elder Ray"
            yDisplayFormat={(d) =>
              `${this.pricesDisplayFormat(
                d.bullPower
              )}, ${this.pricesDisplayFormat(d.bearPower)}`
            }
            origin={[8, 16]}
          />
        </Chart> */}
        <CrossHairCursor />
      </ChartCanvas>
    );
  }

  barChartExtents = (data) => {
    return data.volume;
  };

  candleChartExtents = (data) => {
    return [data.high, data.low];
  };

  yEdgeIndicator = (data) => {
    return data.close;
  };

  volumeColor = (data) => {
    return data.close > data.open
      ? "rgba(38, 166, 154, 0.3)"
      : "rgba(239, 83, 80, 0.3)";
  };

  volumeSeries = (data) => {
    return data.volume;
  };

  openCloseColor = (data) => {
    return data.close > data.open ? "#26a69a" : "#ef5350";
  };
}

export default withOHLCData()(
  withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart))
);

export const MinutesStockChart = withOHLCData("MINUTES")(
  withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart))
);

export const SecondsStockChart = withOHLCData("SECONDS")(
  withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart))
);
