const fs = require('fs');

const aggregatedJSON = require('./client/aggregated.json');
const tickersWithFloat = require('./tickersWithFloat.json');

const dataPath = './src/tickersWithFloatUpdated.json';

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

Object.keys(aggregatedJSON).forEach(year => {
    aggregatedJSON[year].forEach(ticker => {
        ticker.float = tickersWithFloat[ticker.ticker] && tickersWithFloat[ticker.ticker] !== "-" ? tickersWithFloat[ticker.ticker] : '0.00';
    });
})

writeFile(JSON.stringify(aggregatedJSON), () => {});