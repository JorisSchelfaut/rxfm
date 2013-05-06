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
                    var shout = data.shouts.shout[i];
                    if (filter(shout)) {
                        if (DEBUG) console.log(shout.author.toString());
                        if (shout.author.toString() === ACTIVE_USER.toString()) {
                            html += statuslayout(shout.author.toString(), shout_json(shout));
                        } else {
                            html += commentlayout(shout.author.toString(), shout_json(shout));
                        }
                    }
                }
            } else {
                
                // ADD FILTERS
                
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
 * Filters on author: must be the same as the provided author.
 * Filters on body, must contain @RXFM
 * @param {Object} shout
 * @returns {Boolean}
 */
filter = function (shout) {
    if (shout.body.indexOf(CHANNEL) !== -1)
        return true;
    return false;
};

/**
 * Generates a status from the JSON encoded string.
 * @param {type} shout
 * @returns {eval}
 */
shout_json = function (shout) {
    return eval("(" + shout.body.replace(/@RXFM/, '') + ')');
};

/**
 * Generates a status from the JavaScript object.
 * @param {type} obj
 * @param {String} author the author of the shout
 * @returns {String}
 */
statuslayout = function (author, obj) {
    return '<li data-theme="c" id="' +  + '"><a href="#page1" data-transition="slide">'
            + 'I\'m looking for music similar to <em>' + obj.artist + '</em>! ' + obj.message;
            + '</a></li>';
};

/**
 * Generates a comment from the JavaScript object.
 * @param {type} obj
 * @param {String} author the author of the shout
 * @returns {String}
 */
commentlayout = function (author, obj) {
    return '<li data-theme="c"><a href="#page1" data-transition="slide">'
            + 'Check out <em>' + obj.artist + '</em>! ' + obj.message;
            + '</a></li>';
};