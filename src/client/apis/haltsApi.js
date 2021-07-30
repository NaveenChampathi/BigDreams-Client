import axios from 'axios';

const SNAPSHOT = 'http://localhost:3000/v1/halts/';
const NASDAQ = SNAPSHOT + 'nasdaq';

export const getNasdaqHalts = () => {
    return axios.get(NASDAQ).then(res => res.data);
}