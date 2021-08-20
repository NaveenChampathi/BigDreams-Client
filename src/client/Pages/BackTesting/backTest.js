import aggregatedJSON from '../../tickersWithFloatUpdated.json';




export const backTest = ({ minPremarketVolume,
    maxPremarketVolume,
    openPrice,
    maxPercentageLossPerTrade,
    minOpenToPremarketHighPercentage,
    maxOpenToPremarketHighPercentage,
    amountToInvestPerTrade,
    initialEquity,
    year,
    maxPremarketSpikingPercentage,
    minPremarketSpikingPercentage
}) => {
    let initialBalance = initialEquity || 35000;
    let maxPnl = 0;
    let minPnl = 0;
    let maxPnlEntry = {};
    let minPnlEntry = {};
    let data = [];

    if(year === 'all') {
        Object.keys(aggregatedJSON).forEach(year => {
            data.push(...aggregatedJSON[year]);
        });
    } else {
        data = aggregatedJSON[year || "2020"];
    }

    let noOfProfitableTrades = 0;
    let noOfLoosers = 0;
    let noOfStopLosses = 0;
    let totalNumberOfTradesTaken = 0;
    let chartData = [];

    const conditionsMet = (entry) => {

        const cond1 = minPremarketVolume ? (minPremarketVolume !== 0 ? minPremarketVolume <= entry.preMarketVolume : true) : true; 
        const cond2 = maxPremarketVolume ? (maxPremarketVolume !== 0 ? maxPremarketVolume >= entry.preMarketVolume : true) : true; 
        const cond3 = openPrice ? (openPrice !== 0 ? openPrice <= entry.open : true) : true;
        const cond5 = minOpenToPremarketHighPercentage ? (minOpenToPremarketHighPercentage !== 0 ? (((entry.preMarketHigh - entry.open)/entry.preMarketHigh) * 100 >  minOpenToPremarketHighPercentage) : true) : true; 
        const cond6 = maxOpenToPremarketHighPercentage ? (maxOpenToPremarketHighPercentage !== 0 ? (((entry.preMarketHigh - entry.open)/entry.preMarketHigh) * 100 <  maxOpenToPremarketHighPercentage) : true) : true;
        const cond7 = minPremarketSpikingPercentage ? (minPremarketSpikingPercentage !== 0 ? (((entry.preMarketHigh - entry.previousClose)/entry.previousClose) * 100 >  minPremarketSpikingPercentage) : true) : true; 
        const cond8 = maxPremarketSpikingPercentage ? (maxPremarketSpikingPercentage !== 0 ? (((entry.preMarketHigh - entry.previousClose)/entry.previousClose) * 100 <  maxPremarketSpikingPercentage) : true) : true;

        return cond1 && cond2 && cond3 && cond5 && cond6 && cond7 && cond8 && (parseInt(entry.float) !== 0 ? parseInt(entry.float) > 0 : true);
    }

    data.forEach(entry => {

        // if(initialBalance < 25000) {
        //     console.log('Cannot trade no More');
        //     return;
        // }

        if (conditionsMet(entry)) {
            totalNumberOfTradesTaken++;
            let amountToBeInvested = amountToInvestPerTrade || 2000;

            let noOfShares = Math.floor(amountToBeInvested / entry.open);

            let entryPrice = noOfShares * entry.open;
            let exitPrice = noOfShares * entry.close;

            let pnl = entryPrice - exitPrice;

            if (pnl > maxPnl) {
                maxPnl = pnl;
                maxPnlEntry = entry;
            }
            if (pnl < minPnl) {
                minPnl = pnl;
                minPnlEntry = entry;
            }

            if(parseFloat(entry.high) > ( parseFloat(entry.open) + (maxPercentageLossPerTrade/100 *  parseFloat(entry.open) ))) {
                noOfStopLosses++;
                pnl = -(maxPercentageLossPerTrade/100 * amountToBeInvested);
            }

            pnl > 0 ? noOfProfitableTrades++ : noOfLoosers++; 
            
            initialBalance += pnl;
            chartData.push({
                tradeNumber: totalNumberOfTradesTaken,
                equity: parseInt(initialBalance),
                entry,
                pnl
            });
        }

    });

    const summary = {
        totalNumberOfTradesTaken,
        noOfProfitableTrades,
        noOfLoosers,
        noOfStopLosses,
        equity: initialBalance
    };

    return {chartData, summary};
}




// console.log('---------------------------------------------------------------------');
// console.log("Final Amount: ", initialBalance);
// console.log("Max Pnl: ", maxPnlEntry);
// console.log("Min Pnl: ", minPnlEntry);
// console.log('Number of Profitable Trades: ', noOfProfitableTrades);
// console.log('Number of Loosing Trades: ', noOfLoosers);
// console.log('Number of Times Stop Losses Triggered: ', noOfStopLosses);