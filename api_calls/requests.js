var exports = module.exports = {}
const axios = require('axios')

exports.searchArtists = function (artistName, token) {
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
        }
    })
        .then(res => res.data)
}

exports.getArtistTopTracks = function (artistID, token) {
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
        }
    })
        .then(res => res.data)
}

exports.getArtistRelatedArtists = function (artistID, token) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/artists/${artistID}/related-artists`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(res => res.data)
}

exports.createPlaylist = function (name, token, username) {
    console.log(username);
    return axios({
        method: 'POST',
        url: `https://api.spotify.com/v1/users/${username}/playlists`,
        data: {
            "name": name,
            "description": "Playlist generated using singlespotify by Kabir Virji",
            "public": true
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(res => res.data)
}

exports.populatePlaylist = function (id, tracks, token) {
    return axios({
        method: 'POST',
        url: `https://api.spotify.com/v1/playlists/${id}/tracks`,
        data: {
            "uris": tracks
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(res => res.data)
}

exports.getArtistsAlbums = function (albumId, token, limit, offset) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/artists/${albumId}/albums`,
        params: {
            "id": albumId,
            "limit": limit,
            "offset": offset,
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(res => {
           return res.data})
}
exports.getAlbumTracks = function (albumId, token, limit, offset = 0) {
    return axios({
        method: 'GET',
        url: `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        params: {
            "limit": limit,
            "offset": offset,
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(res => {
           return res.data})
}
