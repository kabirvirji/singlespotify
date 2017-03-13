#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const got = require('got');
const meow = require('meow');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const Conf = require('conf');
const spinner = ora('Loading ...');


const singlespotify = async function singlespotify(inputs, flags) {

	// -a "Kanye West"
	const artistName = flags['a'];

	// -a "" evaluates to true due to minimist
	if (artistName === true){
		spinner.fail('Failed');
		console.log(chalk.red(`
	Oops! That search didn't work. Try again please!
	`))
		return
	}

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
	]).then(async function (answers) {

		JSON.stringify(answers, null, '  ');

		const config = new Conf();

		// sway ain't got the
		config.set(answers);

		// ora loading spinner
		spinner.start();

		var tracks = [];
		var artists = [];

		const spotifyApi = new SpotifyWebApi();

		// get artist URI
		const artistSearch = await spotifyApi.searchArtists(artistName);
		// error check for invalid search
		if (artistSearch.body.artists.items[0] === undefined) {
			spinner.fail('Failed');
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
			tracks.push(artistTrack.uri);
		}

		// get three related artists
		let relatedArtists = await spotifyApi.getArtistRelatedArtists(artistURI);
		relatedArtists = relatedArtists.body.artists;
		for (var i=0;i<3;i++){
			var currentArtist = relatedArtists[i].uri;
			artists.push(currentArtist.slice(15));
		}

		// add related artists top songs to tracks array
		let artistOne = await spotifyApi.getArtistTopTracks(artists[0], 'CA');
		artistOne = artistOne.body.tracks;
		for (var i=0;i<3;i++){
			tracks.push(artistOne[i].uri);
		}
		let artistTwo = await spotifyApi.getArtistTopTracks(artists[1], 'CA');
		artistTwo = artistTwo.body.tracks;
		for (var i=0;i<3;i++){
			tracks.push(artistTwo[i].uri);
		}
		let artistThree = await spotifyApi.getArtistTopTracks(artists[2], 'CA');
		artistThree = artistThree.body.tracks;
		for (var i=0;i<3;i++){
			tracks.push(artistThree[i].uri);
		}

		// create an empty public playlist
		var options = {
		  json: true, 
		  headers: {
		    'Content-type': 'application/json',
		    'Authorization' : `Bearer ${config.get('bearer')}`,
		    'Accept' : 'application/json'
		  },
		  body: JSON.stringify({ name: `${artistName}: singlespotify`, public : true})
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
	It's called "${artistName}: singlespotify"`));
					  })
					  .catch(err => { 
					  	spinner.fail('Failed');
					  	console.log(chalk.red("There was an error adding songs to the playlist. Please try again.")); 
					  });
				}

				populatePlaylist(playlistID, tracks);

		  })

		  .catch(err => { spinner.fail('Failed');
		  	console.log(chalk.red(`
	ERROR: Incorrect username or bearer token

	You might need to update your bearer token

	Generate a new one at https://developer.spotify.com/web-api/console/post-playlists/`));

		  });

		 });

}

spinner.stop();

const cli = meow(chalk.cyan(`
    Usage
      $ singlespotify --artist [-a] "artist_name"
      ? Enter your Spotify username <username>
      ? Enter your Spotify bearer token <bearer>

    Example
      $ singlespotify -a "Kanye West"
      ? Enter your Spotify username kabirvirji
      ? Enter your Spotify bearer token ************************************************************

    For more information visit https://github.com/kabirvirji/singlespotify

`), {
    alias: {
        a: 'artist',
        c: 'config'
    }
}, [""]
);

singlespotify(cli.input[0], cli.flags);
