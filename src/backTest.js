const aggregatedJSON = require('../../aggregated.json');

let initialBalance = 35000;

let myArgs = process.argv.slice(2);

const year = myArgs[0] || "2020";
let maxPnl = 0;
let minPnl = 0;
let maxPnlEntry = {};
let minPnlEntry = {};
let data = aggregatedJSON[year];
let noOfProfitableTrades = 0;
let noOfLoosers = 0;
let noOfStopLosses = 0;
let totalNumberOfTradesTaken = 0;

const conditionsMet = (entry) => {
    return parseInt(entry.preMarketVolume) > 1000000
    && parseInt(entry.gap) > 50;
}

data.forEach(entry => {

    if(initialBalance < 25000) {
        console.log('Cannot trade no More');
        return;
    }

    if (conditionsMet(entry)) {
        totalNumberOfTradesTaken++;
        let amountToBeInvested = 5000;

        let noOfShares = Math.floor(amountToBeInvested / entry.open);

        let entryPrice = noOfShares * entry.open;
        let exitPrice = noOfShares * entry.nextClose;

        let pnl = entryPrice - exitPrice;
        //console.log("PNL: ", pnl);

        if (pnl > maxPnl) {
            maxPnl = pnl;
            maxPnlEntry = entry;
        }
        if (pnl < minPnl) {
            minPnl = pnl;
            minPnlEntry = entry;
        }

        if(entry.high > 1.7 * entry.open) {
            noOfStopLosses++;
            pnl = -3500;
            console.log('High: ' + entry.high + ', Open: ' + entry.open);
        }

        pnl > 0 ? noOfProfitableTrades++ : noOfLoosers++; 
        
        initialBalance += pnl;
        // console.log("Intraday PnL: ", pnl);
        // console.log("Intraday Balance: ", initialBalance);
    }

});

console.log('---------------------------------------------------------------------');
console.log("Final Amount: ", initialBalance);
console.log("Max Pnl: ", maxPnlEntry);
console.log("Min Pnl: ", minPnlEntry);
console.log('Number of Profitable Trades: ', noOfProfitableTrades);
console.log('Number of Loosing Trades: ', noOfLoosers);
console.log('Number of Times Stop Losses Triggered: ', noOfStopLosses);