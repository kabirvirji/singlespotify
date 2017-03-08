const prettyjson = require('prettyjson');
const config = require('./config.json');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret
});
function prettyConsole(data) {
  console.log(prettyjson.render(data));
}
'use strict';
const meow = require('meow');
// const foo = require('.');

const foo = function foo(inputs, flags) {
	console.log(flags);
	const artistName = flags['a'];
	console.log(artistName);


	spotifyApi.searchArtists(artistName)
	  .then(function(data) {
	  	const searchResults = data;
	    var fullURI = data.body.artists.items[0].uri;
	    const artistURI = fullURI.slice(15);
	    console.log(artistURI);
	  }, function(err) {
	    console.error(err);
	  });
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



