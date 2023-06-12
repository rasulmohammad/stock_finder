//API initialization + DOM elements + other global variable declaration
const apiKey = "VOD7R1UWRFPML3LZ";
const apiURL = "https://www.alphavantage.co/query";
let search_form = document.getElementById("search_bar");
let destroy_canvas = document.getElementById('destroyCanvas');
let year = document.getElementById("year");
let month = document.getElementById("month");
let day = document.getElementById("day");
let answer_div = document.getElementById("answer")
let stockObject;
let slope;
let average = 0
let startingStockValue;
let labels;
let prices;
let myChart;
let container;
let lineColor;


// Whenever we click destroy canvas, it will delete the line chart
destroy_canvas.addEventListener("click", function (event) {
    myChart = document.getElementById("myChart")
    container = document.getElementById("lineChart")
    container.removeChild(myChart)
    answer_div.innerHTML = "<h2>What's the verdict?</h2>"
})


// On submission of the form, we'll run this
search_form.addEventListener("submit", async function (event) {

  // Refreshing page
  event.preventDefault();

  // Clearing the values
  labels = []
  prices = []

  
  // Creating a canvas 
  container = document.getElementById("lineChart")
  myChart = document.createElement("canvas")
  myChart.id = "myChart"
  container.appendChild(myChart)
 

  //We have the users input
  let symbol = document.getElementById("search_input").value;
  let year_number = year.value;
  let month_number = month.value;
  let day_number = day.value.padStart(2, '0')
  let future_day_number = parseInt(day_number) + 1
  labels.push(`${year_number}-${month_number}-${day_number}`)
  labels.push(`${year_number}-${month_number}-${future_day_number}`)


  // We use the user's input to determine an average through calling async function (stockmath)
  average = await stockMathInfo(year_number, month_number, day_number, symbol)
  
 

  // Second price to compare on the graph
  let secondPrice = parseInt(prices[0]) + average
  prices.push(secondPrice)

  //Depending on the sign of the resulting average, this is what we do ->> (also changing line color if negative slope)
  if(average<0){
    answer_div.innerHTML = "<h2>I advise NOT to buy</h2>"
    console.log("I advise not to buy")
    lineColor = "red"
  }
  else if(average>0){
    answer_div.innerHTML = "<h2>I advise TO buy</h2>"
    console.log("I advise TO buy")
    lineColor = "green"
  }else{
    console.log("Flip a coin")
  }


    // console.log(labels)
    // console.log(prices)


    // This is the actual chart.js portion creating the chart
    const ctx = document.getElementById("myChart").getContext('2d')
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Prices',
                data: prices,
                borderColor: lineColor,
                backgroundColor: 'transparent',
            }]
        },
    })

});



//Fetch call of the typed in ticker symbol to get time series daily info
const fetchStockInfo = async (ticker_symbol) => {

  console.log(ticker_symbol);

  // More initialization
  const functionParam = "TIME_SERIES_DAILY_ADJUSTED";
  const interval = "30 min";
  const requestUrl = `${apiURL}?function=${functionParam}&symbol=${ticker_symbol}&interval=${interval}&apikey=${apiKey}`;

    // async function so that we can let object "data" turn into global variable object "stockObject" for later use (more initialization)
  try {
    const response = await fetch(requestUrl);
    const data = await response.json();
    stockObject = data;
    console.log(stockObject);
  } catch (error) {
    console.log("This is your error" + error);
  }
};



//Main function for the math
const stockMathInfo = async (year_number, month_number, day_number, symbol) => {

  //Calling the information from the fetch call
  await fetchStockInfo(symbol)
    .then(() => {
      console.log(stockObject);

      // Date tests
      console.log(`This is year number: ${year_number}`);
      console.log(`This is month: ${month_number}`);
      console.log(`This is day: ${day_number}`);

      // Object of specified stock / open price only 
    //   console.log(stockObject["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"]);

      if(!(`${year_number}-${month_number}-${day_number}` in stockObject["Time Series (Daily)"])){
        alert("You seleted a weekend date, try another one please")
      }


        // For loop so that we can do the math of previous days
      for(let i = 0; i<10; i++){
    
        // So the numbers don't get mixed up
        let fake_i = ((parseInt(day_number) - i).toString()).padStart(2,"0")
        let currentDate = `${year_number}-${month_number}-${fake_i}`


        // Get our starting/comparing point value (day of)
        if(i == 0){
            startingStockValue = stockObject["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"]
            prices.push(parseInt(startingStockValue))
            continue;
        }

        // Every other day before 
        else {
            // If it's a weekend, skip this iteration
            if(!(currentDate in stockObject["Time Series (Daily)"])){
                console.log(currentDate)
                continue;
                
            }
            // If it's not a weekend, do the math
            else{
                let temp = startingStockValue - stockObject["Time Series (Daily)"][`${year_number}-${month_number}-${fake_i}`]['1. open']
                average = average + temp
                console.log("This is our temp value:" + temp)
                console.log('This is our average value:' + average)
            }
        }
      }
    });

    return average;
};

 
