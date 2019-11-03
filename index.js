#!/usr/bin/env node
'use strict';
const meow = require('meow');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const Conf = require('conf');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const spinner = ora('Loading ...');

// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();
const spotifyApi = require('./api_calls/requests')

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
				process.exit()
			}
			let artistID = res.artists.items[0].id;
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
	.catch(async err => { 
		spinner.fail('Failed');
		config.clear();
		console.log(chalk.red(`
ERROR: Incorrect username or bearer token

You might need to update your bearer token

Generate a new one at https://developer.spotify.com/console/post-playlists/

Try again!
$ singlespotify "artist_name"`));
		process.exit()

	});
		// console.log(artistSearch.data)
		var timeout = setInterval(function() {
			if(relatedTracks.length !== 0 && allTracks.length !== 0) {
				const tracks = allTracks.concat(relatedTracks)
				clearInterval(timeout);
				// call playlist gen function using allTracks
				spotifyApi.createPlaylist(playlistName, token).then(res => spotifyApi.populatePlaylist(res.id, tracks, token).then(res => {
					spinner.succeed('Success!');
					console.log(chalk.green(`
Your playlist is ready! 
It's called "${playlistName}"`));
				}))
			}
		}, 400);

}

spinner.stop(); // like return

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

if (config.get('username') === undefined || config.get('bearer') === undefined) {
	let authorization = await auth();
}
singlespotify(cli.input[0], cli.flags);

})()
