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

LAST_FM.artist.getInfo({
    artist      : recommendation,
    username    : author
},
{
    success : function (data) {
        var html = '';
        var playcount = data.artist.stats.userplaycount;
        var url = data.artist.url;
        
        LAST_FM.artist.getInfo({
            artist      : artist,
            username    : author
        },
        {
            success : function (data) {
                html += '<h2>Recommendation by ' + author + ' for ' + artist + '</h2>';
                
                html += '<p>';
                html += author + ' recommends <a href="' + url + '" target="_blank">' + recommendation + '</a>';
                html += '</p>';
                html += '<p>';
                if (playcount) {
                    html += author + ' recommended this artist and has listened ' + playcount
                        + ((playcount > 1)?' times to ':' time to ')
                        + recommendation + '.';
                } else {
                    html += author + ' recommended this artist, but has not listened to this artist yet.'
                }
                html += '</p>';

                html += '<p>';
                html += 'Last.fm recommends the following artists for <em>' + artist + '</em>:<ul>';
                data.artist.similar.artist.forEach(function (a) {
                    html += '<li><a href="' + a.url
                            + '" target="_blank">' + a.name + '</a>' + '</li>';
                });
                html += '</ul></p>';

                jQuery('#comment').append(html);
            },
            error : function (data) {}
        });
        
        
    },
    error : function (data) {}
});