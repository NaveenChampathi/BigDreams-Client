export const processIntradayData = (intradayData) => {
  let preMarketVolume = 0;
  let preMarketHigh = 0;
  let preMarketLowAfterHigh = 1000;
  let preMarketHighIndex = 0;
  let preMarketHighBar = {};
  let preMarketLowBar = {};
  let marketVolume = 0;
  let marketHigh = 0;
  let marketLowAfterHigh = 1000;
  let marketHighIndex = 0;
  let marketHighBar = {};
  let marketLowBar = {};
  let marketOpenIndex = 0;

  // Premarket analysis
  for (let i = 0; i < intradayData.length; i++) {
    const nytTime = new Date(intradayData[i].Timestamp).toLocaleString(
      "en-US",
      {
        timeZone: "America/New_York",
      }
    );

    const hours = new Date(nytTime).getHours();
    const minutes = new Date(nytTime).getMinutes();

    // Premarket High
    if (intradayData[i].HighPrice > preMarketHigh) {
      preMarketHigh = intradayData[i].HighPrice;
      preMarketHighIndex = i;
      preMarketHighBar = intradayData[i];
    }

    if (hours === 9 && minutes > 30) {
      marketOpenIndex = i;
      break;
    } else {
      preMarketVolume += intradayData[i].Volume;
    }
  }

  // Premarket Low
  for (let i = preMarketHighIndex; i < marketOpenIndex; i++) {
    if (intradayData[i].LowPrice < preMarketLowAfterHigh) {
      preMarketLowAfterHigh = intradayData[i].LowPrice;
      preMarketLowBar = intradayData[i];
    }
  }

  // Market open
  for (let i = marketOpenIndex; i < intradayData.length; i++) {
    marketVolume += intradayData[i].Volume;
    // Market High
    if (intradayData[i].HighPrice > marketHigh) {
      marketHigh = intradayData[i].HighPrice;
      marketHighIndex = i;
      marketHighBar = intradayData[i];
    }
  }

  // Market Low
  for (let i = marketHighIndex; i < intradayData.length; i++) {
    if (intradayData[i].LowPrice < marketLowAfterHigh) {
      marketLowAfterHigh = intradayData[i].LowPrice;
      marketLowBar = intradayData[i];
    }
  }

  let marketOpen1MinVolume = intradayData[marketOpenIndex].Volume;
  let marketOpen2MinVolume =
    intradayData[marketOpenIndex].Volume +
    intradayData[marketOpenIndex + 1].Volume;
  let marketOpen5MinVolume = [0, 1, 2, 3, 4].reduce(
    (pre, curr) => pre + intradayData[marketOpenIndex + curr].Volume,
    0
  );

  return {
    preMarketVolume,
    preMarketHigh,
    preMarketLowAfterHigh,
    preMarketHighIndex,
    preMarketHighBar,
    preMarketLowBar,
    marketVolume,
    marketHigh,
    marketLowAfterHigh,
    marketHighIndex,
    marketHighBar,
    marketLowBar,
    marketOpenIndex,
    marketOpen1MinVolume,
    marketOpen2MinVolume,
    marketOpen5MinVolume,
  };
};
