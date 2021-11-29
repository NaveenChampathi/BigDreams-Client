import axios from "axios";

const HISTORY = "http://localhost:3000/v1/history";
const GET_HIGH_VOLUME_DAILY_BARS = HISTORY + "/get-bars/";
const GET_DAILY_BARS = HISTORY + "/get-daily-bars/";
const GET_INTRADAY_BARS = HISTORY + "/get-bars/intraday/";
const GET_INTRADAY_TRADES = HISTORY + "/get-trades/intraday/";
const GET_ALL_GAPPED_TICKERS = HISTORY + "/get-all-gapped-tickers";

export const getHighVolumeDailyBars = (ticker) => {
  return axios.get(GET_HIGH_VOLUME_DAILY_BARS + ticker).then((res) => res.data);
};

export const getIntradayBars = (date, ticker, timeframe = 1) => {
  return axios
    .get(GET_INTRADAY_BARS + date + "/" + ticker + "/" + timeframe)
    .then((res) => res.data);
};

export const getDailyBars = (date, ticker) => {
  return axios
    .get(GET_DAILY_BARS + date + "/" + ticker)
    .then((res) => res.data);
};

export const getIntradayTrades = (date, ticker) => {
  return axios
    .get(GET_INTRADAY_TRADES + date + "/" + ticker)
    .then((res) => res.data);
};
export const getAllGappedTickers = ({ gapUp, volume }) => {
  return axios
    .get(GET_ALL_GAPPED_TICKERS + `?gapUp=${gapUp}&volume=${volume}`)
    .then((res) => res.data);
};
