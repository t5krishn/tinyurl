var express = require('express');
var app = express();
var port = 3000;

// open connection to db, maintain it running as soon as app is started for quick searches and updates

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/index.html');
});


app.get('/:alias', function (req, res) {

    // Search db for alias, if it has it use redirect to redirrect user to that website
    // if not, then sendFile the original html to let user make a tinyurl
        // Have the optional alias field filled in with the incorrect alias for ease of use

    if(req.params.alias == "google"){
        res.redirect("http://www.google.com");
    }else{
        res.sendFile(__dirname + '/front/index.html');
    }

});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// var pgp = require('pg-promise')(/* options */);
// var db = pgp('postgres://username:password@host:port/database');

// db.one('SELECT $1 AS value', 123)
//   .then(function (data) {
//     console.log('DATA:', data.value);
//   })
//   .catch(function (error) {
//     console.log('ERROR:', error);
// });