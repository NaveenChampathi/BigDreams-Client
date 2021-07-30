const fs = require("fs");
const path = require("path");

const dataPath = "aggregated.json";

const keys = [
  "ticker",
  "date",
  "open",
  "high",
  "low",
  "close",
  "previousClose",
  "volume",
  "nextOpen",
  "nextClose",
  "preMarketHigh",
  "preMarketLow",
  "preMarketVolume",
  "marketCap",
  "outstandingShares",
  "gap",
];

function excelDateToJSDate(date) {
  return new Date(Math.round((date - 25569) * 86400 * 1000));
}

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
const inputFile = process.argv.slice(2)[0];

fs.readFile(inputFile + ".txt", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }
  const entries = data.split("@");

  const sEntries = entries.map((entry) => {
    const oEntry = {};
    entry.split("#").forEach((item, index) => {
      if (index === 1) {
        oEntry[keys[index]] = excelDateToJSDate(item);
      } else {
        oEntry[keys[index]] = item;
      }
    });

    return oEntry;
  });

  fs.readFile("aggregated.json", "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }

    data = JSON.parse(data);
    console.log("data: ", data);
    data[inputFile] = sEntries;
    // console.log(sEntries);
    writeFile(JSON.stringify(data), () => {});
  });
});
