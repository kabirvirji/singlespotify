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

// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

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


		// "Kanye West"
		const artistName = inputs;
		// name of the playlist, optional parameter
		var playlistName = flags['n'];

		if (playlistName === undefined){
			playlistName = `${artistName}: singlespotify`;
		}

		if (playlistName === true){
			spinner.fail('Failed');
			config.clear();
			console.log(chalk.red(`
		Oops! That name is not valid. Please provide a different playlist name!
		`))
			return
		}

		if (artistName === undefined){
			spinner.fail('Failed');
			//config.clear();
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

		const spotifyApi = new SpotifyWebApi();

		// get artist URI
		const artistSearch = await spotifyApi.searchArtists(artistName);
		// error check for invalid search
		if (artistSearch.body.artists.items[0] === undefined) {
			spinner.fail('Failed');
			config.clear();
			console.log(chalk.red(`

	Oops! That search didn't work. Try again please!
		`))
			return
		}
		let artistURI = artistSearch.body.artists.items[0].uri;
		artistURI = artistURI.slice(15);

		// get artist top tracks
		let artistTopTracks = await spotifyApi.getArtistTopTracks(artistURI, 'CA');
		artistTopTracks = artistTopTracks.body.tracks;
		for (let artistTrack of artistTopTracks) {
			allTracks.push(artistTrack.uri);
		}

		// get three related artists
		let relatedArtists = await spotifyApi.getArtistRelatedArtists(artistURI);
		relatedArtists = relatedArtists.body.artists;
		for (var i=0;i<3;i++){
			if (relatedArtists[i] !== undefined) {
				var currentArtist = relatedArtists[i].uri;
				artists.push(currentArtist.slice(15));
			}
		}

		for (let i = 0; i < Math.min(artists.length, 2); i++) {
		  let artist = await spotifyApi.getArtistTopTracks(artists[i], 'CA');
		  
		  if (!artist || !artist.body || !artist.body.tracks)
		    continue

		  let { tracks } = artist.body;
		  
		  for (let j = 0; j < Math.min(tracks.length, 3); j++) {
		    if (tracks[j] && tracks[j].uri)
		      allTracks.push(tracks[j].uri)
		  }
		}

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
      $ singlespotify -a "Kanye West"
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
