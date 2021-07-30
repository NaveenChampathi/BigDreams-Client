import React, { Component, useState, useEffect } from "react";
import { TextField, IconButton, ButtonGroup, Button } from "@material-ui/core";
import { Add, Edit } from "@material-ui/icons";
import "./styles.scss";

const tickers = [
  {
    ticker: "VXRT",
  },
];

const TickerInstance = ({ data }) => {
  const [ticker, setTicker] = useState("tikr");
  const [showEditTicker, setShowEditTicker] = useState(false);
  const [buyEntries, setBuyEntries] = useState([]);
  const [profitType, setProfitType] = useState(5);
  const [suggestedSellPrice, setSuggestedSellPrice] = useState({
    g: 0,
    l: 0,
    expectedTotal: { g: 0, l: 0 },
  });
  const [manualPAndL, setManualPAndL] = useState(100);

  const updateQuantity = (val, index) => {
    const existingEntries = [...buyEntries];
    existingEntries[index].quantity = val ? parseFloat(val) : 0;
    existingEntries[index].total = (
      existingEntries[index].quantity * existingEntries[index].price
    ).toFixed(2);
    setBuyEntries(existingEntries);
  };

  const updatePrice = (val, index) => {
    const existingEntries = [...buyEntries];
    existingEntries[index].price = val ? val : 0;
    existingEntries[index].total = (
      existingEntries[index].quantity * existingEntries[index].price
    ).toFixed(2);
    setBuyEntries(existingEntries);
  };

  const updateTotal = (val, index) => {
    const existingEntries = [...buyEntries];
    existingEntries[index].total = val ? val : 0;
    existingEntries[index].quantity =
      existingEntries[index].total / existingEntries[index].price;
    setBuyEntries(existingEntries);
  };

  const addBuyEntry = () => {
    const existingEntries = [...buyEntries];
    existingEntries.push({
      quantity: 0,
      price: 0,
      total: 0,
    });
    setBuyEntries(existingEntries);
  };

  const updateProfitPercetange = (type) => {
    setProfitType(type);
  };

  const updateManualPAndL = (val) => {
    setManualPAndL(val ? parseFloat(val) : 0);
  };

  useEffect(() => {
    let totalQuantity = 0,
      totalPrice = 0,
      expectedTotal = 0;
    buyEntries.forEach((entry) => {
      totalQuantity += entry.quantity;
      totalPrice += entry.quantity * entry.price;
    });

    switch (profitType) {
      case 5:
        expectedTotal = { g: 1.05 * totalPrice, l: 0.95 * totalPrice };
        break;
      case 10:
        expectedTotal = { g: 1.1 * totalPrice, l: 0.9 * totalPrice };
        break;
      case 15:
        expectedTotal = { g: 1.15 * totalPrice, l: 0.85 * totalPrice };
        break;
      case 20:
        expectedTotal = { g: 1.2 * totalPrice, l: 0.8 * totalPrice };
        break;
      case "manual":
        expectedTotal = {
          g: totalPrice + manualPAndL,
          l: totalPrice - manualPAndL,
        };
        break;
      default:
        expectedTotal = { g: totalPrice, l: totalPrice };
    }

    setSuggestedSellPrice({
      g: totalQuantity ? expectedTotal.g / totalQuantity : 0,
      l: totalQuantity ? expectedTotal.l / totalQuantity : 0,
      expectedTotal,
    });
  }, [profitType, buyEntries, manualPAndL]);

  return (
    <div className="instance-container">
      <div>
        {showEditTicker ? (
          <TextField
            id="outlined-basic"
            label="Ticker"
            variant="outlined"
            value={ticker}
            onBlur={() => {
              setShowEditTicker(false);
              !ticker ? setTicker("tikr") : "";
            }}
            onChange={(e) => setTicker(e.target.value)}
          />
        ) : (
          <span onClick={() => setShowEditTicker(true)}>
            {ticker.toUpperCase()}
          </span>
        )}
      </div>
      <div className="bought-header">
        <div>Bought</div>
        <div>
          <IconButton onClick={addBuyEntry}>
            <Add />
          </IconButton>
        </div>
      </div>
      {buyEntries.map((entry, i) => (
        <div className="buy-ledger">
          <div className="quantity">
            <TextField
              id="standard-basic"
              label="Quantity"
              classes="mui-form-fields"
              value={entry.quantity}
              onChange={(e) => updateQuantity(e.target.value, i)}
            />
          </div>
          {/* <div className="multiply">X</div> */}
          <div className="price">
            <TextField
              id="standard-basic"
              label="Price"
              classes="mui-form-fields"
              value={entry.price}
              onChange={(e) => updatePrice(e.target.value, i)}
            />
          </div>
          <div className="price">
            <TextField
              id="standard-basic"
              label="Total"
              classes="mui-form-fields"
              value={entry.total}
              onChange={(e) => updateTotal(e.target.value, i)}
            />
          </div>
          {/* <div className="total">{entry.total.toFixed(2)}</div> */}
        </div>
      ))}

      <div className="profit-target">
        <div className="suggested-sell-price-profit">
          <span>{suggestedSellPrice.g.toFixed(4)}</span>
          <span className="expected-total">
            {suggestedSellPrice.expectedTotal.g.toFixed(4)}
          </span>
        </div>
        <div className="percentage-profits">
          <ButtonGroup
            color="primary"
            aria-label="outlined primary button group"
          >
            <Button
              variant={profitType === 5 ? "contained" : "outlined"}
              onClick={() => updateProfitPercetange(5)}
            >
              5%
            </Button>
            <Button
              variant={profitType === 10 ? "contained" : "outlined"}
              onClick={() => updateProfitPercetange(10)}
            >
              10%
            </Button>
            <Button
              variant={profitType === 15 ? "contained" : "outlined"}
              onClick={() => updateProfitPercetange(15)}
            >
              15%
            </Button>
            <Button
              variant={profitType === 20 ? "contained" : "outlined"}
              onClick={() => updateProfitPercetange(20)}
            >
              20%
            </Button>
            <Button
              variant={profitType === "manual" ? "contained" : "outlined"}
              onClick={() => updateProfitPercetange("manual")}
            >
              <Edit />
            </Button>
          </ButtonGroup>
        </div>

        <div className="suggested-sell-price-loss">
          <span>{suggestedSellPrice.l.toFixed(4)}</span>
          <span className="expected-total">
            {suggestedSellPrice.expectedTotal.l.toFixed(4)}
          </span>
        </div>
        <div className="manual-profit">
          <TextField
            id="standard-basic"
            label="Min P / Max L"
            classes="mui-form-fields"
            value={manualPAndL}
            onChange={(e) => updateManualPAndL(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const PriceCalculatorPage = () => {
  const [tickers, setTickers] = useState([]);

  const addNewTicker = () => {
    const existingTickers = [...tickers];
    existingTickers.push({});
    setTickers(existingTickers);
  };

  return (
    <div>
      <div className="instances-container">
        {tickers.map((ticker) => {
          return <TickerInstance data={ticker} />;
        })}
        <div className="new-ticker-entry" onClick={() => addNewTicker()}>
          <Add />
        </div>
      </div>
    </div>
  );
};

export default PriceCalculatorPage;
