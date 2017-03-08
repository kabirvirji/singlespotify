
// const config = require('./config.json');
// const SpotifyWebApi = require('spotify-web-api-node');
// const spotifyApi = new SpotifyWebApi({
//   clientId : config.spotifyid,
//   clientSecret : config.spotifysecret
// });
'use strict';
const meow = require('meow');
// const foo = require('.');

const foo = function foo(inputs, flags) {
	console.log(inputs);
	console.log(flags);
	console.log(flags['r']);
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
        r: 'rainbow'
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



