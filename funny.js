
let money_count = 0
let money_number = document.getElementById("reveal_money")


money_number.addEventListener('click', function(event) {
    if(money_count == 0){
      money_number.style.color = 'red'
      money_count++
    }
    else if(money_count == 1){
      money_number.style.color = 'red'
      money_number.innerHTML = "$ 4203.72"
      money_count++
    }
    else if(money_count == 2){
      money_number.style.color = 'green'
      money_number.innerHTML = '$ 3709'
      count++
    }
    
    
  })