var express = require('express');
var app = express();
var port = 3000;
var { Pool } = require('pg');

var pool = new Pool();


app.get('/', function (req, res) {
  pool.query('SELECT * FROM tinurlTable', (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(res.rows[0]);
    }
  });
});



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
