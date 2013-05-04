var DEBUG           = true;
var ACTIVE_USER     = 'soundsuggest';
var CHANNEL         = '@RXFM';
var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
var LAST_FM         = new LastFM({
    apiKey      : API_KEY,
    apiSecret   : API_SECRET,
    cache       : new LastFMCache(),
    apiUrl      : 'https://ws.audioscrobbler.com/2.0/'
});

/*
 * <shouts user="rj" total="495">
 *   <shout>
 *       <body>Blah</body>
 *       <author>joanofarctan</author>
 *       <date>Fri, 12 Dec 2008 13:20:41</date>
 *   </shout>
 *  ...
 * </shouts>
 */
LAST_FM.user.getShouts({
    user : ACTIVE_USER
}, {
    success : function(data) {
        var html = '';
        if (data.shouts.shout) {
            if (data.shouts.shout[0]) {
                for (var i = 0; i < data.shouts.shout.length; i++) {
                    if (filter(data.shouts.shout[i])) {
                        html += '<li data-theme="c"><a href="#page1" data-transition="slide">'
                                + body_status(data.shouts.shout[i].body)
                                + '</a></li>';
                    }
                }
            } else {
                html += '<li data-theme="c"><a href="#page1" data-transition="slide">' + data.shouts.shout.body + '</a></li>';
            }
            $('#shouts-list').append(html).listview('refresh');
        } else {
            if (DEBUG) console.log('You have no shouts. Sorry.');
        }
    },
    error : function (data) {
        console.log(data.error + ' : ' + data.message);
    }
});

/**
 * Filters on author: must be the same as the active user.
 * Filters on body, must contain @RXFM
 * @param {type} shout
 * @returns {Boolean}
 */
filter = function (shout) {
    if (shout.author.toString() === ACTIVE_USER.toString())
        if (shout.body.indexOf(CHANNEL) !== -1) return true;
    return false;
};

body_status = function (body) {
    var json = eval("(" + body.replace(/@RXFM/, '') + ')');
    return 'I\'m looking for music similar to <em>' + json.artist + '</em>! ' + json.message;
};

