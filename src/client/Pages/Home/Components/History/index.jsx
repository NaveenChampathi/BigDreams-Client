import React, { Component, useState, useEffect, useRef } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { getHighVolumeDailyBars } from "client/apis/historyApi";
import {
  getFundamentalsFinviz,
  getBamsecFilings,
} from "client/apis/fundamentalsApi";
import { numberWithCommas } from "client/utils";

const BAMSEC_ROOT = "https://www.bamsec.com";

const useStyles = makeStyles({
  displayFlex: {
    display: "flex",
  },
  flexContainer: {
    flex: 1,
  },
  fundamentalsContainer: {
    display: "flex",
    flexWrap: "wrap",
    textAlign: "left",
    padding: "0 8px",
  },
  item: {
    width: "150px",
    padding: "2px 3px",
  },
  label: {
    color: "#676767",
    fontSize: "12px",
  },
  value: {
    fontSize: "20px",
    fontWeight: 600,
  },
  margin: {
    margin: "8px 6px",
  },
  gapperItemContainer: {
    display: "flex",
    cursor: "pointer",
  },
  gapperItemHeaderContainer: {
    display: "flex",
  },
  gapperItemDataContainer: {
    overflow: "auto",
    maxHeight: "400px",
  },
  itemField: {
    width: "80px",
    margin: "0 16px",
  },
  itemFieldExtraWide: {
    width: "160px",
    margin: "0 16px",
  },
  greenBG: {
    backgroundColor: "#a3e4a5",
    "&:hover": {
      backgroundColor: "#587d59",
    },
  },
  redBG: {
    backgroundColor: "#da7878",
    "&:hover": {
      backgroundColor: "#884e4e",
    },
  },
  newsDateContainer: {
    width: "145px",
    textAlign: "right",
  },
  newsContainer: {
    flex: 1,
    textAlign: "left",
    paddingLeft: "12px",
  },
  filingsContainer: {
    margin: "8px 6px",
    flex: 1,
  },
  filingsItemContainer: {
    display: "flex",
    textDecoration: "none",
    color: "black",
    margin: "0 8px",
    borderBottom: "1px solid #bdbdbd",
  },
  filingTitle: {
    flex: 1,
  },
});

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

const Widget = ({ onGapperItemClick }) => {
  const [dailyBars, setDailyBars] = useState([]);
  const [fundamentals, setFundamentals] = useState({ averageData: {} });
  const [filings, setFilings] = useState({ data: {} });
  const [averageData, setAverageData] = useState({});
  const [ticker, setTicker] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      getHighVolumeDailyBars(ticker).then((data) => {
        const { dailyData, averageData } = processData(data);
        setDailyBars(dailyData);
        setAverageData(averageData);
      });
      getFundamentalsFinviz(ticker)
        .then((data) => {
          setFundamentals(data.data);
        })
        .catch((err) => {
          setFundamentals({ averageData: {} });
        });
      getBamsecFilings(ticker)
        .then((data) => {
          setFilings(data);
        })
        .catch((err) => {
          setFilings({ data: {} });
        });
    }
  };

  const classes = useStyles();

  const {
    financialFilingsResults,
    newsFilingsResults,
    registrationsFilingsResults,
    otherFilingsResults,
  } = filings.data;

  return (
    <div className={classes.flexContainer}>
      <div className={classes.margin}>
        <TextField
          className={classes.tickerInputField}
          id="ticker"
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
      {/* Fundamentals */}
      <Paper variant="outlined" className={classes.margin}>
        <div className={classes.fundamentalsContainer}>
          <div className={classes.item}>
            <div className={classes.label}>Float</div>
            <div className={classes.value}>
              {fundamentals["Shs Float"] || "-"}
            </div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Insider Own</div>
            <div className={classes.value}>
              {fundamentals["Insider Own"] || "-"}
            </div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Institution Own</div>
            <div className={classes.value}>
              {fundamentals["Inst Own"] || "-"}
            </div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Short Float</div>
            <div className={classes.value}>
              {fundamentals["Short Float"] || "-"}
            </div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Income</div>
            <div className={classes.value}>{fundamentals["Income"] || "-"}</div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Avg. Mo. Push</div>
            <div className={classes.value}>
              {averageData.avgMorningPush || "-"}
            </div>
          </div>
          <div className={classes.item}>
            <div className={classes.label}>Avg. Range</div>
            <div className={classes.value}>{averageData.avgRange || "-"}</div>
          </div>
        </div>
      </Paper>
      {/* Gapper history */}
      <Paper variant="outlined" className={classes.margin}>
        <div className={classes.gappersContainer}>
          <div className={classes.gapperItemHeaderContainer}>
            <div className={classes.itemField}>Date</div>
            <div className={classes.itemField}>Gap %</div>
            <div className={classes.itemField}>Mo. Push %</div>
            <div className={classes.itemField}>Range %</div>
            <div className={classes.itemField}>P. Close</div>
            <div className={classes.itemFieldExtraWide}>
              Open | High | Low | Close
            </div>
            <div className={classes.itemField}>Volume</div>
          </div>
          <div className={classes.gapperItemDataContainer}>
            {dailyBars.map((d) => (
              <div
                className={`${classes.gapperItemContainer} ${
                  d.OpenPrice - d.ClosePrice > 0
                    ? classes.redBG
                    : classes.greenBG
                }`}
                onClick={() =>
                  onGapperItemClick(d.Timestamp.split("T")[0], ticker)
                }
              >
                <div className={classes.itemField}>
                  {d.Timestamp.split("T")[0]}
                </div>
                <div className={classes.itemField}>
                  {d.PreviousClose ? d.gap : "-"}%
                </div>
                <div className={classes.itemField}>{d.morningPush}%</div>
                <div className={classes.itemField}>{d.range}%</div>
                <div className={classes.itemField}>{d.PreviousClose}</div>
                <div
                  className={classes.itemFieldExtraWide}
                >{`${d.OpenPrice} | ${d.HighPrice} | ${d.LowPrice} | ${d.ClosePrice}`}</div>
                <div className={classes.itemField}>
                  {numberWithCommas(d.Volume)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Paper>

      {/* News */}
      <Paper variant="outlined" className={classes.margin}>
        <div className={classes.gappersContainer}>
          <div className={classes.newsDataContainer}>
            {fundamentals.news &&
              fundamentals.news.map(({ date, news, url }) => (
                <div className={classes.displayFlex}>
                  <div className={classes.newsDateContainer}>{date}</div>
                  <div className={classes.newsContainer}>
                    <a href={url} target="_blank">
                      {news}
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Paper>
      <div className={classes.displayFlex}>
        {/* Filings */}
        {financialFilingsResults && (
          <Paper variant="outlined" className={classes.filingsContainer}>
            {financialFilingsResults.map(
              ({ filingType, filingDate, filingUrl, title }) => (
                <a
                  target="_blank"
                  href={`${BAMSEC_ROOT}${filingUrl}`}
                  className={classes.filingsItemContainer}
                >
                  <div>{filingType}</div>
                  <div className={classes.filingTitle}>{title}</div>
                  <div>{filingDate}</div>
                </a>
              )
            )}
          </Paper>
        )}

        {/* registration */}
        {registrationsFilingsResults && (
          <Paper variant="outlined" className={classes.filingsContainer}>
            {registrationsFilingsResults.map(
              ({ filingType, filingDate, filingUrl, title }) => (
                <a
                  target="_blank"
                  href={`${BAMSEC_ROOT}${filingUrl}`}
                  className={classes.filingsItemContainer}
                >
                  <div>{filingType}</div>
                  <div className={classes.filingTitle}>{title}</div>
                  <div>{filingDate}</div>
                </a>
              )
            )}
          </Paper>
        )}

        {/* Other */}
        {otherFilingsResults && (
          <Paper variant="outlined" className={classes.filingsContainer}>
            {otherFilingsResults.map(
              ({ filingType, filingDate, filingUrl, title }) => (
                <a
                  target="_blank"
                  href={`${BAMSEC_ROOT}${filingUrl}`}
                  className={classes.filingsItemContainer}
                >
                  <div>{filingType}</div>
                  <div className={classes.filingTitle}>{title}</div>
                  <div>{filingDate}</div>
                </a>
              )
            )}
          </Paper>
        )}
        {/* Other */}
        {newsFilingsResults && (
          <Paper variant="outlined" className={classes.filingsContainer}>
            {newsFilingsResults.map(
              ({ filingType, filingDate, filingUrl, title }) => (
                <a
                  target="_blank"
                  href={`${BAMSEC_ROOT}${filingUrl}`}
                  className={classes.filingsItemContainer}
                >
                  <div>{filingType}</div>
                  <div className={classes.filingTitle}>{title}</div>
                  <div>{filingDate}</div>
                </a>
              )
            )}
          </Paper>
        )}
      </div>
    </div>
  );
};

export default Widget;
