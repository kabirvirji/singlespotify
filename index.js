const prettyjson = require('prettyjson');
const config = require('./config.json');
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const got = require('got');
const playlist = require('./createPlaylist.js')
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret,
  redirectUri : 'http://localhost/'
});
function prettyConsole(data) {
  console.log(prettyjson.render(data));
}
'use strict';
const meow = require('meow');
// const foo = require('.');

// node index.js -a "Kendrick Lamar" -n 20 -r 3
// 20 song playlist with 

const foo = async function foo(inputs, flags) {
	const artistName = flags['a'];
	var tracks = [];
	var artists = [];

	// get artist URI
	const artistSearch = await spotifyApi.searchArtists(artistName);
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
	for (i=0;i<3;i++){
		var currentArtist = relatedArtists[i].uri;
		artists.push(currentArtist.slice(15));
	}


	// for (i<0;i<3;i++){
	// 	let current = await spotifyApi.getArtistTopTracks(artists[i], 'CA');
	// 	current = current.body.tracks;
	// 	for (j=0;j<3;j++){
	// 		tracks.push(current[j].uri);
	// 	}
	// }

	// add related artist top songs to tracks array
	
	let artistOne = await spotifyApi.getArtistTopTracks(artists[0], 'CA');
	artistOne = artistOne.body.tracks;
	for (i=0;i<3;i++){
		tracks.push(artistOne[i].uri);
	}

	let artistTwo = await spotifyApi.getArtistTopTracks(artists[1], 'CA');
	artistTwo = artistTwo.body.tracks;
	for (i=0;i<3;i++){
		tracks.push(artistTwo[i].uri);
	}

	let artistThree = await spotifyApi.getArtistTopTracks(artists[2], 'CA');
	artistThree = artistThree.body.tracks;
	for (i=0;i<3;i++){
		tracks.push(artistThree[i].uri);
	}





	console.log(tracks);
	console.log(artists);

	// create a playlist
	var options = {
	  json: true, 
	  headers: {
	    'Content-type': 'application/json',
	    'Authorization' : `Bearer ${config.bearer}`,
	    'Accept' : 'application/json'
	  },
	  body: JSON.stringify({ name: `${artistName}: singlespotify`, public : true})
	};
	console.log(options);

	got.post(`https://api.spotify.com/v1/users/${config.username}/playlists`, options)
	  .then(response => {
	    const playlistID = response.body.id;
	    console.log(playlistID);

	// add tracks to playlist
	function populatePlaylist (id, uris) {
		var url = `https://api.spotify.com/v1/users/${config.username}/playlists/${id}/tracks?uris=${uris}`
		var options = {
		  json: true, 
		  headers: {
		    'Content-type': 'application/json',
		    'Authorization' : `Bearer ${config.bearer}`,
		  }
		};
		got.post(url, options)
		  .then(response => {
		    console.log(response.body);
		  })
		  .catch(err => { console.log(err) 
		  });
	}

	populatePlaylist(playlistID, tracks);







	  })
	  .catch(err => { console.log(err) 
	  });








		// spotifyApi.getArtistTopTracks(artistURI, 'CA')
		//   .then(function(data) {
		//     console.log(data.body);
		//     }, function(err) {
		//     console.log('Something went wrong!', err);
		//   });



		// spotifyApi.getArtistRelatedArtists(artistURI)
		//   .then(function(data) {
		//     //console.log(data.body);
		//   }, function(err) {
		//     console.log(err);
		//   });



}



const cli = meow(`
    Usage
      $ foo <input>

    Options
      --rainbow, -r  Include a rainbow

    Examples
      $ foo unicorns --rainbow
      🌈 unicorns 🌈
`, {
    alias: {
        a: 'artist'
    }
});
/*
{
    input: ['unicorns'],
    flags: {rainbow: true},
    ...
}
*/

foo(cli.input[0], cli.flags);

// node index.js -a "some artist name"



