/*jshint esversion: 8 */

// MAIN FILE OF TINYURL APP: index.js
// REQUIREMENTS: Make an app that takes in a url and an alias(optional)
//    - and return a link for it that is "shorter" incorporating the 
//    - alias if there is one given, or generate a unique url
// STORAGE/HOSTING:  Hosting on heroku, db used is Postgresql on heroku
// URL: https://t-tinyurl.herokuapp.com




// IMPORTS
var express = require('express');
var app = express();
var { Client }  = require('pg');
var bodyParser = require('body-parser');

// PORT CONFIG FOR DB CONNECTION
// const {user, password, database, host}= require("./.configdb"); // USED FOR LOCAL DB CONFIG
var port = process.env.PORT;

// If not port is defined, make default 3000
if (port == null || port == "") {
  port = 3000;
}

// DATA IS PARSED WITH BODY-PARSER AS URLENCODED STRING
var urlencodedParser = bodyParser.urlencoded({extended: false});




// USED FOR LOCAL DB CONFIG-----------
// const config ={
//   user: user,
//   password: password,
//   database: database,
//   host: host
// };


// Default html file for home page
// PROBLEM: DID NOT SERVE CSS FILE AS WELL, SOLUTION WAS TO 
//  - USE express.static and app.use
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/front/index.html');
// });

// Default html file for home page served with css file
app.use(express.static("front"));

// Used one time to initalize the tinyurl db table, not needed anymore
// Can be used to initialize new tables if needed
// app.get('/init', function (req, res) {
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true,
//   });
//   client.connect();
//   client.query("CREATE TABLE tinyurltable (alias VARCHAR (80) UNIQUE NOT NULL, longurl VARCHAR (1000) NOT NULL);", 
//      (err, res) => {
//       if (err) throw err;
//       console.log(res);
//       client.end();  
//     });
//   res.send("tinyurltable CREATED");
// });


// APP GET --> Checks if alias exists in db
//  - if it does, redirect to link stored in db corresponding to alias
//  - if not, show an error message and a link to redirect to main page to 
//  - make a new tinyurl

app.get('/r/:alias', function (req, response) {
  const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
  });
  client.connect();

  client.query('SELECT * FROM tinyurltable WHERE alias=$1', [req.params.alias], (err, res) => {
    if(res.rowCount == 0){  /* This means that the alias does not exist in db*/
      console.log(err,res);

      // Run alert/update page saying that alias is not registered
      // FUTURE UPDATE: CHANGE TO A HTML PAGE UPDATE/REACT COMPONENT UPDATE ---------------
      response.set('Content-Type', 'text/html');
      response.send(new Buffer(''+
      '<h2> Alias not found</h2>'+
      '<br>'+
      '<p>Return to main page to create a tinyurl</p>'+
      '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'));
    }else{
      // If res.rowCount is not zero, that means there is an alias registered
      //  - so redirect to the link stored in the db
      console.log(err, res);
      response.redirect(res.rows[0].longurl);
    }
    client.end();
  });
});





// APP POST --> GETS DATA FROM FORM IN FRONT/INDEX.HTML
// DATA IS PARSED WITH BODY-PARSER AS URLENCODED STRING
// req.body has obj of form {alias: "", url:""}
// can access it for eg:  req.body.alias 
app.post('/url',urlencodedParser,function(req,response){
  // console.log(req.body.alias);

  if(req.body.alias != ''){/* IF ALIAS IS NOT EMPTY, IF IT'S EMPTY GENERATE A UNIQUE STRING AS ALIAS */

    // Calls inTable fn, that returns a bool, TRUE IF alias is in table, FALSE IF alias is not in table
    inTable(req.body.alias).then(function(inTableResult){
      
      // IF ALIAS SENT IN IS ALREADY IN THE TABLE, THEN SAY IT'S REGISTERED AND SHOW OPTIONS
      // FUTURE UPDATE: CHANGE TO A HTML PAGE UPDATE/REACT COMPONENT UPDATE ---------------
      if(inTableResult){ 
        response.set('Content-Type', 'text/html');
        response.send(new Buffer(''+
        '<h2> Alias already registered</h2>'+
        '<br>'+
        '<p>Return to main page to create another tinyurl</p>'+
        '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'+
        '<p>Or go to your url:</p>'+
        '<br><a href="https://t-tinyurl.herokuapp.com/r/'+req.body.alias+'"> t-tinyurl.herokuapp.com/r/'+req.body.alias+'</a>'));
  
        // IF ALIAS IS NOT SENT IN THEN ATTEMPT TO INSERT INTO THE TABLE
      }else{
        insert(req.body.alias, req.body.url).then(function(insertResult){
          // IF INSERT WORKS, SHOULD RETURN TRUE SO SHOW SUCCESS AND TINYURL LINK
          if(insertResult){
            // FUTURE UPDATE: CHANGE TO A HTML PAGE UPDATE/REACT COMPONENT UPDATE ---------------
            response.set('Content-Type', 'text/html');
            response.send(new Buffer(''+
            '<h2> Alias registered!</h2>'+
            '<br>'+
            '<p>Return to main page to create another tinyurl</p>'+
            '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'+
            '<p>Or go to your NEW url:</p>'+
            '<br><a href="https://t-tinyurl.herokuapp.com/r/'+req.body.alias+'"> t-tinyurl.herokuapp.com/r/'+req.body.alias+'</a>'));
          }
          // IF INSERT DOESN'T RESPOND WITH TRUE THEN SOMETHING WENT WRONG WITH INSERTION, ASK USER TO TRY AGAIN
          else{
            response.set('Content-Type', 'text/html');
            response.send(new Buffer(''+
            '<h2> Alias register unsucessful!</h2>'+
            '<br>'+
            '<p>Return to main page to try again</p>'+
            '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'));
          }
        });
      }
    });      
  }/* IF ALIAS IS NOT EMPTY , IF END */
  
  // IF ALIAS IS EMPTY, ELSE START
  else{
    // IF ALIAS IS EMPTY THEN GENERATE AN ALIAS THAT'S UNIQUE(TRIES TO BE)
    // generate unique string as alias
    var alias = Math.random().toString(36).substr(2, 9);

    // INSERT fn attempts to insert new alias and url into db
    insert(alias, req.body.url).then(function(insertResult){
  
        if(insertResult){
          response.set('Content-Type', 'text/html');
          response.send(new Buffer(''+
          '<h2> Alias registered!</h2>'+
          '<br>'+
          '<p>Return to main page to create another tinyurl</p>'+
          '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'+
          '<p>Or go to your NEW url:</p>'+
          '<br><a href="https://t-tinyurl.herokuapp.com/r/'+alias+'"> t-tinyurl.herokuapp.com/r/'+alias+'</a>'));
        }else{
          response.set('Content-Type', 'text/html');
          response.send(new Buffer(''+
          '<h2> Alias register unsucessful!</h2>'+
          '<br>'+
          '<p>Return to main page to try again</p>'+
          '<br><button onclick="location.href = \'https://t-tinyurl.herokuapp.com\';">tinyurl</button>'));
        }

      });
  }
  // IF ALIAS IS EMPTY, ELSE END

});
// END OF APP.POST FUNCTION


app.listen(port, () => console.log(`Tiny url app listening on port ${port}!`));


// async function ID() {
//    // Math.random should be unique because of its seeding algorithm.
//   // Convert it to base 36 (numbers + letters), and grab the first 9 characters
//   // after the decimal.
//   var goodID = '';
//   while(true){
//     var possibleID = Math.random().toString(36).substr(2, 9);
    
//     inTable(possibleID).then(function(inTableResult){
//       if(!inTableResult){
//         goodID = possibleID;
//         break;
//       }
//     });
//   }
//   return goodID;
  
// }


// INTABLE function checks to see if the text sent in exists as an
//   - alias and returns a boolean
async function inTable(alias) {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    }); 
    client.connect();
    const response = await client.query('SELECT * FROM tinyurltable WHERE alias=$1',[alias]);
    client.end();
    if(response.rowCount > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  catch (rejectedValue) {
    console.log("rejectedValue.stack= "+ rejectedValue.stack);
    // return false;
  }
}

// INSERT function attempts to insert new alias and url into db,
//  - returns true if successful
async function insert(alias,url){
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    }); 
    client.connect();
    const response = await client.query('INSERT INTO tinyurltable (alias, longurl) VALUES ($1,$2)',[alias,url]);
    client.end();
    return true;
  }catch(rejectedValue){
    console.log("rejectedValue.stack= "+ rejectedValue.stack);
    // return false;
  }
}