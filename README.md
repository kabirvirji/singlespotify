# singlespotify 🎵

> Create Spotify playlists based on one song through the command line

![](https://img.shields.io/badge/node-7.7.1-brightgreen.svg)

![](singlespotify.gif)

<!--- 
[![asciicast](https://asciinema.org/a/4k49ag6gy3bknaa6ryoubhcy5.png)](https://asciinema.org/a/4k49ag6gy3bknaa6ryoubhcy5)
-->

## Install
<bold>Note:</bold> Node version 7.7.1+ required. It can be downloaded [here](https://nodejs.org/dist/v7.7.1/)
`npm install -g singlespotify`

## Usage
`$ singlespotify --artist [-a] "artist_name" --config [-c] /path/to/config.json`

Create a `config.json` file that looks exactly like this: <br>
```
{
  "username":"",
  "bearer":""
}
```
You can get the bearer token here: https://developer.spotify.com/web-api/console/post-playlists/

`singlespotify --help`

```
    Usage
      $ singlespotify --artist [-a] "artist_name" --config [-c] /path/to/config.json

    Example
      $ singlespotify -a "Kanye West" -c /Users/kabirvirji/config.json

    For more information visit https://github.com/kabirvirji/singlespotify
```
Shoutout to [kshvmdn](https://github.com/kshmdn) for all the help!


