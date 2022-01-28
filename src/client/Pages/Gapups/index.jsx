import React, { Component, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Chart from "client/Pages/Home/Components/Chart/index";
import DailyChart from "client/Pages/Home/Components/Chart/DailyChart";
import { numberWithCommas } from "client/utils";

import { getAllGappedTickers, getIntradayBars } from "client/apis/historyApi";
import Select from "client/common/Dropdown/index.jsx";

import { processIntradayData } from "client/Pages/intradayStats";
import { getFundamentalsFinviz } from "client/apis/fundamentalsApi";
import { getHighVolumeDailyBars } from "client/apis/historyApi";

const useStyles = makeStyles({
  flexContainer: {
    display: "flex",
  },
  gapupContainer: {
    width: 220,
    height: 650,
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
  const [intradayStats, setIntradayStats] = useState({});
  const [fundamentals, setFundamentals] = useState({ averageData: {} });
  const [averageData, setAverageData] = useState({});
  const [gapupPercentageSelect, setGapupPercentageSelect] = useState(30);

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
    setGapups((__state) =>
      __state.filter((s) => s.gapUp >= event.target.value)
    );
  };

  return (
    <>
      <div className={classes.gapupStatsCriteriaContainer}>
        <Select
          value={gapupPercentageSelect}
          options={gapupOptions}
          onChange={gapupOnChange}
          label="Gap up"
        />
      </div>
      <div className={classes.flexContainer}>
        <div className={classes.gapupContainer}>
          {gapups.map(({ Symbol, gapUp, Volume, TimeStamp }) => (
            <div
              onClick={() => onGapperItemClick(TimeStamp.split("T")[0], Symbol)}
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
      </div>
    </>
  );
};

export default Gapups;
