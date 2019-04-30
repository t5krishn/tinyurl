var express = require('express');
var app = express();
var port = 3002;
var pg  = require('pg');
var assert = require('assert');

var config ={
	user : 'postgres',
	database: 'tinyurl',
	password: 'HOMyONcLNaCdGMdl',
	port: 3306,
	host: '35.203.117.36'
};

var pool = new pg.Pool();
var client = new pg.Client(config);
var query = new pg.Query('SELECT NOW()');

app.get('/:alias', function (req, res) {

	client.connect();
	var response = client.query('SELECT NOW()', (err,res) =>{});
	assert(response == undefined);
	client.end();
	res.send('select from tinyurlTable: ' +  response);
	
});



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
