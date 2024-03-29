import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import ListIcon from "@material-ui/icons/List";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import PlayCircleFilledWhiteIcon from "@material-ui/icons/PlayCircleFilledWhite";
import StopIcon from "@material-ui/icons/Stop";

import {
  getAllWatchlists,
  getSpecificWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
} from "client/apis/watchlistApi";
import {
  connectToStream,
  disconnectFromStream,
  getConnectionStatus,
} from "client/apis/streamingApi";
import { getTopGainers } from "client/apis/snapshotApi";
import { getFundamentalsFinviz } from "client/apis/fundamentalsApi";

import { playSwipe, playFlush } from "client/sounds/play";
import { numberWithCommas } from "client/utils";
import { connectSocket } from "client/socket";

const _tickersFundamentals = {};
let _tickersClone = [];

const useStyles = makeStyles({
  table: {
    minWidth: 650,
    "& td": {
      paddingTop: 0,
      paddingBottom: 0,
    },
    "& th": {
      paddingTop: 0,
      paddingBottom: 0,
    },
    "& button": {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  deleteIcon: {
    width: 48,
  },
  addTickerForm: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  tickerInputField: {
    marginRight: 16,
  },
  actionsContainer: {
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 16,
    marginRight: 16,
  },
  actions: {
    display: "flex",
  },
  lists: {
    display: "flex",
    "& button": {
      borderRadius: 0,
    },
  },
  green: {
    color: "green",
    fontWeight: 700,
  },
  red: {
    color: "red",
    fontWeight: 700,
  },
  iconButtonsContainer: {
    display: "flex",
  },
  block: {
    display: "block",
  },
  none: {
    display: "none",
  },
  buttonBorderHighlight: {
    borderBottom: "2px solid blue",
  },
  rowBgGreen: {
    backgroundColor: "#a4e6a4",
  },
  rowBgRed: {
    backgroundColor: "#efb7b7",
  },
  rowBgYellow: {
    backgroundColor: "#f1f19c",
  },
  streamingContainer: {
    display: "flex",
    margin: "16px 0px",
    flexWrap: "wrap",
  },
  streamingItem: {
    width: "50%",
  },
  stream: {
    height: 400,
    margin: "0px 16px",
  },

  // Stacked chart styles
  container: {
    display: "flex",
    margin: "16px 24px",
  },
  chartContainer: {
    margin: 8,
    padding: 8,
  },
});

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
      height: 400,
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
      enabled: false,
    },
    tooltip: {
      headerFormat: "<b>{point.x}</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
    },
    plotOptions: {
      column: {
        // grouping: true,
        // stacking: "normal",
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

const App = () => {
  const [ticker, setTicker] = useState("");
  const [tickers, setTickers] = useState([]);
  const [tickersInWatchlist, setTickersInWatchlist] = useState([]);
  const [watchlist, setWatchlist] = useState({});
  const [streamActive, setStreamActive] = useState(false);
  const [lastTrades, setLastTrades] = useState({});
  const [tickersFundamentals, setTickersFundamentals] = useState({});
  const [showWatchlist, setShowWatchlist] = useState(true);
  const trades = useRef({});
  const [formattedTrades, setFormattedTrades] = useState({});
  const lastUpdatedRef = useRef(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const getTickersFromWatchlist = (_id) => {
    getSpecificWatchlist(_id).then((res) => {
      if (res.assets.length) {
        setTickersInWatchlist(res.assets.map((a) => a.symbol));
      }
    });
  };

  const updateTickers = (add, _ticker) => {
    if (add) {
      addToWatchlist(watchlist.id, _ticker).then((res) => {
        if (res.assets) {
          setTicker("");
        }
        getTickersFromWatchlist(watchlist.id);
      });
    } else {
      deleteFromWatchlist(watchlist.id, _ticker).then(() => {
        getTickersFromWatchlist(watchlist.id);
      });
    }
  };

  const removeTicker = (symbol) => {
    setTickers(tickers.filter((ticker) => ticker.symbol !== symbol));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      updateTickers(true, ticker);
    }
  };

  const updateDataStreamConnectionStatus = () => {
    getConnectionStatus().then((res) => setStreamActive(res.connectionActive));
  };

  const fetchTopGainers = () => {
    toggleListView(false);
    getTopGainers();
  };

  const getFundamentals = (ticker) => {
    getFundamentalsFinviz(ticker).then(({ symbol, data }) => {
      _tickersFundamentals[ticker] = data;
      setTickersFundamentals(
        Object.assign({}, tickersFundamentals, { [symbol]: data })
      );
      console.log(tickersFundamentals);
    });
  };

  const toggleListView = (_showWatchlist) => {
    setShowWatchlist(_showWatchlist);
  };

  useEffect(() => {
    const socket = connectSocket();

    socket.on("LastTrade", (data) => {
      setLastTrades(data);
    });

    socket.on("Trade", (data) => {
      const _trades = { ...trades.current };

      if (_trades[data.Symbol]) {
        _trades[data.Symbol].push(data);
      } else {
        _trades[data.Symbol] = [data];
      }
      trades.current = _trades;
    });

    socket.on("TickerFundamentals", ({ ticker, data }) => {
      _tickersFundamentals[ticker] = data;
      setTickersFundamentals(_tickersFundamentals);
    });

    socket.on("gainers", (data) => {
      const previousDataTickers = _tickersClone.map((t) => t.symbol);
      const currentDataTickers = data.map((d) => d.symbol);

      const _data = data.map((_ticker) => {
        const tickerIndexFromCurrentData = currentDataTickers.indexOf(
          _ticker.symbol
        );
        const tickerIndexFromPreviousData = previousDataTickers.indexOf(
          _ticker.symbol
        );

        if (tickerIndexFromPreviousData === -1) {
          _ticker.newEntry = true;
        } else {
          if (tickerIndexFromCurrentData > tickerIndexFromPreviousData) {
            _ticker.movedLower = true;
          } else if (tickerIndexFromCurrentData < tickerIndexFromPreviousData) {
            _ticker.movedHigher = true;
          }
        }

        return _ticker;
      });
      _tickersClone = _data;
      setTickers(_data);
    });

    // Notifications
    if (!Notification) {
      alert(
        "Desktop notifications not available in your browser. Try Chromium."
      );
      return;
    }

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Get all watchlists
    getAllWatchlists().then((response) => {
      getTickersFromWatchlist(response[0].id);
      setWatchlist(response[0]);
    });

    updateDataStreamConnectionStatus();

    return () => {
      socket.off("LastTrade");
      socket.off("TickerFundamentals");
      socket.off("gainers");
    };
  }, []);

  useEffect(() => {
    const _currentTrades = { ...trades.current };
    const symbols = Object.keys(_currentTrades);

    const _formattedTrades = {};

    symbols.forEach((symbol) => {
      const _trades = _currentTrades[symbol] || [];
      const formattedTradesByTimeAndPrice = {};

      _trades.forEach((t) => {
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

      let formattedTradesByPrice = {};

      _trades.forEach((t) => {
        const _time = t.Timestamp.split("T")[1]?.split("-")[0];
        const price = parseFloat(t.Price).toFixed(2);

        const [hours, minutes] = _time.split(":");

        if (!formattedTradesByPrice[price]) {
          formattedTradesByPrice[price] = t.Size;
        } else {
          formattedTradesByPrice[price] += t.Size;
        }
      });

      _formattedTrades[symbol] = {
        formattedTradesByTimeAndPrice,
        formattedTradesByPrice,
      };
    });

    setFormattedTrades(_formattedTrades);
  }, [lastUpdated]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(Date.now());
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const classes = useStyles();

  return (
    <div>
      <div>
        <div className={classes.addTickerForm}>
          <TextField
            className={classes.tickerInputField}
            id="ticker"
            label="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => updateTickers(true, ticker)}
          >
            Add
          </Button>
        </div>
        <div className={classes.actionsContainer}>
          <div className={classes.lists}>
            <IconButton
              variant="contained"
              color="primary"
              onClick={() => fetchTopGainers()}
              className={!showWatchlist ? classes.buttonBorderHighlight : ""}
            >
              <TrendingUpIcon />
            </IconButton>
            <IconButton
              variant="contained"
              color="primary"
              onClick={() => toggleListView(true)}
              className={showWatchlist ? classes.buttonBorderHighlight : ""}
            >
              <ListIcon />
            </IconButton>
          </div>
          <div className={classes.actions}>
            <IconButton
              variant="contained"
              color="primary"
              onClick={() =>
                connectToStream(watchlist.id).then(
                  updateDataStreamConnectionStatus
                )
              }
              disabled={streamActive}
            >
              <PlayCircleFilledWhiteIcon />
            </IconButton>
            <IconButton
              variant="contained"
              color="secondary"
              onClick={() =>
                disconnectFromStream().then(updateDataStreamConnectionStatus)
              }
              disabled={!streamActive}
            >
              <StopIcon />
            </IconButton>
          </div>
        </div>

        {/*Gainers list */}
        <div className={showWatchlist ? classes.none : classes.block}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.deleteIcon}></TableCell>
                  <TableCell component="th">Ticker</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell component="th" align="right">
                    Percentage
                  </TableCell>
                  <TableCell component="th" align="right">
                    Volume
                  </TableCell>
                  <TableCell component="th" align="right">
                    Float
                  </TableCell>
                  <TableCell component="th" align="right">
                    Ins. Ownership
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickers.map(
                  (
                    {
                      symbol,
                      changeRatio,
                      volume,
                      newEntry,
                      movedHigher,
                      movedLower,
                      close,
                    },
                    i
                  ) => (
                    <TableRow
                      key={i}
                      className={
                        newEntry
                          ? classes.rowBgYellow
                          : movedHigher
                          ? classes.rowBgGreen
                          : movedLower
                          ? classes.rowBgRed
                          : ""
                      }
                    >
                      <TableCell>
                        {tickersInWatchlist.indexOf(symbol.toUpperCase()) >
                        -1 ? (
                          <IconButton
                            variant="contained"
                            color="primary"
                            onClick={() => updateTickers(false, symbol)}
                          >
                            <RemoveIcon />
                          </IconButton>
                        ) : (
                          <div className={classes.iconButtonsContainer}>
                            <IconButton
                              variant="contained"
                              color="primary"
                              onClick={() => updateTickers(true, symbol)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              variant="contained"
                              color="primary"
                              onClick={() => removeTicker(symbol)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        )}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {symbol}
                      </TableCell>
                      <TableCell align="right">{close}</TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {changeRatio
                          ? (changeRatio * 100).toFixed(2) + "%"
                          : ""}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        {volume ? numberWithCommas(volume) : ""}
                      </TableCell>
                      <TableCell align="right">
                        {tickersFundamentals[symbol] ? (
                          tickersFundamentals[symbol]["Shs Float"]
                        ) : (
                          <IconButton
                            variant="contained"
                            color="primary"
                            onClick={() => getFundamentals(symbol)}
                          >
                            <GetAppIcon />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {tickersFundamentals[symbol] ? (
                          tickersFundamentals[symbol]["Insider Own"]
                        ) : (
                          <IconButton
                            variant="contained"
                            color="primary"
                            onClick={() => getFundamentals(symbol)}
                          >
                            <GetAppIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {/* Watchlist */}
        <div className={showWatchlist ? classes.block : classes.none}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.deleteIcon}></TableCell>
                  <TableCell component="th">Ticker</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickersInWatchlist.map((symbol, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <IconButton
                        variant="contained"
                        color="primary"
                        onClick={() => updateTickers(false, symbol)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {symbol}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={
                        lastTrades[symbol] && lastTrades[symbol].increased
                          ? classes.green
                          : classes.red
                      }
                    >
                      {lastTrades[symbol]
                        ? lastTrades[symbol].Price.toFixed(2)
                        : ""}
                    </TableCell>
                    <TableCell align="right">
                      {lastTrades[symbol] ? lastTrades[symbol].Size : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      {/* Trades streaming */}
      <div className={classes.streamingContainer}>
        {tickersInWatchlist.map((ticker) => (
          <div className={classes.streamingItem}>
            <div>{ticker}</div>
            <div className={classes.stream}>
              <StackColumnChart
                data={
                  formattedTrades[ticker]?.formattedTradesByTimeAndPrice || []
                }
                segments={Object.keys(
                  formattedTrades[ticker]?.formattedTradesByPrice || []
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
