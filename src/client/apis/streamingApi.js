import axios from "axios";
import { BE_BASE } from "../constants";

const STREAMING = BE_BASE + "/v1/data-stream/";
const CONNECT_TO_STRERAM = STREAMING + "connect/";
const DISCONNECT_STRERAM = STREAMING + "disconnect";
const CONNECTION_STATUS = STREAMING + "status";

export const connectToStream = (_id) => {
  return axios.get(CONNECT_TO_STRERAM + _id).then((res) => res.data);
};

export const disconnectFromStream = () => {
  return axios.get(DISCONNECT_STRERAM).then((res) => res.data);
};

export const getConnectionStatus = () => {
  return axios.get(CONNECTION_STATUS).then((res) => res.data);
};
