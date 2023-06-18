import axios from "axios";
import { BE_BASE } from "../constants";

const HISTORY = BE_BASE + "/v1/history";
const GET_HIGH_VOLUME_DAILY_BARS = HISTORY + "/get-bars/";
const GET_DAILY_BARS = HISTORY + "/get-daily-bars/";
const GET_INTRADAY_BARS = HISTORY + "/get-bars/intraday/";
const GET_INTRADAY_TRADES = HISTORY + "/get-trades/intraday/";
const GET_ALL_GAPPED_TICKERS = HISTORY + "/get-all-gapped-tickers";
const GET_ALL_MARKET_OPEN_GAPPED_TICKERS =
  HISTORY + "//get-all-morning-open-gapped-tickers";
const GET_ALL_MULTI_DAY_GAPPED_TICKERS = HISTORY + "/get-all-multi-day-tickers";
const MARK_TICKER = HISTORY + "/mark-ticker";
const GET_NEWS = HISTORY + "/news/";
const GET_TRADES = HISTORY + "/get-trades/";

export const getHighVolumeDailyBars = (ticker) => {
  return axios.get(GET_HIGH_VOLUME_DAILY_BARS + ticker).then((res) => res.data);
};

export const getIntradayBars = (
  date,
  ticker,
  timeframe = 1,
  numberOfDaysBack = 0,
  numberOfDaysFuture = 1
) => {
  return axios
    .get(
      `${GET_INTRADAY_BARS}${numberOfDaysBack}/${numberOfDaysFuture}/${date}/${ticker}/${timeframe}`
    )
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

export const getTrades = (start, end, ticker) => {
  return axios
    .get(`${GET_TRADES}${start}/${end}/${ticker}`)
    .then((res) => res.data);
};

export const getAllGappedTickers = (page) => {
  return axios
    .get(`${GET_ALL_GAPPED_TICKERS}?page=${page}&limit=200`)
    .then((res) => res.data);
};
export const getAllMarketOpenGappedTickers = () => {
  return axios.get(GET_ALL_MARKET_OPEN_GAPPED_TICKERS).then((res) => res.data);
};
export const getAllMultidayTickers = () => {
  return axios.get(GET_ALL_MULTI_DAY_GAPPED_TICKERS).then((res) => res.data);
};

export const updateTickerType = (_id, type, value) => {
  return axios
    .post(MARK_TICKER, {
      id: _id,
      type,
      value,
    })
    .then((res) => res.data);
};

export const getNews = (date, ticker) => {
  return axios.get(GET_NEWS + date + "/" + ticker).then((res) => res.data);
};
