const tKeys = [
    {
      name: "Ticker",
      key: "ticker",
      hidden: false
    },
    {
      name: "Date",
      key: "date",
      hidden: false,
      format: 'date'
    },
    {
      name: "P. Close",
      key: "previousClose",
      hidden: false
    },
    {
      name: "PM. High",
      hidden: false,
      key: "preMarketHigh",
    },
    {
      name: "PM. Low",
      hidden: false,
      key: "preMarketLow",
    },
    {
      name: "Float",
      hidden: false,
      key: "float",
    },
    {
      name: "PM. Volume",
      hidden: false,
      key: "preMarketVolume",
      format: ",",
    },
    {
      name: "Volume",
      hidden: false,
      key: "volume",
      format: ",",
    },
    {
      name: "Open",
      hidden: false,
      key: "open",
    },
    {
      name: "High",
      hidden: false,
      key: "high",
    },
    {
      name: "Low",
      hidden: false,
      key: "low",
    },
    {
      name: "Close",
      hidden: false,
      key: "close",
    },
    {
      name: "Market Cap",
      hidden: false,
      key: "marketCap",
      format: "$",
    },
    {
      name: "O. Shares",
      hidden: false,
      key: "outstandingShares",
      format: ",",
    },
    {
      name: "Gap",
      hidden: false,
      key: "gap",
      format: "%",
    },
    {
      name: "PM Lost%",
      hidden: true,
      key: "derived-pmLost",
      format: "%",
      fn: (item) => {
        return (
          ((item.preMarketHigh - item.preMarketLow) / item.previousClose) * 100
        );
      },
    },
    {
        name: "Pm.High-Open",
        hidden: false,
        key: "derived-pmToOpen",
        format: "%",
        fn: (item) => {
          return (
            ((item.preMarketHigh - item.open) / item.preMarketHigh) * 100
          );
        },
      },
    {
      name: "MO Push %",
      hidden: false,
      key: "derived-moPush",
      format: "%",
      fn: (item) => {
        return ((item.high - item.open) / item.open) * 100;
      },
    },
    {
      name: "I.H-Pm.H",
      hidden: false,
      key: "derived-intraHighToPMHigh",
      format: "%",
      fn: (item) => {
        return ((item.high - item.preMarketHigh) / item.high) * 100;
      },
    },
  
    {
      name: "N. Open",
      hidden: false,
      key: "nextOpen",
    },
    {
      name: "N. Close",
      hidden: false,
      key: "nextClose",
    },
  ];

  export default tKeys;