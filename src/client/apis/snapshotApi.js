import axios from 'axios';

const SNAPSHOT = 'http://localhost:3000/v1/snapshot/';
const GAINERS = SNAPSHOT + 'gainers';

export const getTopGainers = () => {
    return axios.get(GAINERS).then(res => res.data);
}