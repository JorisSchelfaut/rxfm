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

/**
 * The result of the Last.fm API call looks as follows :
 * <pre>
 * <shouts user="rj" total="495">
 *   <shout>
 *       <body>Blah</body>
 *       <author>joanofarctan</author>
 *       <date>Fri, 12 Dec 2008 13:20:41</date>
 *   </shout>
 *  ...
 * </shouts>
 * </pre>
 * 
 * The structure of the shouts is as follows :
 * <pre>
 * {
 *      artist      : "artist name",
 *      status_id   : "status_id",
 *      message     : "some message",
 *      reply_id    : "reply_id"
 * }
 * </pre>
 * 
 * For replies, the status_id attribute will be used to connect to a specific
 * status by a user.
 * 
 * The WALL datastructure has the following structure:
 * <pre>
 * {
 *      status  : { status object... },
 *      replies : [ a list of reply objects... ]
 * }
 * </pre>
 */
LAST_FM.user.getShouts({
    user : ACTIVE_USER
}, {
    success : function(data) {
        var WALL = {};
        var shouts = lastFM_user_getShouts(data);
        for (var i = 0; i < shouts.length; i++) {
            if (filter(shouts[i])) {
                var shout = shout_json(shouts[i]);
                shout.author = shouts[i].author;
                if (! WALL[shout.status_id]) WALL[shout.status_id] = { replies : new Array() };
                if (shout.author.toString() === ACTIVE_USER.toString()) {
                    WALL[shout.status_id].status = shout;
                } else {
                    WALL[shout.status_id].replies.push(shout);
                }
            }
        }
        var html = '';
        for (var key in WALL) {
            html += statuslayout(WALL[key]);
        }
        $('#shouts-list').append(html).listview('refresh');
    },
    error : function (data) {
        console.log(data.error + ' : ' + data.message);
    }
});

/**
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
 * @returns {String}
 */
statuslayout = function (obj) {
    var html = '';
    var status = obj.status;
    var replies = obj.replies;
    
    html += '<li data-theme="c" id="' + 'status-' + status.status_id + '">' +
            + '<a href="#page1" data-transition="slide">'
            + 'I\'m looking for music similar to <em>' + status.artist + '</em>! ' + status.message;
            + '</a></li>';
    
    replies.forEach(function (reply) {
        html += '<li data-theme="c" id="' + 'reply-' + reply.reply_id + '">'
            + '<a href="#page1" data-transition="slide">'
            + reply.author + ' says: '
            + 'Check out: <em>' + reply.artist + '</em>! ' + reply.message;
            + '</a></li>';
    });
    
    return html;
};
