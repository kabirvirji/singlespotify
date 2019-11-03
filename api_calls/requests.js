var exports = module.exports = {}
const axios = require('axios')

exports.searchArtists = function(artistName, token) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/search`,
        params: {
            q: artistName,
            type: 'artist'
        },
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }})
        .then(res => res.data)
        .catch (err => console.error(err))
}

exports.getArtistTopTracks = function(artistID, token) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/artists/${artistID}/top-tracks`,
        params: {
            country: 'US'
        },
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }})
        .then(res => res.data)
        .catch (err => console.error(err))
}

exports.getArtistRelatedArtists = function(artistID, token) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/artists/${artistID}/related-artists`,
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }})
        .then(res => res.data)
        .catch (err => console.error(err))
}