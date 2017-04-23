var express = require('express');
var handlebars = require('express-handlebars');
var router = require('./router');

var host = process.env.IP || "0.0.0.0";
var port = process.env.PORT || 8080;

var app = express();
var routes = router(app);
var hbs = handlebars.create({
	defaultLayout: 'main'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/bower_components'));

app.listen(port, function() {
	console.log("Listening on " + port);
});