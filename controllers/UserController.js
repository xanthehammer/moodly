var LastFmNode = require('lastfm').LastFmNode;
var geniusapi = require('node-genius');
var genius = new geniusapi(process.env.GENIUS_CLIENT_ACCESS_TOKEN);

var lastfm = new LastFmNode({
  api_key: process.env.LASTFM_API_KEY,
  secret: process.env.LASTFM_SECRET,
  useragent: 'moodly'
});

exports.Index = function(request, response) {
	response.redirect('/');
};

exports.User = function(request, response) {
	var user = request.params.user;
	var app = request.app;

	var info = lastfm.info('user', {
		user:user
	});

	info.on("success", function(json) {
		response.body = {};
		response.body.name = json.name;
		response.body.image = json.image[1]['#text']; // medium sized image
		response.body.url = json.url;

		var recentTracks = lastfm.request('user.getRecentTracks', {
			user:user,
			limit:10
		});

		recentTracks.on("success", function(json) {
			var song = json.recenttracks.track[0].artist['#text'] + " - " + json.recenttracks.track[0].name;
			console.log(song);
			genius.search(song, function(error, results) {
				var data = JSON.parse(results);
				var id = data.response.hits[0].result.id;
				console.log(id);
				genius.getSong(id, function(error, song) {
					var data = JSON.parse(song);
					console.log(data.response.song.url);
				});
			});
		});

		recentTracks.on("error", function(error) {
			console.log(error);
		});

		response.render('user/User', response.body)
	});

	info.on("error", function(error) {
		console.log(error);
	});


}