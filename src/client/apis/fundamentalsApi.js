import axios from 'axios';

const FUNDAMENTALS = 'http://localhost:3000/v1/fundamentals/'

export const getFundamentalsFinviz = (ticker) => {
    return axios.get(FUNDAMENTALS + ticker).then(res => res.data);
}