import axios from 'axios';

const FUNDAMENTALS = 'http://localhost:3000/v1/fundamentals/';
const BAM_SEC_FILINGS = FUNDAMENTALS + '/bam-sec/';

export const getFundamentalsFinviz = (ticker) => {
    return axios.get(FUNDAMENTALS + ticker).then(res => res.data);
}

export const getBamsecFilings = (ticker) => {
    return axios.get(BAM_SEC_FILINGS + ticker).then(res => res.data);
}