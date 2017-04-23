var tone_analyzer_v3 = require('watson-developer-cloud/tone-analyzer/v3');
var LastFmNode = require('lastfm').LastFmNode;
var geniusapi = require('genius-api');
var genius = new geniusapi(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
var scrapeit = require('scrape-it');
var async = require('async');

var tone_analyzer = new tone_analyzer_v3({
	username: process.env.WATSON_USERNAME,
	password: process.env.WATSON_PASSWORD,
	version_date: '2016-05-19'
});

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

	var tracks = [];
	var happiness = 0;
	var anger = 0;
	var sadness = 0;

	var info = lastfm.info('user', {
		user:user
	});

	info.on("success", function(json) {
		userData = {};
		userData.name = json.name;
		userData.image = json.image[1]['#text'];
		userData.url = json.url;

		var recentTracks = lastfm.request('user.getRecentTracks', {
			user:user,
			limit:10
		});

		recentTracks.on("success", function(json) {
			var arr = json.recenttracks.track;
			async.each(arr, function(track, callback) {
				genius.search(track.artist['#text']+" - "+track.name).then(function(res) {
					var url = res.hits[0].result.url;
					scrapeit(url, {
						lyrics: {
							selector: "p",
							eq: 0
						}
					}).then(function(page) {
						tone_analyzer.tone({ text: page.lyrics }, function(err, tone) {
							if (err) {
								console.log(err);
							} else {
								var song = {};
								song.name = track.name;
								song.artist = track.artist['#text'];
								song.lyrics = page.lyrics;
								song.url = url
								song.mood = {};
								song.mood.joy = tone.document_tone.tone_categories[0].tones[3].score;
								song.mood.anger = tone.document_tone.tone_categories[0].tones[0].score;
								song.mood.sadness = tone.document_tone.tone_categories[0].tones[4].score;
								tracks.push(song);
								callback();
							}
						});
					});
				});
			}, function(err) {
				if (err) {
					console.error(err);
				} else {
					render(response, tracks, userData);
				}
			});
			
		});

		recentTracks.on("error", function(error) {
			console.log(error);
		});

		
	});

	info.on("error", function(error) {
		console.log(error);

	});


}

var render = function(response, tracks, userData) {
	data = {}
	data.userData = userData;
	data.tracks = {};
	response.render('user/User', data);
}