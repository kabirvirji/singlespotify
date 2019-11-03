#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const got = require('got');
const meow = require('meow');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const Conf = require('conf');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const spinner = ora('Loading ...');
const open = require('open');

// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();
const spotifyApi = require('./api_calls/requests')

// another option is to open the spotify auth page
// then redirect to my own server, that just displays the unique the token that is in the URL 
// a node heroku server that displays on the front end whatever info it gets POSTed with 

// var authPromise = new Promise(async function(resolve, reject) {
// 	console.log("authPromise")
// 	await open('https://accounts.spotify.com/authorize', {wait: true}); // have to exit chrome for this to resolve 
// 	resolve("token")
// 	// reject("error")
// 	// make api call to heroku endpoint
// 	// send app tokens
// 	// open BROWSER for auth
// 	// get back access token
// 	// store in conf (no need for inquirer)
// })

function auth() {
	return new Promise((resolve, reject) => {
	  inquirer.prompt([
		  {
			type: 'input',
			message: 'Enter your Spotify username',
			name: 'username'
		  },
		  {
			type: 'password',
			message: 'Enter your Spotify bearer token',
			name: 'bearer'
		  }
	  ]).then(function (answers) {
		var answer = JSON.stringify(answers);
		config.set(answers);
		resolve(true);
	  }).catch(err => reject(err));
	});
  }

const singlespotify = async function singlespotify(inputs, flags) {

		// "Young Thug"
		const artistName = inputs;
		// name of the playlist, optional parameter
		var playlistName = flags['n'];

		if (playlistName === undefined) {
			playlistName = `${artistName}: singlespotify`;
		}

		// if (playlistName === true){
		// 	spinner.fail('Failed');
		// 	config.clear(); // might not need this if we store token using config
		// 	console.log(chalk.red(`
		// Oops! That name is not valid. Please provide a different playlist name!
		// `))
		// 	return
		// }

		if (artistName === undefined){
			spinner.fail('Failed');
			console.log(chalk.red(`
	Oops! Remember to add an artist name!

	Example
		singlespotify "Kendrick Lamar"
		`))
			return
		}

		// empty string
		if (artistName.trim() === ""){
			spinner.fail('Failed');
			config.clear();
			console.log(chalk.red(`
	Oops! Artist name can't be empty. Please provide an artist name!
		`))
			return
		}

		// ora loading spinner
		spinner.start();

		var allTracks = [];
		var artists = [];
		var relatedTracks = []

		// const spotifyApi = new SpotifyWebApi();

		// get artist URI
		let token = config.get('bearer')
		// const artistSearch = await 
		spotifyApi.searchArtists(artistName, token).then(res => {
			if (res.artists.items[0] === undefined) {
				spinner.fail('Failed');
				config.clear();
				console.log(chalk.red(`
	
		Oops! That search didn't work. Try again please!
			`))
				return
			}
			let artistID = res.artists.items[0].id;
			console.log(artistID)
			spotifyApi.getArtistTopTracks(artistID, token).then(res => {
				for (let artistTrack of res.tracks) {
					allTracks.push(artistTrack.uri);
				}
				spotifyApi.getArtistRelatedArtists(artistID, token).then(res => {
					for (var i=0;i<5;i++){
						if (res.artists[i] !== undefined) {
							artists.push(res.artists[i].id);
						}
					}
					// addRelatedTracks(tracks, )

					for (let i = 0; i < Math.min(artists.length, 5); i++) {
						spotifyApi.getArtistTopTracks(artists[i], token).then(res => {
							for (let artistTrack of res.tracks) {
								relatedTracks.push(artistTrack.uri);
							}
						})
					}
			
			})
		})
	})
		// console.log(artistSearch.data)
		var timeout = setInterval(function() {
			if(relatedTracks.length !== 0 && allTracks.length !== 0) {
				const tracks = allTracks.concat(relatedTracks)
				clearInterval(timeout);
				// call playlist gen function using allTracks
				spotifyApi.createPlaylist(playlistName, token).then(res => spotifyApi.populatePlaylist(res.id, tracks, token).then(res => console.log("success")))
			}
		}, 400);
		return

		// create an empty public playlist
		var options = {
		  json: true, 
		  headers: {
		    'Content-type': 'application/json',
		    'Authorization' : `Bearer ${config.get('bearer')}`,
		    'Accept' : 'application/json'
		  },
		  body: JSON.stringify({ name: `${playlistName}`, public : true})
		};

		got.post(`https://api.spotify.com/v1/users/${config.get('username')}/playlists`, options)
		  .then(response => {
		    const playlistID = response.body.id;

				// function to add tracks to playlist
				function populatePlaylist (id, uris) {
					var url = `https://api.spotify.com/v1/users/${config.get('username')}/playlists/${id}/tracks?uris=${uris}`
					var options = {
					  json: true, 
					  headers: {
					    'Content-type': 'application/json',
					    'Authorization' : `Bearer ${config.get('bearer')}`,
					  }
					};
					got.post(url, options)
					  .then(response => {
					  	spinner.succeed('Success!');
					    console.log(chalk.green(`
	Your playlist is ready! 
	It's called "${playlistName}"`));
					  })
					  .catch(err => { 
					  	spinner.fail('Failed');
					  	// don't need to reset config since credentials are correct at this point
					  	console.log(chalk.red(`
	There was an error adding songs to the playlist. 

	However, a playlist was created. 

	Please try a different search.`)); 
					  });
				}

				populatePlaylist(playlistID, allTracks);

		  })

		  .catch(async err => { 
		  	spinner.fail('Failed');
		  	config.clear();
		  	console.log(chalk.red(`
	ERROR: Incorrect username or bearer token

	You might need to update your bearer token

	Generate a new one at https://developer.spotify.com/web-api/console/post-playlists/

	Try again!
	  $ singlespotify "artist_name"`));

		  });

}

spinner.stop();

const cli = meow(chalk.cyan(`
    Usage
      $ singlespotify "artist_name"
      ? Enter your Spotify username <username>
      ? Enter your Spotify bearer token <bearer>

    Options
      --name [-n] "playlist name"

    Example
      $ singlespotify -a "Young Thug"
      ? Enter your Spotify username kabirvirji
      ? Enter your Spotify bearer token ************************************************************

    For more information visit https://github.com/kabirvirji/singlespotify

`), {
    alias: {
        n: 'name'
    }
}
);

updateNotifier({pkg}).notify();

(async () => {

// if (config.get('token') === undefined) {
// 	// var token = await auth();
// 	authPromise.then(function() {
// 		console.log("yes")
// 	}, function() {
// 		console.log("error")
// 	})
// 	// singlespotify(cli.input[0], cli.flags, token);
// }
if (config.get('username') === undefined || config.get('bearer') === undefined) {
	let authorization = await auth();
}
singlespotify(cli.input[0], cli.flags);

})()
