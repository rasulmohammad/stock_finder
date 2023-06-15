//API initialization
const apiKey = "VOD7R1UWRFPML3LZ";
const apiURL = "https://www.alphavantage.co/query";

//DOM elements
let search_form = document.getElementById("search_bar");
let destroy_canvas = document.getElementById('destroyCanvas');
let year = document.getElementById("year");
let month = document.getElementById("month");
let day = document.getElementById("day");
let answer_div = document.getElementById("answer")
let search_button = document.querySelector(".searchBtn")

//Stocks global variables
let stockObject;
let slope;
let average = 0
let startingStockValue;

//Chart stuff variables
let labels;
let prices;
let myChart;
let container;
let lineColor;
let destroySearch = false;

//Test number
let count = 0

//Date
const date = new Date()
let days = ((date.getDate()).toString()).padStart(2,"0")
console.log(days)
console.log(typeof(days))

let same_day = false;

// On submission of the form, we'll run this
search_form.addEventListener("submit", async function (event) {

  // Refreshing page
  event.preventDefault();

  // Clearing the values
  labels = []
  prices = []

//false = no canvas = should have red delete button 
//true = canvas = should have white search button that has green when hovered

  // If it says "search"/if there is NO canvas
  if(!(destroySearch)){
    // console.log(destroySearch)
    search_button.addEventListener("mouseover", (event) => {search_button.style.backgroundColor = "red"})
    search_button.addEventListener("mouseout", (event) => {search_button.style.backgroundColor = "white"})

    //We have the users input
    let symbol = document.getElementById("search_input").value;
    let year_number = year.value;
    let month_number = month.value.padStart(2,'0')
    let day_number = day.value.padStart(2, '0')

    // console.log(typeof(day_number))

    if(day_number == days){
      same_day = true;
    }
    


    // We use the user's input to determine an average through calling async function (stockmath)
    const stockData = await fetchStockInfo(symbol);


    if(same_day){
      container = document.getElementById("lineChart")
      myChart = document.createElement("canvas")
      myChart.id = "myChart"
      container.appendChild(myChart)
      let final_add = parseInt(stockMathInfo(year_number, month_number, day_number, stockData))
      console.log(final_add)

      startingStockValue = parseInt(stockData["Time Series (Daily)"][`${year_number}-${month_number}-${((parseInt(day_number) - 1).toString()).padStart(2, '0')}`]["1. open"])
      prices.push(startingStockValue)
      prices.push(prices[0] + final_add)
      console.log(prices)



      for(let i = 2; i<10; i++){
        // console.log(((parseInt(day_number) + i).toString()).padStart(2, '0'))


        //future day as string with a leading 0 in case
        let futureDay = ((parseInt(day_number) + i).toString()).padStart(2, '0')

        //Push the labels onto the x axis (these are the dates)

        //Only pushing labels into the array if they aren't weekends
        
        labels.push(`${year_number}-${month_number}-${futureDay}`)
        
        

        //Day before price to compare
        // console.log(prices)
        let previousPrice = prices[i-1] 
        // console.log(`This is i: ${i} and this is the undefined: ${previousPrice}`)


        // pull the future day average (of the 10 days previous) which will return the average 
        let future_day_average = Math.round(((parseInt(stockMathInfo(year_number, month_number, futureDay, stockData))) * 100)/100)

        // Pushing into our prices list for the y axis
        let future_push = previousPrice + future_day_average
        
        prices.push(future_push)

      }

    } 
    else if (!(`${year_number}-${month_number}-${day_number}` in stockData["Time Series (Daily)"])){
      console.log(`${year_number}-${month_number}-${day_number}` + "This is the wrong date somehow?")
      alert("You selected a weekend date, try another one please")
    } 
    else {
        // Creating a canvas 
        container = document.getElementById("lineChart")
        myChart = document.createElement("canvas")
        myChart.id = "myChart"
        container.appendChild(myChart)
        let final_add = parseInt(stockMathInfo(year_number, month_number, day_number, stockData))
        console.log(typeof(final_add))
        

        startingStockValue = parseInt(stockData["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"])
        prices.push(startingStockValue)
       
        // First 2 values are in the lists as NUMBERS
        prices.push(prices[0] + final_add)
        console.log(prices)
        console.log(prices[0])

        // First 2 labels are in the list as strings
        labels.push(`${year_number}-${month_number}-${day_number}`)
        labels.push(`${year_number}-${month_number}-${(parseInt(day_number) + 1).toString().padStart(2, '0')}`)
        console.log(labels)

        // The idea is to rewrite the stockinformation as you go, so that when it finds averages, it finds the averages based on YOUR prediction. Returns a string number
        // stockData["Time Series (Daily)"][`${year_number}-${month_number}-${(parseInt(day_number) + 1).toString().padStart(2, '0')}`]['1. open'] = (prices[1]).toString()
        // console.log(stockData["Time Series (Daily)"][`${year_number}-${month_number}-${(parseInt(day_number) + 1).toString().padStart(2, '0')}`]['1. open'])


        for(let i = 2; i<10; i++){
          // console.log(((parseInt(day_number) + i).toString()).padStart(2, '0'))


          //future day as string with a leading 0 in case
          let futureDay = ((parseInt(day_number) + i).toString()).padStart(2, '0')

          //Push the labels onto the x axis (these are the dates)
          console.log(labels)

          //Only pushing labels into the array if they aren't weekends
          if(`${year_number}-${month_number}-${futureDay}` in stockData["Time Series (Daily)"]){
            labels.push(`${year_number}-${month_number}-${futureDay}`)
          }
          

          //Day before price to compare
          // console.log(prices)
          let previousPrice = prices[i-1] 
          // console.log(`This is i: ${i} and this is the undefined: ${previousPrice}`)


          // pull the future day average (of the 10 days previous) which will return the average 
          let future_day_average = Math.round(((parseInt(stockMathInfo(year_number, month_number, futureDay, stockData))) * 100)/100)

          // Pushing into our prices list for the y axis
          let future_push = previousPrice + future_day_average
          
          prices.push(future_push)

        }
          
        
        console.log(labels)
        console.log(prices)





        //Depending on the sign of the resulting average, this is what we do ->> (also changing line color if negative slope)
        if(final_add<0){
          answer_div.innerHTML = "<h2>I advise NOT to buy</h2>"
          lineColor = "red"
        }
        else if(final_add>0){
          answer_div.innerHTML = "<h2>I advise TO buy</h2>"
          lineColor = "green"
        }else{
          console.log("Flip a coin")
        }



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
      
        search_button.innerHTML = "Delete canvas"
        
        destroySearch = true; 
        search_button.style.backgroundColor = "red";

    }
    
  } else{

      //We have the users input
      document.getElementById("search_input").value = ''
      document.getElementById("year").value = ''
      document.getElementById("month").value = ''
      document.getElementById("day").value = ''

      search_button.addEventListener("mouseover", (event) => {search_button.style.backgroundColor = "green"})
      search_button.addEventListener("mouseout", (event) => {search_button.style.backgroundColor = "white"})

      myChart = document.getElementById("myChart")
      container = document.getElementById("lineChart")
      container.removeChild(myChart)
      answer_div.innerHTML = "<h2>What's the verdict?</h2>"
      search_button.innerHTML = "Search"
      destroySearch = false;

      
  }

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

  } catch (error) {
    console.log("This is your error" + error);
  }

  return stockObject
};






//Main function for the math
const stockMathInfo = (year_number, month_number, day_number, stockData) => {

  // console.log(stockData)

  // Date tests
  // console.log(`This is year number: ${year_number}`);
  // console.log(`This is month: ${month_number}`);
  // console.log(`This is day: ${day_number}`);



    // For loop so that we can do the math of previous days
  for(let i = 0; i<10; i++){

    if(same_day){
      // console.log("we are in here")
      // if(!(`${year_number}-${month_number}-${day_number}` in stockData["Time Series (Daily)"])){
      //   console.log(day_number)
      //   // console.log("skipped weekend")
      //   continue;
      // } 

      // Day before
      let fake_i = ((parseInt(day_number) - i).toString()).padStart(2,"0")



      //If the very first 
      if(`${year_number}-${month_number}-${fake_i}` in stockData["Time Series (Daily)"]){
        let currentDate = `${year_number}-${month_number}-${fake_i}`
        let test = ((parseInt(day_number) - 1).toString()).padStart(2, '0')
        console.log(test)
        console.log(typeof(test))
        console.log(day_number)
        console.log(currentDate)
        console.log(typeof(year_number))
        console.log(`${year_number}-${month_number}-${test}`)

        let test2 = stockData["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]
        console.log(test2)

        startingStockValue = parseInt(stockData["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"])
        console.log(startingStockValue)
      


        if(i!=0){
          if((currentDate in stockData["Time Series (Daily)"])){

            let temp = startingStockValue - stockData["Time Series (Daily)"][`${year_number}-${month_number}-${fake_i}`]['1. open']
            average = average + temp
              
          }
        }
      } else { continue;}
      
      

      // startingStockValue = parseInt(stockData["Time Series (Daily)"][`${year_number}-${month_number}-${((parseInt(day_number) - 1).toString()).padStart(2, '0')}`]["1. open"])
      // console.log(startingStockValue)
      


      // if(i!=0){
      //   if((currentDate in stockData["Time Series (Daily)"])){

      //     let temp = startingStockValue - stockData["Time Series (Daily)"][`${year_number}-${month_number}-${fake_i}`]['1. open']
      //     average = average + temp
            
      //   }
      // }
      

    }

    else{
      console.log("WE AREE NOTG HERE")
      //For when we call in the other for loop, we want to make sure we can actually access it (aka not a weekend)
      if(!(`${year_number}-${month_number}-${day_number}` in stockData["Time Series (Daily)"])){
        continue;
      } 

      // So the numbers don't get mixed up
      let fake_i = ((parseInt(day_number) - i).toString()).padStart(2,"0")
      let currentDate = `${year_number}-${month_number}-${fake_i}`


      // Get our starting/comparing point value (day of)
      
      startingStockValue = stockData["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"]

          // prices.push(parseInt(startingStockValue))
          // count++
          // console.log(`This is the ${count}th time and this is the value:${startingStockValue}`)
      

      // Every other day before 
      if(i!=0) {
          // If it's not a weekend, skip this iteration
          if((currentDate in stockData["Time Series (Daily)"])){

            let temp = startingStockValue - stockData["Time Series (Daily)"][`${year_number}-${month_number}-${fake_i}`]['1. open']
            average = average + temp
              
          }
          
      }
    }

    // //For when we call in the other for loop, we want to make sure we can actually access it (aka not a weekend)
    // if(!(`${year_number}-${month_number}-${day_number}` in stockData["Time Series (Daily)"])){
    //   continue;
    // } 

    // // So the numbers don't get mixed up
    // let fake_i = ((parseInt(day_number) - i).toString()).padStart(2,"0")
    // let currentDate = `${year_number}-${month_number}-${fake_i}`


    // // Get our starting/comparing point value (day of)
    
    // startingStockValue = stockData["Time Series (Daily)"][`${year_number}-${month_number}-${day_number}`]["1. open"]

    //     // prices.push(parseInt(startingStockValue))
    //     // count++
    //     // console.log(`This is the ${count}th time and this is the value:${startingStockValue}`)
    

    // // Every other day before 
    // if(i!=0) {
    //     // If it's not a weekend, skip this iteration
    //     if((currentDate in stockData["Time Series (Daily)"])){

    //       let temp = startingStockValue - stockData["Time Series (Daily)"][`${year_number}-${month_number}-${fake_i}`]['1. open']
    //       average = average + temp
            
    //     }
        
    // }
  }

  // console.log(average)
  return average;

};

 
