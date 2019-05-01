var express = require('express');
var app = express();
var { Client }  = require('pg');
var bodyParser = require('body-parser');
// const {user, password, database, host}= require("./.configdb");
var port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

var urlencodedParser = bodyParser.urlencoded({extended: false});




// const config ={
//   user: user,
//   password: password,
//   database: database,
//   host: host
// };



app.get('/', function (req, res) {
  res.sendFile(__dirname + '/front/index.html');
});


app.get('/init', function (req, res) {
  // var pool = new pg.Pool({
  //   connectionString: process.env.DATABASE_URL,
  //   ssl: true,
  // });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query("CREATE TABLE tinyurltable (alias VARCHAR (80) UNIQUE NOT NULL, longurl VARCHAR (1000) NOT NULL);", 
     (err, res) => {
      if (err) throw err;
      console.log(res);
      client.end();  
    });
  res.send("tinyurltable CREATED");
});

// app.get('/url/:alias', function (req, response) {
//     var pool = new pg.Pool({
//       connectionString: process.env.DATABASE_URL,
//       ssl: true,
//     });
//     pool.query('SELECT * FROM tinyurlTable WHERE alias=$1', [req.params.alias], (err, res) => {
//       if(res == undefined){
//         response.sendFile(__dirname + '/front/index.html');
//         // Run alert/update page saying that alias is not registered
//       }else{
//         console.log(err, res.rows[0].longurl);
//         response.redirect(res.rows[0].longurl);
//       }
//       pool.end();
//     });
// });


// app.post('/url',urlencodedParser,function(req,res){
//   console.log(req.body.url);


//   res.send("Submitted");/* Send a html file instead confirming the request and whether they want to submit another one */
//   // ?first=firstname&last=lastname
// });
//
// pool.connect(function(err,client,done){
//	pool.query('SELECT * FROM tinyurlTable');
//	done();
// });

// pool.end()

// module.exports = {
//   query: (text, params, callback) => {
//     // var start = Date.now();
//     return pool.query(text, params, (err, res) => {
//       // var duration = Date.now() - start;
//       // console.log('executed query', { text, duration, rows: res.rowCount });
//       callback(err, res);
//     });
//   }
// };


// CREATE TABLE tinyurlTable (
//   alias            varchar(80),
//   longurl         varchar(100)
// );



app.listen(port, () => console.log(`Example app listening on port ${port}!`));
