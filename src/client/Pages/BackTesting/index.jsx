import React, {useState} from 'react';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } from "recharts";

import { backTest } from './backTest';
import { formatData } from 'client/Pages/StocksTable/utils';

const convertDate = (date) => {
    const dateObj = new Date(date);
    const months = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sept',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    };

    return `${months[dateObj.getUTCMonth()]}-${dateObj.getUTCDate()}-${dateObj.getUTCFullYear()}`
}

const styles = makeStyles({
    parametersContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '20px'
    },
    parameterField: {
        flex: 1,
        maxWidth: '500px',
        margin: '0 10px'
    },
    backTestingContainer: {
        margin: '100px 20px',
        backgroundColor: 'white',
        paddingTop: '20px',
        paddingBottom: '20px'
    },
    equityGraph: {
        margin: '50px 20px',
        display: 'flex',
        justifyContent: 'center'
    },
    buttonsContainer: {
        '& button' : {
            margin: '20px'
        }
    },
    summaryContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    labelsContainer: {
        textAlign: 'left'
    },
    valuesContainer: {
        textAlign: 'right'
    },
    value: {
        fontWeight: 600
    }
});

const tooltipStyles = makeStyles({
    container: {
        border: '1px solid gray',
        padding: '10px',
        display: 'flex',
        width: '300px'
    },
    labelsContainer: {
        flex: 1,
        textAlign: 'left'
    },
    valuesContainer: {
        flex: 1,
        textAlign: 'right'
    },
    green: {
        color: 'green'
    },
    red: {
        color: 'red'
    }
});

const CustomTooltip = ({ payload, active }) => {

    const classes = tooltipStyles();

    if (active && payload && payload.length && payload[0]) {
        const {entry, pnl, equity} = payload[0].payload;
      return (
        <div className={classes.container}>
          <div className={classes.labelsContainer}>
              <div>Symbol</div>
              <div>Float</div>
              <div>Gap</div>
              <div>P/L</div>
              <div>Date</div>
              <div>P. Close</div>
              <div>Open</div>
              <div>High</div>
              <div>Low</div>
              <div>Close</div>
              <div>Equity</div>
          </div>
          <div className={classes.valuesContainer}>
              <div>{entry.ticker}</div>
              <div>{entry.float}</div>
              <div>{formatData('%', entry.gap)}</div>
              <div className={parseInt(pnl) > 0 ? classes.green : classes.red}>{parseInt(pnl)}</div>
              <div>{convertDate(entry.date)}</div>
              <div>{entry.previousClose}</div>
              <div>{entry.open}</div>
              <div>{entry.high}</div>
              <div>{entry.low}</div>
              <div>{entry.close}</div>
              <div>{equity}</div>
          </div>
        </div>
      );
    }
  
    return null;
  };

const BackTesting = () => {

    const [year, setYear] = useState("2020");
    const [initialEquity, setInitialEquity] = useState(35000);
    const [amountToInvestPerTrade, setAmountToInvestPerTrade] = useState(5000);
    const [minPremarketVolume, setMinPremarketVolume] = useState(0);
    const [maxPremarketVolume, setMaxPremarketVolume] = useState(0);
    const [openPrice, setOpenPrice] = useState(0);
    const [maxPercentageLossPerTrade, setMaxPercentageLossPerTrade] = useState(60);
    const [minOpenToPremarketHighPercentage, setMinOpenToPremarketHighPercentage] = useState(0);
    const [maxOpenToPremarketHighPercentage, setMaxOpenToPremarketHighPercentage] = useState(0);
    const [maxPremarketSpikingPercentage, setMaxPremarketSpikingPercentage] = useState(0);
    const [minPremarketSpikingPercentage, setMinPremarketSpikingPercentage] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState({});

    const runBackTest = () => {
        const {
            summary, chartData
        } = backTest({
            minPremarketVolume,
            maxPremarketVolume,
            openPrice,
            maxPercentageLossPerTrade,
            minOpenToPremarketHighPercentage,
            maxOpenToPremarketHighPercentage,
            initialEquity,
            amountToInvestPerTrade,
            year,
            maxPremarketSpikingPercentage,
            minPremarketSpikingPercentage
        });
        setChartData(chartData);
        setSummary(summary);
    }

    const reset = () => {
        setYear("2020");
        setInitialEquity(35000);
        setAmountToInvestPerTrade(5000);
        setMinPremarketVolume(0);
        setMaxPremarketVolume(0);
        setOpenPrice(0);
        setMaxPercentageLossPerTrade(60);
        setMinOpenToPremarketHighPercentage(0);
        setMaxOpenToPremarketHighPercentage(0);
        setMaxPremarketSpikingPercentage(0);
        setMinPremarketSpikingPercentage(0);
        setChartData([]);
    }

    const classes = styles();

    return  <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Back Testing</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <div className={classes.backTestingContainer}>
        <div className={classes.parametersContainer}>
            <div className={classes.parameterField}>
                <InputLabel id="demo-simple-select-label">Year</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="2020">2020</MenuItem>
                    <MenuItem value="2019">2019</MenuItem>
                    <MenuItem value="2018">2018</MenuItem>
                    <MenuItem value="2017">2017</MenuItem>
                    <MenuItem value="2016">2016</MenuItem>
                    <MenuItem value="2015">2015</MenuItem>
                    <MenuItem value="2014">2014</MenuItem>
                    <MenuItem value="2013">2013</MenuItem>
                    <MenuItem value="2012">2012</MenuItem>
                </Select>
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Initial Equity" onChange={(e) =>setInitialEquity(parseFloat(e.target.value))} value={initialEquity} />
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Amount per trade" onChange={(e) =>setAmountToInvestPerTrade(parseFloat(e.target.value))} value={amountToInvestPerTrade}/>
            </div>

            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Min. Premarket Volume" onChange={(e) =>setMinPremarketVolume(parseFloat(e.target.value))} value={minPremarketVolume} />
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Max. Premarket Volume" onChange={(e) =>setMaxPremarketVolume(parseFloat(e.target.value))} value={maxPremarketVolume}/>
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Open Price" onChange={(e) =>setOpenPrice(parseFloat(e.target.value))} value={openPrice} />  
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Max % Loss per trade" onChange={(e) =>setMaxPercentageLossPerTrade(parseFloat(e.target.value))} value={maxPercentageLossPerTrade} />      
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Min. open to Premarket high percentage" onChange={(e) =>setMinOpenToPremarketHighPercentage(parseFloat(e.target.value))} value={minOpenToPremarketHighPercentage}/>
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Max. open to Premarket high percentage" onChange={(e) =>setMaxOpenToPremarketHighPercentage(parseFloat(e.target.value))} value={maxOpenToPremarketHighPercentage}/>
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Min. Premarket spiking percentage" onChange={(e) =>setMinPremarketSpikingPercentage(parseFloat(e.target.value))} value={minPremarketSpikingPercentage}/>
            </div>
            <div className={classes.parameterField}>
                <TextField id="standard-basic" label="Max. Premarket spiking percentage" onChange={(e) =>setMaxPremarketSpikingPercentage(parseFloat(e.target.value))} value={maxPremarketSpikingPercentage}/>
            </div>
        </div>
        <div className={classes.buttonsContainer}>
            <Button variant="contained" color="primary" onClick={reset}>
                Reset
            </Button>
            <Button variant="contained" color="primary" onClick={runBackTest}>
                Run
            </Button>
        </div>
        <div className={classes.summaryContainer}>
            <div className={classes.labelsContainer}>
                <div className={classes.label}>Final Equity: </div>
                <div className={classes.label}>Green Trades: </div>
                <div className={classes.label}>Red Trades: </div>
                <div className={classes.label}>Stop losses: </div>
                <div className={classes.label}>Total Trades: </div>
            </div>
            <div className={classes.valuesContainer}>
                <div className={classes.value}>{parseInt(summary.equity)}</div>
                <div className={classes.value}>{summary.noOfProfitableTrades}</div>
                <div className={classes.value}>{summary.noOfLoosers}</div>
                <div className={classes.value}>{summary.noOfStopLosses}</div>
                <div className={classes.value}>{summary.totalNumberOfTradesTaken}</div>
            </div>
        </div>
        <div className={classes.equityGraph}>
        <LineChart
            height={1000}
            width={1500}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tradeNumber" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="#8884d8"
            />
          </LineChart>
        </div>
    </div>
            </AccordionDetails>
          </Accordion>
    
};


export default BackTesting;