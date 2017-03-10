# singlespotify
Create Spotify playlists based on one song or artist through the command line

## Usage

First create a `config.json` file that looks exactly like this: <br>
```
{
  "spotifyid": "",
  "spotifysecret": "",
  "username":"",
  "bearer":""
}
```
You can get the API keys and bearer tokens here: <br>
https://developer.spotify.com/web-api/console/post-playlists/
create a new application to get API keys
https://developer.spotify.com/my-applications/#!/applications

Then clone the repo, and do
`node index.js -a "artist name" -c /path/to/config`
