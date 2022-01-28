import axios from "axios";
import { BE_BASE } from "../constants";

const SNAPSHOT = BE_BASE + "/v1/snapshot/";
const GAINERS = SNAPSHOT + "gainers";

export const getTopGainers = () => {
  return axios.get(GAINERS).then((res) => res.data);
};
