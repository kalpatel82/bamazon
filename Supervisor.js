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


function start() {
  inquirer.prompt([{
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["View Product Sales by Department", "Create New Department", "End Session"]
  }]).then(function (ans) {
    switch (ans.action) {
      case "View Product Sales by Department": viewProductByDept();
        break;
      case "Create New Department": createNewDept();
        break;
      case "End Session": console.log('Bye!');
    }
  });
}

//view sales by department
function viewProductByDept() {
  //print items for sale and details
  connection.query('SELECT * FROM Departments', function (err, res) {
    if (err) throw err;
    console.log('<------Product Sales by Department------>');
    console.log('----------------------------------------------------------------------------------------------------')

    for (var i = 0; i < res.length; i++) {
      console.log("Department ID: " + res[i].deptID + " | " + "Department Name: " + res[i].deptName + " | " + "Over Head Cost: " + (res[i].costs).toFixed(2) + " | " + "Product Sales: " + (res[i].sales).toFixed(2) + " | " + "Total Profit: " + (res[i].sales - res[i].costs).toFixed(2));
      console.log('--------------------------------------------------------------------------------------------------')
    }
    start();
  })
}

//create new department
function createNewDept() {
  console.log('<------Creating New Department------>');
  //prompts to add new dept. 
   inquirer.prompt([
    {
      type: "input",
      name: "deptName",
      message: "Department Name: "
    }, {
      type: "input",
      name: "overHeadCost",
      message: "Over Head Cost: ",
      default: 0,
      validate: function (val) {
        if (isNaN(val) === false) { return true; }
        else { return false; }
      }
    }, {
      type: "input",
      name: "prodSales",
      message: "Product Sales: ",
      default: 0,
      validate: function (val) {
        if (isNaN(val) === false) { return true; }
        else { return false; }
      }
    }
  ]).then(function (ans) {
    connection.query('INSERT INTO Departments SET ?', {
      deptName: ans.deptName,
      costs: ans.overHeadCost,
      sales: ans.prodSales
    }, function (err, res) {
      if (err) throw err;
      console.log('Another department was added.');
    })
    start();
  });
}

start();