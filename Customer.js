//require mysql and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');

//create connection to db
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Winter#10",
  database: "bamazon"
})

function startBamazon(){
//prints the items for sale and their details
connection.query('SELECT * FROM products', function(err, res){
  if(err) throw err;

  console.log('<----------- ** Welcome to Bamazon ** ----------->')
  console.log('--------------------------------------------------')

  for(var i = 0; i<res.length;i++){
    console.log("ID: " + res[i].item_id + " | " + "Product: " + res[i].prodName + " | " + "Department: " + res[i].deptName + " | " + "Price: " + res[i].price + " | " + "QTY: " + res[i].stockQuant);
    console.log('------------------------------------------------')
  }

  console.log(' ');
  inquirer.prompt([
    {
      type: "input",
      name: "id",
      message: "Enter ID of the product you would like to purchase?",
      validate: function(value){
        if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
          return true;
        } else{
          return false;
        }
      }
    },
    {
      type: "input",
      name: "qty",
      message: "How much would you like to purchase?",
      validate: function(value){
        if(isNaN(value)){
          return false;
        } else{
          return true;
        }
      }
    }
    ]).then(function(ans){
      var whatToBuy = (ans.id)-1;
      // console.log(whatToBuy);
      var howMuchToBuy = parseInt(ans.qty);
      // console.log("how many: " + howMuchToBuy);
      var grandTotal = parseFloat(((res[whatToBuy].price)*howMuchToBuy).toFixed(2));
      // console.log(grandTotal);

      //verify inventory
      if(res[whatToBuy].stockQuant >= howMuchToBuy){
        //update product quantity after purchase
        connection.query("UPDATE Products SET ? WHERE ?", [
        {stockQuant: (res[whatToBuy].stockQuant - howMuchToBuy)},
        {item_id: ans.id}
        ], function(err, result){
            if(err) throw err;
            console.log("Success! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 3-5 business days.");
        });

        connection.query("SELECT * FROM departments", function(err, deptRes){
          if(err) throw err;
          var index;
          for(var i = 0; i < deptRes.length; i++){
            if(deptRes[i].deptName === res[whatToBuy].deptName){
              index = i;
            }
          }
          
          //updates sales in departments table
          connection.query("UPDATE Departments SET ? WHERE ?", [
          {sales: deptRes[index].sales + grandTotal},
          {deptName: res[whatToBuy].deptName}
          ], function(err, deptRes){
              if(err) throw err;
              //console.log("Updated Dept Sales.");
          });
        });

      } else{
        console.log("Sorry, there's not enough in stock!");
      }

      reprompt();
    })
})
}



//asks if they would like to purchase another item
function reprompt(){
  inquirer.prompt([{
    type: "confirm",
    name: "reply",
    message: "\n" + "Would you like to purchase another item?"
  }]).then(function(ans){
    if(ans.reply){
      startBamazon();
    } else{
      console.log("See you soon!");
    }
  });
}

startBamazon();