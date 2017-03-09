const config = require('./config.json');
const SpotifyWebApi = require('spotify-web-api-node');
var scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'my-awesome-app-login://callback',
    clientId = config.spotifyid,
    state = 'playlist-modify-public';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : clientId
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);


var credentials = {
  clientId : config.spotifyid,
  clientSecret : config.spotifysecret,
  redirectUri : 'my-awesome-app-login://callback'
};

var spotifyApi = new SpotifyWebApi(credentials);

// The code that's returned as a query parameter to the redirect URI
var code = '';

// Retrieve an access token and a refresh token
spotifyApi.authorizationCodeGrant(code)
  .then(function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
  }, function(err) {
    console.log('Something went wrong!', err);
  });