const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
const path = require("path");
const tickers = require('./client/aggregated.json')["2020"];
const tickersWithFloatJSON = require('./tickersWithFloat.json');
const onlyTickers = tickers.map(ticker => ticker.ticker);
const dataPath = './src/tickersWithFloat.json';

const tickersWithFloat = {
    ...tickersWithFloatJSON
};

const writeFile = (
    fileData,
    callback,
    filePath = dataPath,
    encoding = "utf8"
) => {
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }

        callback();
    });
};

Promise.all(onlyTickers.map(ticker => {
    return axios.get('https://finviz.com/quote.ashx?t=' + ticker.toLowerCase())
        .then((response) => {
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                const tds = $('.snapshot-table2').find('td');
                const floatIndex = tds.map(function (i, el) {
                    return $(this).text();
                }).get().indexOf('Shs Float') + 1;

                tickersWithFloat[ticker] = $(tds[floatIndex]).text();
            }

            return null;
        }, (error) => console.log('Error: ', ticker));
})).then(() => {
    writeFile(JSON.stringify(tickersWithFloat), () => {});
    // console.log(tickersWithFloat);
});