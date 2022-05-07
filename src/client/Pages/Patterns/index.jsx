import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import Chart from "client/Pages/Home/Components/Chart/index";
import DailyChart from "client/Pages/Home/Components/Chart/DailyChart";
import { numberWithCommas, getDateYYYYMMDD } from "client/utils";

import {
  getAllGappedTickers,
  getIntradayBars,
  getAllMultidayTickers,
  getAllMarketOpenGappedTickers,
} from "client/apis/historyApi";
import Select from "client/common/Dropdown/index.jsx";

import { processIntradayData } from "client/Pages/intradayStats";
import { getFundamentalsFinviz } from "client/apis/fundamentalsApi";
import { getHighVolumeDailyBars } from "client/apis/historyApi";
import { getNasdaqHaltedTickers } from "client/apis/haltsApi";

const useStyles = makeStyles({
  flexContainer: {
    display: "flex",
  },
  gapupContainer: {
    width: 220,
    height: 625,
    overflowY: "auto",
    margin: "0px 12px",
    backgroundColor: "white",
  },
  gapupItemContainer: {
    display: "flex",
    cursor: "pointer",
    padding: "6px 12px",
    "&:hover": {
      backgroundColor: "#e2e7ff",
    },
  },
  gapupSymbolContainer: {
    width: 100,
    flex: 1,
    textAlign: "left",
    fontSize: 24,
  },
  gapupPercentage: {
    fontSize: 20,
  },
  gapupVolume: {
    color: "gray",
  },
  intradayChartContainer: {
    height: 650,
    flex: 1,
    textAlign: "initial",
    backgroundColor: "white",
    margin: "0px 16px 0px 0px",
  },
  dailyChartContainer: {
    height: 650,
    flex: 1,
    textAlign: "initial",
    backgroundColor: "white",
    margin: "8px 16px 8px 0px",
  },
  gapupDate: {
    color: "gray",
    textAlign: "left",
  },
  gapupStatsCriteriaContainer: {
    display: "flex",
    margin: 16,
  },
  intradayStatsContainer: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "white",
    margin: "8px 12px",
    width: 820,
    height: 250,
  },
  intradayStat: {
    width: 100,
    margin: "8px 8px",
  },
  intradayStatLabel: {
    color: "gray",
    textAlign: "left",
  },
  intradayStatValue: {
    fontSize: 20,
    textAlign: "left",
  },
  buttonGroup: {
    margin: "0 16px",
  },
  loadMore: {
    cursor: "pointer",
    backgroundColor: "#3f51b5",
    color: "white",
  },
});

const gapupOptions = [
  { value: 30, label: "> 30" },
  { value: 40, label: "> 40" },
  { value: 50, label: "> 50" },
  { value: 60, label: "> 60" },
  { value: 70, label: "> 70" },
  { value: 80, label: "> 80" },
  { value: 90, label: "> 90" },
  { value: 100, label: "> 100" },
  { value: 150, label: "> 150" },
  { value: 200, label: "> 200" },
];

const processData = (data) => {
  const results = {};
  let gapSum = 0;
  let morningPushSum = 0;
  let rangeSum = 0;

  results.dailyData = data.map((d) => {
    let gap = +(
      ((d.OpenPrice - d.PreviousClose) / d.PreviousClose) *
      100
    ).toFixed(2);
    let morningPush = +(
      ((d.HighPrice - d.OpenPrice) / d.OpenPrice) *
      100
    ).toFixed(2);
    let range = +(((d.HighPrice - d.LowPrice) / d.LowPrice) * 100).toFixed(2);

    gapSum += gap;
    morningPushSum += morningPush;
    rangeSum += range;

    return {
      ...d,
      gap,
      morningPush,
      range,
    };
  });

  results.averageData = {
    avgGap: (gapSum / data.length).toFixed(2),
    avgMorningPush: (morningPushSum / data.length).toFixed(2),
    avgRange: (rangeSum / data.length).toFixed(2),
  };

  return results;
};

const Gapups = () => {
  const classes = useStyles();
  const [date, setDate] = useState(null);
  const [ticker, setTicker] = useState(null);
  const [gapups, setGapups] = useState([]);
  const [marketOpenGapups, setMarketOpenGapups] = useState([]);
  const [multiDayTickers, setMultiDayTickers] = useState([]);
  const [intradayStats, setIntradayStats] = useState({});
  const [fundamentals, setFundamentals] = useState({ averageData: {} });
  const [averageData, setAverageData] = useState({});
  const [gapupPercentageSelect, setGapupPercentageSelect] = useState(30);
  const [selectedType, setSelectedType] = useState("gapUp");
  const [page, setPage] = useState(1);
  const [haltResumeTickers, setHaltResumeTickers] = useState([]);

  const onGapperItemClick = (_date, _ticker) => {
    setDate(_date);
    setTicker(_ticker);

    getIntradayBars(_date, _ticker, 1, 0, 0).then((data) => {
      setIntradayStats(processIntradayData(data));
    });

    getFundamentalsFinviz(_ticker)
      .then((data) => {
        setFundamentals(data.data);
      })
      .catch((err) => {
        setFundamentals({ averageData: {} });
      });

    getHighVolumeDailyBars(_ticker).then((data) => {
      const { averageData } = processData(data);
      setAverageData(averageData);
    });
  };

  useEffect(() => {
    getAllGappedTickers().then(({ results }) =>
      setGapups(
        results.sort((a, b) => new Date(b.TimeStamp) - new Date(a.TimeStamp))
      )
    );
  }, []);

  const gapupOnChange = (event) => {
    setGapupPercentageSelect(event.target.value);
    if (selectedType !== "gapUp" && selectedType !== "marketOpenGapup") {
      setSelectedType("gapUp");
    }

    if (selectedType === "gapUp") {
      setGapups((__state) =>
        __state.filter((s) => s.gapUp >= event.target.value)
      );
    } else if (selectedType === "marketOpenGapup") {
      setMarketOpenGapups((__state) =>
        __state.filter((s) => s.marketOpenGapup >= event.target.value)
      );
    }
  };

  const fetchMultiDayTickers = () => {
    if (!multiDayTickers.length) {
      getAllMultidayTickers().then(({ results }) =>
        setMultiDayTickers(
          results.sort((a, b) => new Date(b.TimeStamp) - new Date(a.TimeStamp))
        )
      );
    }
  };

  const fetchMarketOpenGapupTickers = () => {
    if (!marketOpenGapups.length) {
      getAllMarketOpenGappedTickers().then(({ results }) =>
        setMarketOpenGapups(
          results.sort((a, b) => new Date(b.TimeStamp) - new Date(a.TimeStamp))
        )
      );
    }
  };

  const getHaltedTickers = (page = 1) => getNasdaqHaltedTickers(page);

  const fetchHaltResumeTickers = () => {
    if (!haltResumeTickers.length) {
      getHaltedTickers().then(({ results }) =>
        setHaltResumeTickers(
          results.sort((a, b) => new Date(b.TimeStamp) - new Date(a.TimeStamp))
        )
      );
    }
  };

  const selectTypeChange = (type) => {
    setSelectedType(type);
    switch (type) {
      case "gapUp":
        gapupOnChange({ target: { value: gapupPercentageSelect } });
        break;
      case "multiDay":
        fetchMultiDayTickers();
        break;
      case "haltResume":
        fetchHaltResumeTickers();
      case "marketOpenGapup":
        fetchMarketOpenGapupTickers();
        break;
    }
  };

  const getUpdatedDate = (date) => {
    const updatedDate = new Date(
      new Date(date).setDate(new Date(date).getDate() + 7)
    );

    return getDateYYYYMMDD(updatedDate);
  };

  const loadNextHaltedTickers = () => {
    setPage((_page) => {
      getHaltedTickers(_page + 1).then(({ results: tickers }) => {
        setHaltResumeTickers((_tickers) => [..._tickers, ...tickers]);
      });
      return _page + 1;
    });
  };

  return (
    <>
      <div className={classes.gapupStatsCriteriaContainer}>
        <Select
          value={gapupPercentageSelect}
          options={gapupOptions}
          onChange={gapupOnChange}
          label="Gap up"
          disable
        />
        <ButtonGroup
          size="small"
          color="primary"
          disableElevation
          variant="contained"
          className={classes.buttonGroup}
        >
          <Button
            variant={selectedType === "gapUp" ? "contained" : "outlined"}
            onClick={() => selectTypeChange("gapUp")}
          >
            Gap ups
          </Button>
          <Button
            variant={
              selectedType === "marketOpenGapup" ? "contained" : "outlined"
            }
            onClick={() => selectTypeChange("marketOpenGapup")}
          >
            MO Gap ups
          </Button>
          <Button
            variant={selectedType === "multiDay" ? "contained" : "outlined"}
            onClick={() => selectTypeChange("multiDay")}
          >
            Multi Day
          </Button>
          <Button
            variant={selectedType === "haltResume" ? "contained" : "outlined"}
            onClick={() => selectTypeChange("haltResume")}
          >
            Halt Resume
          </Button>
        </ButtonGroup>
      </div>
      <div className={classes.flexContainer}>
        {/* Gap up container */}
        {selectedType === "gapUp" && (
          <div>
            <div className={classes.gapupContainer}>
              {gapups.map(({ Symbol, gapUp, Volume, TimeStamp }) => (
                <div
                  onClick={() =>
                    onGapperItemClick(TimeStamp.split("T")[0], Symbol)
                  }
                  className={classes.gapupItemContainer}
                >
                  <div>
                    <div className={classes.gapupSymbolContainer}>{Symbol}</div>
                    <div className={classes.gapupDate}>
                      {TimeStamp.split("T")[0]}
                    </div>
                  </div>
                  <div>
                    <div className={classes.gapupPercentage}>{gapUp}</div>
                    <div className={classes.gapupVolume}>
                      {numberWithCommas(Volume)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>Total: {gapups.length}</div>
          </div>
        )}
        {/* Market Open Gap up container */}
        {selectedType === "marketOpenGapup" && (
          <div>
            <div className={classes.gapupContainer}>
              {marketOpenGapups.map(
                ({ Symbol, marketOpenGapup, Volume, TimeStamp }) => (
                  <div
                    onClick={() =>
                      onGapperItemClick(TimeStamp.split("T")[0], Symbol)
                    }
                    className={classes.gapupItemContainer}
                  >
                    <div>
                      <div className={classes.gapupSymbolContainer}>
                        {Symbol}
                      </div>
                      <div className={classes.gapupDate}>
                        {TimeStamp.split("T")[0]}
                      </div>
                    </div>
                    <div>
                      <div className={classes.gapupPercentage}>
                        {marketOpenGapup.toFixed(2)}
                      </div>
                      <div className={classes.gapupVolume}>
                        {numberWithCommas(Volume)}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <div>Total: {marketOpenGapups.length}</div>
          </div>
        )}

        {/* MultiDayRunners container */}
        {selectedType === "multiDay" && (
          <div>
            <div className={classes.gapupContainer}>
              {multiDayTickers.map(({ Symbol, gapUp, Volume, TimeStamp }) => (
                <div
                  onClick={() =>
                    onGapperItemClick(TimeStamp.split("T")[0], Symbol)
                  }
                  className={classes.gapupItemContainer}
                >
                  <div>
                    <div className={classes.gapupSymbolContainer}>{Symbol}</div>
                    <div className={classes.gapupDate}>
                      {TimeStamp.split("T")[0]}
                    </div>
                  </div>
                  <div>
                    <div className={classes.gapupPercentage}>{gapUp}</div>
                    <div className={classes.gapupVolume}>
                      {numberWithCommas(Volume)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>Total: {multiDayTickers.length}</div>
          </div>
        )}

        {/* MultiDayRunners container */}
        {selectedType === "haltResume" && (
          <div>
            <div className={classes.gapupContainer}>
              {haltResumeTickers.map(
                ({ haltDate, haltTime, issueSymbol, dayVolume }) => (
                  <div
                    onClick={() =>
                      onGapperItemClick(haltDate.split("T")[0], issueSymbol)
                    }
                    className={classes.gapupItemContainer}
                  >
                    <div>
                      <div className={classes.gapupSymbolContainer}>
                        {issueSymbol}
                      </div>
                      <div className={classes.gapupDate}>
                        {haltDate.split("T")[0]}
                      </div>
                    </div>
                    <div>
                      <div className={classes.gapupPercentage}>{haltTime}</div>
                      <div className={classes.gapupVolume}>
                        {numberWithCommas(dayVolume)}
                      </div>
                    </div>
                  </div>
                )
              )}
              <div onClick={loadNextHaltedTickers} className={classes.loadMore}>
                Load More
              </div>
            </div>
            <div>Total: {haltResumeTickers.length}</div>
          </div>
        )}
        {/* <div>
        <DailyChart date={date} ticker={ticker} />
      </div> */}
        <div className={classes.intradayChartContainer}>
          <Chart date={date} ticker={ticker} />
        </div>
      </div>
      <div className={classes.flexContainer}>
        <div className={classes.intradayStatsContainer}>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {fundamentals["Shs Float"] || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Float</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {fundamentals["Insider Own"] || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Insider Own</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {fundamentals["Inst Own"] || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Institution Own</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {fundamentals["Short Float"] || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Short Float</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {fundamentals["Income"] || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Income</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {averageData.avgMorningPush || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Avg. Mo. Push</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {averageData.avgRange || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Avg. Range</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {intradayStats.preMarketHigh || "-"}
            </div>
            <div className={classes.intradayStatLabel}>PM High</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {intradayStats.preMarketLowAfterHigh || "-"}
            </div>
            <div className={classes.intradayStatLabel}>PM Low A. High</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {numberWithCommas(intradayStats.preMarketVolume)}
            </div>
            <div className={classes.intradayStatLabel}>PM Volume</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {intradayStats.marketHigh || "-"}
            </div>
            <div className={classes.intradayStatLabel}>High</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {intradayStats.marketLowAfterHigh || "-"}
            </div>
            <div className={classes.intradayStatLabel}>Low</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {numberWithCommas(intradayStats.marketVolume)}
            </div>
            <div className={classes.intradayStatLabel}>Volume</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {numberWithCommas(intradayStats.marketOpen1MinVolume)}
            </div>
            <div className={classes.intradayStatLabel}>1m Volume</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {numberWithCommas(intradayStats.marketOpen2MinVolume)}
            </div>
            <div className={classes.intradayStatLabel}>2m Volume</div>
          </div>
          <div className={classes.intradayStat}>
            <div className={classes.intradayStatValue}>
              {numberWithCommas(intradayStats.marketOpen5MinVolume)}
            </div>
            <div className={classes.intradayStatLabel}>5m Volume</div>
          </div>
        </div>
        <div className={classes.dailyChartContainer}>
          <div>
            <DailyChart date={getUpdatedDate(date)} ticker={ticker} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Gapups;
