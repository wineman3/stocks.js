const Axios = require("axios");
const moment = require("moment");
let tickers = require("./stocks.json");
const rootURL = "https://www.alphavantage.co/query";
(async () => {
  let counter = 0;
  tickers = tickers.filter((ticker, index) => tickers.indexOf(ticker) == index); //remove duplicates
  if (process.argv[2]) {
    tickers = [process.argv[2]]; // Only process the specified ticker
  }
  try {
    for (ticker of tickers) {
      console.log(`Getting decision for ${ticker}...`);
      const response = await get200DayMA(ticker);
      if (response) {
        await getStockDecision(ticker, response.movingAvg, response.date);
      } else {
        console.log("please remove: ", ticker);
      }
      console.log("***********************");
      if (!(tickers.indexOf(ticker) == tickers.length - 1)) await delay(30000);
      counter++;
    }
  } catch {
    console.log("Got to index: ", counter);
    console.log("Could not get stock decision at this time.");
  }
})();

async function getStockDecision(symbol, movingAverage, movingAverageDate) {
  try {
    const response = await Axios.get(
      `${rootURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.API_KEY}`
    );
    let timeSeriesArr = response.data["Time Series (Daily)"];

    let today = new Date();

    while (!timeSeriesArr[today.toISOString().slice(0, 10)])
      today.setDate(today.getDate() - 1);

    let res = timeSeriesArr[today.toISOString().slice(0, 10)];
    const open = res["1. open"];
    const close = res["4. close"];
    if (open < movingAverage && close > movingAverage) {
      console.log(`Yes, you should buy $${symbol} today!`);
      console.log(`Open : ${open}`);
      console.log(`Close: ${close}`);
      console.log(
        `Moving Average as of ${movingAverageDate}: ${movingAverage}`
      );
    } else {
      console.log(`No, you should not buy $${symbol} today.`);
    }
  } catch (err) {
    console.log(`Could not get stonk ${symbol}.`);
  }
}
async function get200DayMA(symbol) {
  try {
    let response = await Axios.get(
      `${rootURL}?function=SMA&symbol=${symbol}&interval=daily&time_period=200&series_type=close&apikey=${process.env.API_KEY}`
    );
    response = response.data["Technical Analysis: SMA"];
    let mostRecentDateData = moment().format("YYYY-MM-DD");
    let daysToSubtract = 1;
    if (Object.keys(response).length === 0) return;
    while (!response[mostRecentDateData]) {
      mostRecentDateData = moment()
        .subtract(daysToSubtract, "days")
        .format("YYYY-MM-DD");
      daysToSubtract++;
    }
    mostRecentMovingAverage = response[mostRecentDateData]["SMA"];
    if (!mostRecentMovingAverage) throw new Error();
    return {
      date: mostRecentDateData,
      movingAvg: mostRecentMovingAverage,
    };
  } catch (err) {
    console.log(`Could not get stonk's moving average: ${symbol}.`);
    console.log(err);
  }
}

function delay(delayInms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}
