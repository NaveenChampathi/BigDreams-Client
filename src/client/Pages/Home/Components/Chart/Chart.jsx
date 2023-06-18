import { format } from "d3-format";
import { timeFormat, timeParse } from "d3-time-format";
import { IconButton, withStyles } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import * as React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Select from "client/common/Dropdown/index.jsx";

const useStyles = (theme) => ({
  toggleButtonGroupRoot: {
    height: 28,
  },
});

const timeframeOptions = [
  {
    label: "1 Min",
    value: 1,
  },
  {
    label: "3 Min",
    value: 3,
  },
  {
    label: "5 Min",
    value: 5,
  },
  {
    label: "15 Min",
    value: 15,
  },
];

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
import { mergeClasses } from "@material-ui/styles";
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
          timeframe: 1,
        };
      }

      fetchData(date, ticker, timeframe = 1) {
        this.setState({
          message: "Loading Chart...",
        });
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
          let numberOfDaysBack = 0;
          let numberOfDaysForward = 0;

          switch (timeframe) {
            case 1:
              numberOfDaysBack = 0;
              numberOfDaysForward = 0;
              break;
            case 3:
              numberOfDaysBack = 1;
              numberOfDaysForward = 1;
              break;
            case 5:
              numberOfDaysBack = 3;
              numberOfDaysForward = 3;
              break;
            case 15:
              numberOfDaysBack = 5;
              numberOfDaysForward = 5;
              break;
            default:
          }

          // Intraday bars
          getIntradayBars(
            date,
            ticker,
            timeframe,
            numberOfDaysBack,
            numberOfDaysForward
          )
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
        const { date, ticker, timeframe } = this.props;

        if (date && ticker) {
          this.fetchData(date, ticker, timeframe);
        }
      }

      refreshData() {
        const { date, ticker, timeframe } = this.props;

        if (date && ticker) {
          this.fetchData(date, ticker, timeframe);
        }
      }

      componentDidUpdate(prevProps, prevState) {
        const { date, ticker } = this.props;
        const { timeframe } = this.state;
        const { date: prevDate, ticker: prevTicker } = prevProps;
        const { timeframe: prevTimeframe } = prevState;

        if (
          date !== prevDate ||
          ticker !== prevTicker ||
          prevTimeframe !== timeframe
        ) {
          this.fetchData(date, ticker, timeframe);
        }
      }

      onTimeframeChange(e, newTimeFrame) {
        this.setState({
          timeframe: newTimeFrame,
        });
      }

      render() {
        const { data, message } = this.state;
        const { classes } = this.props;
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  padding: "12px 12px 8px 12px",
                }}
              >
                {!this.props.hideTimeframeOptions && (
                  // <Select
                  //   options={timeframeOptions}
                  //   label="Timeframe"
                  //   onChange={this.onTimeframeChange.bind(this)}
                  //   value={this.state.timeframe}
                  //   showLabel={false}
                  // />

                  <ToggleButtonGroup
                    value={this.state.timeframe}
                    exclusive
                    onChange={this.onTimeframeChange.bind(this)}
                    aria-label="text alignment"
                    classes={{
                      root: classes.toggleButtonGroupRoot,
                    }}
                  >
                    {timeframeOptions.map(({ value, label }, i) => (
                      <ToggleButton value={value} aria-label="left aligned">
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              </div>
              <div>
                <span>{`${this.props.ticker} ${this.props.date}`}</span>
                <IconButton
                  color="inherit"
                  aria-label="refresh"
                  onClick={this.refreshData.bind(this)}
                >
                  <RefreshIcon />
                </IconButton>
              </div>
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
    const { classes } = props;
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

    const elderRayHeight = 150;
    const elderRayOrigin = (_, h) => [0, h - elderRayHeight];
    const barChartHeight = gridHeight / 4;
    const barChartOrigin = (_, h) => [0, h - barChartHeight - elderRayHeight];
    const chartHeight = gridHeight - elderRayHeight;

    const timeDisplayFormat = timeFormat(dateTimeFormat);

    const getMarketOpenLineIndices = () => {
      let openMarketTimeIndices = [];

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].timestamp.includes("T09:30")) {
            openMarketTimeIndices.push(i);
          }
        }
      }
      return openMarketTimeIndices;
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
        text={"fsdaf"}
      >
        <Chart
          id={3}
          height={chartHeight}
          yExtents={this.candleChartExtents}
          text={"fsdaf"}
        >
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
          {getMarketOpenLineIndices().map((i) => (
            <StraightLine
              type="vertical"
              lineDash={"LongDash"}
              xValue={i}
              lineWidth={2}
            />
          ))}

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
        <Chart
          id={4}
          height={elderRayHeight}
          origin={elderRayOrigin}
          yExtents={this.barChartExtents}
          padding={{ top: 16, bottom: 8 }}
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
    return data.close > data.open ? "#26a69a" : "#ef5350";
  };

  volumeSeries = (data) => {
    return data.volume;
  };

  openCloseColor = (data) => {
    return data.close > data.open ? "#26a69a" : "#ef5350";
  };
}

export default withStyles(useStyles)(
  withOHLCData()(
    withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart))
  )
);

export const MinutesStockChart = withStyles(useStyles)(
  withOHLCData("MINUTES")(
    withSize({ style: { minHeight: 600 } })(
      withDeviceRatio()(withStyles(useStyles)(StockChart))
    )
  )
);

export const SecondsStockChart = withStyles(useStyles)(
  withOHLCData("SECONDS")(
    withSize({ style: { minHeight: 600 } })(
      withDeviceRatio()(withStyles(useStyles)(StockChart))
    )
  )
);
