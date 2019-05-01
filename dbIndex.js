var express = require('express');
var app = express();
var { Client }  = require('pg');
var bodyParser = require('body-parser');
// const {user, password, database, host}= require("./.configdb"); // USED FOR LOCAL DB CONFIG
var port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

var urlencodedParser = bodyParser.urlencoded({extended: false});




// USED FOR LOCAL DB CONFIG
// const config ={
//   user: user,
//   password: password,
//   database: database,
//   host: host
// };



app.get('/', function (req, res) {
  res.sendFile(__dirname + '/front/index.html');
});


// Used one time to initalize the tinyurl db table, not needed anymore
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

app.get('/url/:alias', function (req, response) {
  const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
  });
  client.connect();

  client.query('SELECT * FROM tinyurltable WHERE alias=$1', [req.params.alias], (err, res) => {
    if(res.rowCount == 0){
      console.log(err,res);
      response.sendFile(__dirname + '/front/index.html');
      // Run alert/update page saying that alias is not registered
    }else{
      console.log(err, res);
      response.redirect(res.rows[0].longurl);
    }
    client.end();
  });
});


app.post('/url',urlencodedParser,function(req,response){
  console.log(req.body.alias);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });  
  

  client.connect();

  if(req.body.alias != ''){
    client.query('SELECT * FROM tinyurltable WHERE alias=$1',[req.body.alias], (err, res) => {
      // if (err) throw err;
      console.log(res);
      if(res.rowCount > 0){
        client1.end();
        response.sendFile(__dirname + '/front/index.html');
        // Run alert/update page saying that alias is already registered
      }else{
        client1.end();
        const client2 = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: true,
        });  
        client2.connect();
        // console.log([req.body.alias, req.body.url]);
        client2.query('INSERT INTO tinyurltable (alias, longurl) VALUES ($1,$2)', [req.body.alias, req.body.url], (err, res) => {
          console.log(err, res);
        });
        client2.end();
        response.send('successful entry'); /* send page saying successful entering to db */
      }
      
    });
  }
 /* Send a html file instead confirming the request and whether they want to submit another one */
  // ?first=firstname&last=lastname
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// var ID = function () {
//   // Math.random should be unique because of its seeding algorithm.
//   // Convert it to base 36 (numbers + letters), and grab the first 9 characters
//   // after the decimal.
//   return '_' + Math.random().toString(36).substr(2, 9);
// };