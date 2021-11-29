import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import { numberWithCommas } from "client/utils";
import { getNasdaqHaltedTickers } from "client/apis/haltsApi";

const useStyles = makeStyles({
  haltedTickersContainer: {
    width: 500,
    height: 624,
    overflowY: "scroll",
  },
  haltedTickersRow: {
    display: "flex",
    cursor: "pointer",
  },
  rowSelected: {
    backgroundColor: "#cfd6ff",
  },
  haltedTickersRowField: {
    width: 100,
  },
  loadMore: {
    cursor: "pointer",
    backgroundColor: "#3f51b5",
    color: "white",
  },
  flexContainer: {
    display: "flex",
  },
  checkboxRoot: {
    padding: 0,
  },
});

const HaltedTickers = ({ onRowClick, selectedTicker, updateType }) => {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [haltedTickers, setHaltedTickers] = useState([]);

  const getHaltedTickers = (page = 1) => getNasdaqHaltedTickers(page);

  const loadNextHaltedTickers = () => {
    setPage((_page) => _page + 1);
  };

  //   useEffect(() => {
  //     getHaltedTickers().then(({ results: tickers }) => {
  //       setHaltedTickers(tickers);
  //     });
  //   }, []);

  useEffect(() => {
    getHaltedTickers(page).then(({ results: tickers }) => {
      setHaltedTickers((_tickers) => [..._tickers, ...tickers]);
    });
  }, [page]);

  const updateTicker = (id, type, typeValue) => {
    updateType(id, type, typeValue);

    setHaltedTickers((_tickers) =>
      _tickers.map((t) => {
        if (t._id === id) {
          t[type] = typeValue;
        }

        return t;
      })
    );
  };

  return (
    <>
      <Paper variant="outlined" className={classes.haltedTickersContainer}>
        {haltedTickers.map(
          ({
            haltDate,
            haltTime,
            issueSymbol,
            reasonCode,
            market,
            validHaltResumeEntry,
            _id,
            validMarketOpenHaltEntry,
            dayVolume,
          }) => {
            return (
              <div
                className={`${classes.haltedTickersRow} ${
                  selectedTicker === issueSymbol ? classes.rowSelected : ""
                }`}
                onClick={() => onRowClick(haltDate, issueSymbol)}
              >
                <div className={classes.flexContainer}>
                  {/* <Checkbox
                    classes={{
                      root: classes.checkboxRoot,
                    }}
                    checked={validHaltResumeEntry}
                    onChange={() =>
                      updateTicker(
                        _id,
                        "validHaltResumeEntry",
                        !validHaltResumeEntry
                      )
                    }
                  />
                  <Checkbox
                    classes={{
                      root: classes.checkboxRoot,
                    }}
                    color="primary"
                    checked={validMarketOpenHaltEntry}
                    onChange={() =>
                      updateTicker(
                        _id,
                        "validMarketOpenHaltEntry",
                        !validMarketOpenHaltEntry
                      )
                    }
                  /> */}
                </div>
                <div className={classes.haltedTickersRowField}>
                  {haltDate.split("T")[0]}
                </div>
                <div className={classes.haltedTickersRowField}>
                  {issueSymbol}
                </div>
                <div className={classes.haltedTickersRowField}>
                  {reasonCode}
                </div>
                <div className={classes.haltedTickersRowField}>
                  {numberWithCommas(dayVolume || 0)}
                </div>
                <div className={classes.haltedTickersRowField}>{haltTime}</div>
                <div className={classes.haltedTickersRowField}>{market}</div>
              </div>
            );
          }
        )}
        <div onClick={loadNextHaltedTickers} className={classes.loadMore}>
          Load More
        </div>
      </Paper>
    </>
  );
};

export default HaltedTickers;
