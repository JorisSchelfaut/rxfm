var DEBUG = true;
var ACTIVE_USER = localStorage.getItem('user');
var SESSION_KEY = localStorage.getItem('session-' + ACTIVE_USER);
var COMMENTS    = localStorage.getObject('home_replies') || {};
var CHANNEL         = '@RXFM';
var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
var LAST_FM         = new LastFM({
    apiKey      : API_KEY,
    apiSecret   : API_SECRET,
    cache       : new LastFMCache(),
    apiUrl      : 'http://ws.audioscrobbler.com/2.0/'
});
var artist = $.url().param('artist').replace(/%20/g, ' ');
var recommendation = $.url().param('recommendation').replace(/%20/g, ' ');
var author = $.url().param('author').replace(/%20/g, ' ');
var reply_id = $.url().param('reply');
var reply_key = 'reply_' + reply_id;
COMMENTS[reply_key] = true;
// Store the key - this comment has been seen.
localStorage.setObject('home_replies', COMMENTS);

getInfo(recommendation, author, function (a1) {
    var html = '';
    var playcount = a1.stats.userplaycount;
    var url = a1.url;
    getInfo(artist, author, function (a2) {
        getTopTracks(recommendation, 5, function (tracks) {
            html += '<h2>Recommendation by ' + author + ' for ' + artist + '</h2>';
            html += '<p>';
            html += author + ' recommends <a href="' + url + '" target="_blank">'
                    + recommendation + '</a>';
            html += '</p>';
            html += '<p>';
            if (playcount) {
                if (playcount > 0) {
                    html += author + ' recommended this artist and has listened ' + playcount
                        + ((playcount > 1)?' times to ':' time to ')
                        + recommendation + '.';
                } else {
                    html += author + ' recommended this artist, but has not listened to this artist yet.';
                }
            } else {
                html += author + ' recommended this artist, but has not listened to this artist yet.';
            }
            html += '</p>';
            
            html += '<p>Top tracks for this <strong>' + recommendation + '</strong>:';
            html += '<ul>';
            tracks.forEach(function (track) {
                html += '<li>';
                html += '<a href="' + track.url + '" target="_blank" >';
                html += track.name;
                html += '</a>';
                html += '</li>';
            });
            html += '</ul>';
            html += '</p>';

            html += '<p>';
            html += 'Last.fm recommends the following artists for <strong>' + artist + '</strong>:<ul>';
            a2.similar.artist.forEach(function (a) {
                html += '<li><a href="' + a.url
                        + '" target="_blank">' + a.name + '</a>' + '</li>';
            });
            html += '</ul></p>';

            jQuery('#comment').append(html);
        });
    });
});

/**
 * Get the top tracks for the recommended artist.
 * @param   {Function} callback
 * @param   {String} artist
 * @param   {Number} limit
 * @returns {undefined}
 */
function getTopTracks (artist, limit, callback) {
    LAST_FM.artist.getTopTracks({
        artist      : artist,
        limit       : limit
    }, {
        success : function (data) {
            callback (data.toptracks.track);
        }, error  : function (error, msg) {
            jQuery('#comment').append('<p>' + msg + '</p>');
        }
    });
}

/**
 * Gets artist info.
 * @param {String} artistname
 * @param {String} username
 * @param {Function} callback
 * @returns {undefined}
 */
function getInfo (artistname, username, callback) {
    LAST_FM.artist.getInfo({
            artist      : artist,
            username    : author
        },
        {
            success : function (data) {
            callback (data.artist);
        }, error  : function (error, msg) {
            jQuery('#comment').append('<p>' + msg + '</p>');
        }
    });
}