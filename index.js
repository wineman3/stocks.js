require("dotenv").config();
const Axios = require("axios");

const rootURL = "https://www.alphavantage.co/query";
const symbol = process.argv[2];
Axios.get(
  `${rootURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.API_KEY}`
)
  .then((response) => {
    let timeSeriesArr = response.data["Time Series (Daily)"];

    let today = new Date();

    while (!timeSeriesArr[today.toISOString().slice(0, 10)])
      today.setDate(today.getDate() - 1);

    let res = timeSeriesArr[today.toISOString().slice(0, 10)];
    console.log(res);
  })
  .catch((err) => {
    console.log(`Could not get stonk ${symbol}.`);
  });
