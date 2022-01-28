import axios from "axios";
import { BE_BASE } from "../constants";

const GET_WATCHLIST_ALL = BE_BASE + "/v1/watchlist/all";
const WATCHLIST = BE_BASE + "/v1/watchlist/";
const ADD_TO_WATCHLIST = WATCHLIST + "add";
const DELETE_FROM_WATCHLIST = WATCHLIST + "delete";

export const getAllWatchlists = () => {
  return axios.get(GET_WATCHLIST_ALL).then((res) => res.data);
};

export const getSpecificWatchlist = (_id) => {
  return axios.get(WATCHLIST + _id).then((res) => res.data);
};

export const addToWatchlist = (_id, symbol) => {
  return axios
    .post(ADD_TO_WATCHLIST, {
      id: _id,
      symbol,
    })
    .then((res) => res.data);
};

export const deleteFromWatchlist = (_id, symbol) => {
  return axios
    .post(DELETE_FROM_WATCHLIST, {
      id: _id,
      symbol,
    })
    .then((res) => res.data);
};
