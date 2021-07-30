export const convertDate = (date) => {
    const dateObj = new Date(date);
    const months = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sept',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    };
  
    return `${months[dateObj.getUTCMonth()]} ${dateObj.getUTCDate()}, ${dateObj.getUTCFullYear()}`
  };

  export const summarize = (data) => {
    let green = 0,
      red = 0,
      avgRangeGreen = 0,
      avgGreenPushAfterMarketOpen = 0,
      avgRangeRed = 0,
      avgRedPushAfterMarketOpen = 0,
      maxGreenPushAfterMarketOpen = 0,
      minGreenPushAfterMarketOpen = 0,
      maxRedPushAfterMarketOpen = 0,
      minRedPushAfterMarketOpen = 0;
  
    data.forEach((item) => {
      let open = parseFloat(item.open);
      let close = parseFloat(item.close);
      let high = parseFloat(item.high);
      let low = parseFloat(item.low);
      if (close > open) {
        green++;
  
        avgRangeGreen += ((high - low) / high) * 100;
        const push = ((high - open) / open) * 100;
        if (push > maxGreenPushAfterMarketOpen) {
          maxGreenPushAfterMarketOpen = push;
        }
        if (push < minGreenPushAfterMarketOpen) {
          minGreenPushAfterMarketOpen = push;
        }
        avgGreenPushAfterMarketOpen += push;
      } else {
        red++;
        avgRangeRed += ((high - low) / low) * 100;
        const push = ((high - open) / open) * 100;
        if (push > maxGreenPushAfterMarketOpen) {
          maxRedPushAfterMarketOpen = push;
        }
        if (push < minGreenPushAfterMarketOpen) {
          minRedPushAfterMarketOpen = push;
        }
        avgRedPushAfterMarketOpen += push;
      }
    });
  
    avgRangeGreen = (avgRangeGreen / green).toFixed(2);
    avgGreenPushAfterMarketOpen = (avgGreenPushAfterMarketOpen / green).toFixed(
      2
    );
  
    avgRangeRed = (avgRangeRed / red).toFixed(2);
    avgRedPushAfterMarketOpen = (avgRedPushAfterMarketOpen / red).toFixed(2);
  
    return {
      green,
      red,
      summary: {
        green: {
          avgRange: avgRangeGreen,
          avgPushAfterMarketOpen: avgGreenPushAfterMarketOpen,
          maxPushAfterMarketOpen: maxGreenPushAfterMarketOpen.toFixed(2),
          minPushAfterMarketOpen: minGreenPushAfterMarketOpen.toFixed(2),
        },
        red: {
          avgRange: avgRangeRed,
          avgPushAfterMarketOpen: avgRedPushAfterMarketOpen,
          maxPushAfterMarketOpen: maxRedPushAfterMarketOpen.toFixed(2),
          minPushAfterMarketOpen: minRedPushAfterMarketOpen.toFixed(2),
        },
      },
    };
  };

  export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  export const formatData = (format, data) => {
    switch (format) {
      case "%":
        return Number(data).toFixed(2) + "%";
      case ",":
        return data ? numberWithCommas(data) : data;
      case "$":
        return data ? "$" + numberWithCommas(data) : data;
      case "date":
        return data ? convertDate(data) : data;
      default:
        return data;
    }
  };