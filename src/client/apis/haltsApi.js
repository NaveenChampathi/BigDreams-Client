import axios from "axios";
import { BE_BASE } from "../constants";

const SNAPSHOT = BE_BASE + "/v1/halts/";
const NASDAQ = SNAPSHOT + "nasdaq";
const HALTED_TICKERS = SNAPSHOT + "get-halted-tickers";
const MARK_TICKER = SNAPSHOT + "mark-ticker";
const ALL_HALTED_CRAP = SNAPSHOT + "get-all-halted-crap";

export const getNasdaqHalts = () => {
  return axios.get(NASDAQ).then((res) => res.data);
};

export const getNasdaqHaltedTickers = (page = 1) => {
  return axios
    .get(`${HALTED_TICKERS}?page=${page}&limit=200`)
    .then((res) => res.data);
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

export const getAllHaltedCrap = () => {
  return axios.get(`${ALL_HALTED_CRAP}`).then((res) => res.data);
};
