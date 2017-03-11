# singlespotify 🎵

> Create Spotify playlists based on one song through the command line

![](singlespotify.gif)

<!--- 
[![asciicast](https://asciinema.org/a/4k49ag6gy3bknaa6ryoubhcy5.png)](https://asciinema.org/a/4k49ag6gy3bknaa6ryoubhcy5)
-->

## Usage
`npm install -g singlespotify`

Create a `config.json` file that looks exactly like this: <br>
```
{
  "username":"",
  "bearer":""
}
```
You can get the bearer token here: https://developer.spotify.com/web-api/console/post-playlists/

```
    Usage
      $ singlespotify --artist [-a] "artist_name" --config [-c] /path/to/config.json

    Example
      $ singlespotify -a "Kanye West" -c /Users/kabirvirji/config.json

    For more information visit https://github.com/kabirvirji/singlespotify
```



