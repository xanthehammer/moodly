var HomeController = require('./controllers/HomeController');
var UserController = require('./controllers/UserController');

module.exports = function(app) {
	app.get('/', HomeController.Index);
	app.get('/user', UserController.Index);
	app.get('/user/:user', UserController.User)
}