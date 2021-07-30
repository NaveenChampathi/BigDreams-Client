import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Checkbox from '@material-ui/core/Checkbox';
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";

import tickers from "client/tickersWithFloatUpdated.json";
import StockChart from "client/Pages/StocksTable/StockChart";
import Summary from "client/Pages/StocksTable/Summary";

import tKeys from './columns';
import { convertDate, summarize, numberWithCommas, formatData } from './utils';

const tags = [
  "GUS",
  "BS",
  "GUS+BS",
  "GUS+PM",
  "BS+PM",
  "INT_DAY_DT",
  "ALL_DAY_FADER",
  "MORNING_PUSH+DT",
  "PM+DT",
];

const applyFilterLogicBelow = false;

const shouldAllowTicker = (item) => {
  const volume = 0;
  const marketCap = 0;
  const price = 0;
  const preMarketVolume = 0;
  const float = 0;
  const volumeHigh = 0;
  const marketCapHigh = 0;
  const priceHigh = 0;
  const preMarketVolumeHigh = 0;
  const floatHigh = 0;

  if (!applyFilterLogicBelow) {
    return true;
  }

  if (
    item.volume >= volume &&
    item.volume <= volumeHigh &&
    item.marketCap >= marketCap &&
    item.marketCap <= marketCapHigh
  ) {
    return true;
  }

  return false;
};

const processDataForCondition = (data, condition, year, mktCap, float) => {
  let result = condition === 'all' ? {} : {
    "0-10": [],
    "10-20": [],
    "20-30": [],
    "30-40": [],
    "40-50": [],
    "50-60": [],
    "60-70": [],
    "70-80": [],
    "80-90": [],
    "90-100": [],
    ">100": [],
    other: [],
  };

  let paramsForCondition = {};

  switch (condition) {
    case "pml":
      paramsForCondition = {
        left: "preMarketHigh",
        right: "preMarketLow",
        against: "preMarketLow",
      };
      break;
    case "mog":
      paramsForCondition = { left: "high", right: "open", against: "open" };
      break;
    case "og":
      paramsForCondition = {
        left: "open",
        right: "previousClose",
        against: "previousClose",
      };
      break;
    default:
  }

  Object.keys(data).forEach((key) => {
    if (year === "all" || key === year) {
      data[key].map((item) => {
        let includeItem = true;
        switch (mktCap) {
          case "0-100":
            includeItem = Number(item.marketCap) <= 100000000;
            break;
          case "100-200":
            includeItem =
              Number(item.marketCap) <= 200000000 &&
              Number(item.marketCap) >= 100000000;
            break;
          case "200-300":
            includeItem =
              Number(item.marketCap) <= 300000000 &&
              Number(item.marketCap) >= 200000000;
            break;
          default:
            break;
        }

        if (!includeItem) {
          return;
        }

        let itemFloat = item.float.substr(0, item.float.length - 1);
        switch (float) {
          case "0-5":
            includeItem = Number(itemFloat) <= 5;
            break;
          case "5-10":
            includeItem = Number(itemFloat) <= 10 && Number(itemFloat) >= 5;
            break;
          case "10-15":
            includeItem = Number(itemFloat) <= 15 && Number(itemFloat) >= 10;
            break;
          case "15-20":
            includeItem = Number(itemFloat) <= 20 && Number(itemFloat) >= 15;
            break;
          case ">20":
            includeItem = Number(itemFloat) >= 20;
            break;
          default:
            break;
        }

        if (!includeItem) {
          return;
        }

        if(condition === 'all') {
          result[key] ? result[key].push(item) : result[key] = [item];
        } else {
          const pml =
          ((item[paramsForCondition.left] - item[paramsForCondition.right]) /
            item[paramsForCondition.against]) *
          100;

        switch (true) {
          case 0 <= pml && pml <= 10:
            result["0-10"].push(item);
            break;
          case 10 < pml && pml <= 20:
            result["10-20"].push(item);
            break;
          case 20 < pml && pml <= 30:
            result["20-30"].push(item);
            break;
          case 30 < pml && pml <= 40:
            result["30-40"].push(item);
            break;
          case 40 < pml && pml <= 50:
            result["40-50"].push(item);
            break;
          case 50 < pml && pml <= 60:
            result["50-60"].push(item);
            break;
          case 60 < pml && pml <= 70:
            result["60-70"].push(item);
            break;
          case 70 < pml && pml <= 80:
            result["70-80"].push(item);
            break;
          case 80 < pml && pml <= 90:
            result["80-90"].push(item);
            break;
          case 90 < pml && pml <= 100:
            result["90-100"].push(item);
            break;
          case pml > 100:
            result[">100"].push(item);
            break;
          default:
            result.other.push(item);
            break;
        }
        }
      });
    }
  });

  return result;
};

// StyledTableCell Component start
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    cursor: "pointer",
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

// StyledTableCell Component end

// CustomizedTables Component start
const tableStyles = makeStyles({
  tableContainer: {
    height: "750px",
  },
  table: {
    minWidth: 700,
  },
  greenBG: {
    backgroundColor: "#a3e4a5",
  },
  redBG: {
    backgroundColor: "#da7878",
  },
});

function CustomizedTables({ data, tableKeys }) {
  const classes = tableStyles();
  const [sortByKey, setSortByKey] = useState(null);
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    if (sortByKey) {
      let cloneData = [...data];
      const direction = sortByKey.includes("-Asc") ? "asc" : "desc";
      const sortKey = sortByKey.split("-")[0];

      let sortFunction = (a, b) => {
        return direction === "asc"
          ? parseFloat(a[sortKey]) - parseFloat(b[sortKey])
          : parseFloat(b[sortKey]) - parseFloat(a[sortKey]);
      };

      if (sortKey === "date") {
        sortFunction = (a, b) => {
          return direction === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        };
      }

      if (sortKey) {
        cloneData = cloneData.sort(sortFunction);
      }

      setChartData(cloneData);
    }
  }, [sortByKey]);

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table
        stickyHeader
        className={classes.table}
        aria-label="customized table"
      >
        <TableHead>
          <TableRow>
            {tableKeys.map((item, i) => !item.hidden ? (
              <StyledTableCell
                align="right"
                key={i}
                onClick={() =>
                  setSortByKey(
                    sortByKey === item.key + "-Asc"
                      ? item.key + "-Desc"
                      : item.key + "-Asc"
                  )
                }
              >
                <div style={{ display: "flex" }}>
                  {item.name}
                  {sortByKey === item.key + "-Asc" ? (
                    <ArrowUpward />
                  ) : sortByKey === item.key + "-Desc" ? (
                    <ArrowDownward />
                  ) : null}
                </div>
              </StyledTableCell>
            ) : null)}
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.map((dataItem, i) => (
            <TableRow
              classes={{
                root:
                  parseFloat(dataItem.close) > parseFloat(dataItem.open)
                    ? classes.greenBG
                    : classes.redBG,
              }}
              key={i}
            >
              {tableKeys.map((item, i) => {
                const value = item.key.includes("derived")
                  ? item.fn(dataItem)
                  : dataItem[item.key];
                return item.hidden ? null : (
                  <StyledTableCell key={i} align="right">
                    {formatData(item.format, value)}
                    {/* {item.key === "close" && <StockChart data={dataItem} />} */}
                  </StyledTableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
// CustomizedTables Component End

// ColumsEditor Component start
const columnStyles = makeStyles((theme) => ({
  columnsEditorContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '20px 5px',
    padding: '20px 20px',
    backgroundColor: 'white'
  },
  columns: {
    width: '200px',
    textAlign: 'left'
  }
}));

const ColumnsEditor = ({tableKeys, setTableKeys}) => {
  const classes = columnStyles();

  const handleChange = (key) => {
    const cloneTKeys = [...tableKeys];

    setTableKeys(cloneTKeys.map(tColumn => {
      return key === tColumn.key ? {
        ...tColumn,
        hidden: !tColumn.hidden
      } : tColumn;
    }));
  };

  return (<div className={classes.columnsEditorContainer}>
    {tableKeys.map(tableColumn => {
      return <div className={classes.columns}>
        <Checkbox
            checked={!tableColumn.hidden}
            onChange={() => handleChange(tableColumn.key)}
            name="checkedB"
            color="primary"
          /> {tableColumn.name}
      </div>
    })}
  </div>)
}

// ColumsEditor Component end

//  SimpleAccordion Component Start
const useStyles = makeStyles((theme) => ({
  root: {
    margin: "1rem 0",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  summary: {
    display: "flex",
    marginLeft: "80%",
  },
  item: {
    display: "flex",
    fontSize: "large",
  },
  green: {
    height: "32px",
    width: "32px",
    marginRight: "8px",
    backgroundColor: "#a3e4a5",
  },
  red: {
    height: "32px",
    width: "32px",
    marginRight: "8px",
    backgroundColor: "#da7878",
  },
  percentage: {
    fontSize: "small",
    marginRight: "16px",
  },
  yearsButtons: {
    margin: "1rem 0",
  },
  totalTickers: {
    backgroundColor: '#3451ff',
    color: '#fff',
    width: '34px',
    fontSize: '20px',
    paddingTop: '3px',
    marginRight: '20px'
  }
}));

export default function SimpleAccordion({ trim }) {
  const classes = useStyles();
  const [accordionsOpenState, setAccordionOpenState] = useState({});

  const [chartData, setChartData] = useState({});
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMktCap, setSelectedMktCap] = useState("");
  const [selectedFloat, setSelectedFloat] = useState("");
  const [tableKeys, setTableKeys] = useState(tKeys);

  const handleAccordionStateChange = (event, expanded, index) => {
    let accordionStates = { ...accordionsOpenState };
    accordionStates[index] = expanded;
    setAccordionOpenState(accordionStates);
  };

  useEffect(() => {
    switch (trim) {
      case "all":
        setAccordionOpenState({});
        // setSelectedYear("all");
        setChartData(processDataForCondition(
          tickers,
          "all",
          selectedYear,
          selectedMktCap,
          selectedFloat
        ));
        break;
      case "pml":
        setAccordionOpenState({});
        setChartData(
          processDataForCondition(
            tickers,
            "pml",
            selectedYear,
            selectedMktCap,
            selectedFloat
          )
        );
        break;
      case "mog":
        setAccordionOpenState({});
        setChartData(
          processDataForCondition(
            tickers,
            "mog",
            selectedYear,
            selectedMktCap,
            selectedFloat
          )
        );
        break;
      case "og":
        setAccordionOpenState({});
        setChartData(
          processDataForCondition(
            tickers,
            "og",
            selectedYear,
            selectedMktCap,
            selectedFloat
          )
        );
        break;
      default:
        setChartData({});
    }
  }, [trim, selectedYear, selectedMktCap, selectedFloat]);

  return (
    <div className={classes.root}>
      {(
        <div className={classes.yearsButtons}>
          <Button
            color="primary"
            variant={`${selectedYear === "all" ? "outlined" : ""}`}
            onClick={() => setSelectedYear("all")}
          >
            All
          </Button>
          {Object.keys(tickers).map((year) => (
            <Button
              color="primary"
              variant={`${selectedYear === year ? "outlined" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      )}

      <div className={classes.yearsButtons}>
        <Button
          color="primary"
          variant={`${selectedMktCap === "" ? "outlined" : ""}`}
          onClick={() => setSelectedMktCap("")}
        >
          ALL
        </Button>
        <Button
          color="primary"
          variant={`${selectedMktCap === "0-100" ? "outlined" : ""}`}
          onClick={() => setSelectedMktCap("0-100")}
        >
          0-100
        </Button>
        <Button
          color="primary"
          variant={`${selectedMktCap === "100-200" ? "outlined" : ""}`}
          onClick={() => setSelectedMktCap("100-200")}
        >
          100-200
        </Button>
        <Button
          color="primary"
          variant={`${selectedMktCap === "200-300" ? "outlined" : ""}`}
          onClick={() => setSelectedMktCap("200-300")}
        >
          200-300
        </Button>
      </div>

      <div className={classes.yearsButtons}>
        <Button
          color="primary"
          variant={`${selectedFloat === "" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat("")}
        >
          ALL
        </Button>
        <Button
          color="primary"
          variant={`${selectedFloat === "0-5" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat("0-5")}
        >
          0-5
        </Button>
        <Button
          color="primary"
          variant={`${selectedFloat === "5-10" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat("5-10")}
        >
          5-10
        </Button>
        <Button
          color="primary"
          variant={`${selectedFloat === "10-15" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat("10-15")}
        >
          10-15
        </Button>
        <Button
          color="primary"
          variant={`${selectedFloat === "15-20" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat("15-20")}
        >
          15-20
        </Button>
        <Button
          color="primary"
          variant={`${selectedFloat === ">20" ? "outlined" : ""}`}
          onClick={() => setSelectedFloat(">20")}
        >
          >20
        </Button>
      </div>

      <ColumnsEditor tableKeys={tableKeys} setTableKeys={setTableKeys} />

      {Object.keys(chartData).map((year, i) => {
        const { green, red, summary } = summarize(chartData[year]);

        return (
          <Accordion
            key={year}
            expanded={accordionsOpenState[i]}
            onChange={(e, state) => handleAccordionStateChange(e, state, i)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>{year}</Typography>
              <div className={classes.summary}>
              <div className={classes.totalTickers}>{green + red}</div>
                <div className={classes.item}>
                  <Summary summary={summary.green}>
                    <>
                      {" "}
                      <div className={classes.green}></div>
                      <div>{green}</div>
                      &nbsp;
                      <div className={classes.percentage}>
                        {((green / (green + red)) * 100).toFixed(2)}%
                      </div>
                    </>
                  </Summary>
                </div>
                <div className={classes.item}>
                  <Summary summary={summary.red}>
                    <>
                      <div className={classes.red}></div>
                      <div>{red}</div>&nbsp;
                      <div className={classes.percentage}>
                        {((red / (green + red)) * 100).toFixed(2)}%
                      </div>
                    </>
                  </Summary>
                </div>
                
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {accordionsOpenState[i] && (
                <CustomizedTables tableKeys={tableKeys} data={chartData[year]} />
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
//  SimpleAccordion Component End
