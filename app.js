var http = require('http');
var express = require('express');

var host = process.env.IP || "0.0.0.0";
var port = process.env.PORT || 8080;

var app = express();
var server = http.Server(app);

app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/bower_components'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/html/index.html');
}

server.listen(port, host function() {
	console.log("Listening on " + port);
})