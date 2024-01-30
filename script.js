//API initialization
// const apiKey = "VOD7R1UWRFPML3LZ";
// const apiURL = "https://www.alphavantage.co/query";

const apiKey = "8178d24b83024d84918798d76eb117d4";
const apiURL = "https://api.twelvedata.com";

// let stockData;

//DOM elements WITH a calendar
let search_form = document.getElementById("search_bar");
let destroy_canvas = document.getElementById('destroyCanvas');
let calendar_date = document.getElementById("calendar")
let answer_div = document.getElementById("answer")
let search_button = document.querySelector(".searchBtn")

//Stocks global variables
let average = 0
let startingStockValue;

//Chart stuff variables
let labelsArr;
let pricesArr;
let myChart;
let container;
let lineColor;
let canvasExists = false;


//Date
const date = new Date()
let days = ((date.getDate()).toString()).padStart(2,"0")
let isToday = false;
let futureDay;

//alert
let is_alert = false;



// On submission of the form, we'll run this
search_form.addEventListener("submit", async (event) => {

  // Refreshing page
  event.preventDefault();

  // Clearing the values
  labelsArr = []
  pricesArr = []

  //THIS IS FOR THE FORM BUTTONS WITH A CALENDAR
  let symbol = document.getElementById("search_input").value;
  let selected_date = calendar_date.value
  // console.log(`This is the selected date ${selected_date}`)

  // Execute the code logic ONLY if they put in dates
  if(symbol != "" && selected_date != "" ){

    // Date stuff
    let split_date = selected_date.split("-")
    let year_number = split_date[0]
    let month_number = split_date[1]
    let day_number = split_date[2]
    isToday = day_number == days;


    // Checking validity of the date inputted:
    // We use the user's input to determine an average through calling async function (stockmath)
    const apiData = await fetchStockInfo(symbol);
    console.log('da real stock data:', apiData);


    if(!checkValidDay(selected_date, apiData).bool){
      alert(checkValidDay(selected_date, apiData).phrase);
    }
    else{
      // If the canvas isn't on the screen (button will say "Search" and hover will be green prior to click)
      if(!(canvasExists)){
        search_button.addEventListener("mouseover", (event) => {search_button.style.backgroundColor = "red"})
        search_button.addEventListener("mouseout", (event) => {search_button.style.backgroundColor = "white"})
        

        initializeCanvas();
        startingStockValue = parseInt(findOpenValueForDate(selected_date, apiData));

        // Pushing the user's chosen date + stock price:
        labelsArr.push(selected_date) 
        pricesArr.push(startingStockValue) 


        console.log(labelsArr);
        console.log(pricesArr);

        // console.log("This is a test for our psuedo-first iteration: ", changingDay(selected_date, 4, true).date)

        // General logic: 
        // Take the selected date and use the 10 days back function.
        let count = 1; // Number of items in the prices array
        while(labelsArr.length != 10){


          // Get next date:
          let pushedDate = changingDay(selected_date, count, true).date;
          let pushedDateObj = new Date(pushedDate + 'T00:00:00');

          // If this date is a weekend, let's just increase count and move onto the next iteration
          if(pushedDateObj.getDay() == 6 || pushedDateObj.getDay() == 0){  
            count++;
            continue;
          }

          // We know it's a weekday:
          labelsArr.push(pushedDate);



          // console.log("This is the date we finding for on first iteration: ", pushedDate)
          let temp = mathForPreviousDays(pushedDate, apiData, labelsArr)
          // console.log(temp)
          pricesArr.push(temp)
          // console.log(apiData)
          



          count++;

        }

        console.log(labelsArr);
      

        // Updating chart line color + heading above it
        correspondingChartFeatures(pricesArr, labelsArr);
        drawChart();
      
        search_button.innerHTML = "Delete canvas"
        canvasExists = true; 
        search_button.style.backgroundColor = "red";
        
      } 
      else{   // if canvas exists (canvasExists = true)
  
          calendar_date.value = ""   // Resetting 
          search_button.addEventListener("mouseover", (event) => {search_button.style.backgroundColor = "green"})
          search_button.addEventListener("mouseout", (event) => {search_button.style.backgroundColor = "white"})
  
          myChart = document.getElementById("myChart")
          container = document.getElementById("lineChart")
          container.removeChild(myChart)
          answer_div.innerHTML = "<h2>What's the verdict?</h2>"
          search_button.innerHTML = "Search"
          canvasExists = false;
  
          
  
          
      }
    }

  } 
  else{  // Fields not filled in properly
      alert("Please fill in all fields")
  }
});


//Fetching information of the stoc
const fetchStockInfo = async (ticker_symbol) => {

  // More initialization
  const functionParam = "time_series"
  const interval = "1day"
  const requestUrl = '';


  //Fetch call. Waiting for the fetch to store in "response", then waiting for response before we save it in JSON form to "data"
  try {
    const mina = await fetch(`${apiURL}/${functionParam}?symbol=${ticker_symbol}&interval=${interval}&apikey=${apiKey}`).then(t => t.json());
    // console.log('mina', mina);
    return mina;
  } 
  catch (error) {
    console.log("This is your error" + error);
  }

  
}


//  Returns the final addition to whatever current stock price (the algorithm) using the previous 10 (valid) days.
function mathForPreviousDays(inputtedDate, dataObj, labelsArr){

  // At the moment of this function call, we have a new valid date, but no price for it yet. We know that the date before this, however, DOES have a price.
    // In order for the algorithm to work, we need to have a price of comparison first (hence the const), and then add this in order to create an existing price
  let previousDate = labelsArr[labelsArr.length - 2];
  const priceOfDate = parseInt(findOpenValueForDate(previousDate, dataObj));

  let avg = 0; 
  let datesArr = []; // this is so that we can find the previous 10 day that actually have values from our date of comparison 

  let daysBack = 0;
  while(datesArr.length != 10){

    let chosenDateFromPast = changingDay(previousDate, daysBack, false).date;
    if(!checkValidDay(chosenDateFromPast, dataObj).bool){ // if there isn't a price for this date, we push back more and continue the loop
      // console.log("This date should have no entry: ", chosenDateFromPast)
      daysBack++;
      continue;
    }

    // We have an existing price for the date;
    datesArr.push(chosenDateFromPast);
    daysBack++;

  }

  console.log("We have our 10 dates");
  console.log(datesArr)
  for(let i = 0; i < datesArr.length; i++){

    // Find price for date (and we know this WILL exist since our loop before checks for it)
    let value = parseInt(findOpenValueForDate(datesArr[i], dataObj));
    // console.log("We are console logging the prices of each valid date: ", value);
    let diff = priceOfDate - value;
    // console.log(`Right now, we're subtracting ${priceOfDate} - ${value} = ${diff}`);
    // console.log(diff);
    // console.log(`Before wwe add it to average, this is avg: ${avg}`)
    avg += diff;
    // console.log(`This is avg after we add it: ${avg}`)

  }

  let finalPrice = priceOfDate + avg;

  // WE HAVE TO UPDATE THE OBJECT HERE:
  updateOrAddEntry(inputtedDate, finalPrice, dataObj);

  // console.log("We're about to return and this function was originally called with: ", inputtedDate);
  return finalPrice;

}




// Checking all valid day cases
function checkValidDay(selected_date, stockData){
  
  let tempObj = {
    bool: true,
    phrase: "You're good"
  }

  
  let tempSelectedDate = new Date(selected_date);
  let earliestAvailableDate = new Date();
  earliestAvailableDate.setDate(earliestAvailableDate.getDate() - 35); // need to update this stuff

  const dateExists = stockData["values"].find(item => item["datetime"] === selected_date);

  // Check if date is a weekend:
  if(tempSelectedDate.getDay() == 5 || tempSelectedDate.getDay() == 6){
    tempObj.bool = false;
    tempObj.phrase = "This date is a weekend. Please choose a different date!";
  }
  else if(tempSelectedDate > date){    //Checks if date is in the future
    tempObj.bool = false;
    tempObj.phrase = "This date is in the future, please select a valid date!";
  }
  else if(tempSelectedDate < earliestAvailableDate){   // Checks if date is too far in the past
    tempObj.bool = false;
    tempObj.phrase = "Too far in the past. Our earliest available date is " + earliestAvailableDate;
  }
  else if(!dateExists){
    tempObj.bool = false;

    if(isToday){  // Day is today 
      tempObj.phrase = "Sorry, market hasn't updated for today yet!";
    } 
    else {   // Maybe holidays?
      tempObj.phrase = "There's no stock info for this date, sorry!"
    }
  }

  return tempObj

}


function findOpenValueForDate(dateToFind, stockData){

  // console.log("This is the date whose value we are searching for: " + dateToFind);
  // console.log("And this is our stock object currently: " + stockData);
  const item = stockData.values.find(item => item.datetime === dateToFind);
  
  if(item) {
    return item.close;
  } else {
    return null;
  }

}


function updateOrAddEntry(datetimeKey, closeKey, stockData){

  // We want to check if the datetimeKey already exists
  const keyIndex = stockData.values.findIndex(entry => entry.datetime === datetimeKey);

  // Exists
  if(keyIndex !== -1){
    stockData.values[keyIndex].close = closeKey;
  }
  else{

    let newEntry = {
      "datetime": datetimeKey,
      "close": closeKey
    }

    stockData.values.push(newEntry);
  }

}


function initializeCanvas(){

  container = document.getElementById("lineChart")
  myChart = document.createElement("canvas")
  myChart.id = "myChart"
  container.appendChild(myChart)
  
}



function correspondingChartFeatures(pricesArr, labelsArr){

  if(pricesArr[0]>pricesArr[labelsArr.length-1]){
    answer_div.innerHTML = "<h2>I advise NOT to buy</h2>"
    lineColor = "red"
  }
  else if(pricesArr[0]<pricesArr[labelsArr.length-1]){
    answer_div.innerHTML = "<h2>I advise TO buy</h2>"
    lineColor = "green"
  }else{
    answer_div.innerHTML = "<h2>Doesn't matter</h2>"
    lineColor = "grey"
  }

}

function drawChart(){

  const ctx = document.getElementById("myChart").getContext('2d')
          myChart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: labelsArr,
                  datasets: [{
                      label: 'Stock Prices',
                      data: pricesArr,
                      borderColor: lineColor,
                      backgroundColor: 'transparent',
                  }]
              },
          })

}


function changingDay(controlDate, includedDays, isMovingForward){

  const tempDate = new Date(controlDate + 'T00:00:00');
  const newTempDate = new Date(tempDate);
  newTempDate.setDate(isMovingForward ? newTempDate.getDate() + includedDays : newTempDate.getDate() - includedDays)

  let year = newTempDate.getFullYear();
  let month = (newTempDate.getMonth() + 1).toString().padStart(2, "0");
  let day = newTempDate.getDate().toString().padStart(2, "0");

  return {
    yearValue: year,
    monthValue: month,
    dayValue: day,
    date: `${year}-${month}-${day}`
  }
}


// looking for a weekday date that we can use etc
function nextMostValidDay(controlDate, increment, isMovingForward){

  // We want to return the closest weekday date based on the incremented value
  // Check if not already weekend
  let newDate = new Date(changingDay(controlDate, increment, isMovingForward).date);

  // Saturday: we return monday's date (we iuncreased by 2)
  if(newDate.getDay() == 5){
    return changingDay(controlDate, increment + 2, isMovingForward).date;
  }

  //Sunday, we return monday's date (increase by 1)
  if(newDate.getDay() == 6){
    return changingDay(controlDate, increment + 1, isMovingForward).date;
  }

  
  return changingDay(controlDate, increment, isMovingForward).date;


}

function nextDay(controlDate, increment){

}