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

    if (artistName === undefined) {
        spinner.fail('Failed');
        console.log(chalk.red(`
	Oops! Remember to add an artist name!

	Example
		singlespotify "Kendrick Lamar"
		`))
        return
    }

    // empty string
    if (artistName.trim() === "") {
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
    let username = config.get('username')

    if (flags['artistId'] !== undefined) {
        let artistId = flags['artistId']
        let offset = 0
        let albumsIds = []
        await spotifyApi.getArtistsAlbums(artistId, token, 50, offset).then(async res => {
            if (res.items.length > 0) {
                res.items.forEach(album => {
                    albumsIds.push(album.id);
                })
                if (res.next !== null) {
                    for (let i = 50; i < res.total; i = i + 50) {
                        await spotifyApi.getArtistsAlbums(artistId, token, 50, i).then(res => {
                            res.items.forEach(album => {
                                albumsIds.push(album.id)
                            })
                        })
                    }
                }
            }
        });


        for (let albumId of albumsIds) {
            await spotifyApi.getAlbumTracks(albumId, token, 50, 0).then(async res => {
                if (res.items.length > 0) {
                    for (let track of res.items) {
                        relatedTracks.push(track.uri)
                        if (res.next !== null) {
                            for (let i = 50; i <= res.total; i = i + 50) {
                                await spotifyApi.getAlbumTracks(albumsIds, token, 50, i).then(async res => {
                                    relatedTracks.push(res.uri)
                                })
                            }
                        }
                    }
                }
            })
        }
        //Convert albums to tracks


    } else {
        await spotifyApi.searchArtists(artistName, token).then(async res => {
            if (res.artists.items[0] === undefined) {
                spinner.fail('Failed');
                config.clear();
                console.log(chalk.red(`
	
		Oops! That search didn't work. Try again please!
			`))
                process.exit()
            }
            let artistID = res.artists.items[0].id;
            await spotifyApi.getArtistTopTracks(artistID, token).then(async res => {
                for (let artistTrack of res.tracks) {
                    allTracks.push(artistTrack.uri);
                }
                await spotifyApi.getArtistRelatedArtists(artistID, token).then(async res => {
                    for (var i = 0; i < 5; i++) {
                        if (res.artists[i] !== undefined) {
                            artists.push(res.artists[i].id);
                        }
                    }

                    for (let i = 0; i < Math.min(artists.length, 5); i++) {
                        await spotifyApi.getArtistTopTracks(artists[i], token).then(async res => {
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
    }
    if (relatedTracks.length !== 0 || allTracks.length !== 0) {
        let tracks = allTracks.concat(relatedTracks)
        await spotifyApi.createPlaylist(playlistName, token, username).then(async res => {
            let playListName;
            for (let i = 0; i < tracks.length; i = i + 100) {
                await spotifyApi.populatePlaylist(res.id, tracks.slice(i, i + 100), token).then(res => {
                });
            }
            spinner.succeed('Success!');
            console.log(chalk.green(`
Your playlist is ready! 
It's called "${playlistName}"`));
        });
    }

}

spinner.stop(); // like return

const cli = meow(chalk.cyan(`
    Usage
      $ singlespotify "artist_name"
      ? Enter your Spotify username <username>
      ? Enter your Spotify bearer token <bearer>

    Options
      --name [-n] "playlist name"
      --artist-id [-a] "artist id"

    Example
      $ singlespotify -a "Young Thug"
      ? Enter your Spotify username kabirvirji
      ? Enter your Spotify bearer token ************************************************************

    For more information visit https://github.com/kabirvirji/singlespotify

`), {
        alias: {
            n: 'name',
            a: 'artistId'
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
