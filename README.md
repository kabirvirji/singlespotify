# singlespotify
Create Spotify playlists based on one song or artist through the command line

## Requirements
Node 7+ (async await included)

## Usage
1. Clone repo
2. `npm install`

Create a `config.json` file that looks exactly like this: <br>
```
{
  "spotifyid": "",
  "spotifysecret": "",
  "username":"",
  "bearer":""
}
```
You can call it whatever you want but make sure it is a json file that looks like the example above <br><br>
You can get the API keys and bearer tokens here: <br>
https://developer.spotify.com/web-api/console/post-playlists/ <br>
create a new application to get API keys
https://developer.spotify.com/my-applications/#!/applications

Then clone the repo, and do
`node index.js -a "artist name" -c /path/to/config.json` <br>
`node index.js --help` For help
