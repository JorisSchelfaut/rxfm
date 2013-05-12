var DEBUG           = true;
var ACTIVE_USER     = 'soundsuggest';
var SESSION_KEY     = '245679ce27a18ca85e038d52c2f767a4';
var CHANNEL         = '@RXFM';
var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
var LAST_FM         = new LastFM({
    apiKey      : API_KEY,
    apiSecret   : API_SECRET,
    cache       : new LastFMCache(),
    apiUrl      : 'http://ws.audioscrobbler.com/2.0/'
});

/*
$("#new-status-artist").on("listviewbeforefilter", function (e, data) {
    var $ul = $(this),
        $input = $(data.input),
        value = $input.val(),
        html = "";
    $ul.html("");
    if (value && value.length > 2) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview("refresh");

            var ARTISTS = ['Animals as Leaders', 'Daft Punk',
                'Depeche Mode', 'deus',
                'Noir Desir', 'Noisedriver','Placebo', 
                'Pendulum', 'Tool', 'Wren'];

            $.each(ARTISTS, function (i, val) {
                html += "<li>" + '<a href="">' + val + '</a>' + "</li>";
            });
            $ul.html(html);
            $ul.listview("refresh");
            $ul.trigger("updatelayout");
    }
});
*/

jQuery(document).ready(function() {
    try {
        $(function() {
            /*
            var authURL = 'http://www.last.fm/api/auth/?api_key='
                + API_KEY + '&cb=' + window.location;
            var token = '';
            if (!$.url().param('token')) {
                window.location = authURL;
            } else {
                token = $.url().param('token');
                
                LAST_FM.auth.getSession({
                    token: token
                }, {
                    success: function(data) {
                        SESSION_KEY = data.session.key;
                        load_wall();
                    },
                    error : function (data) {}
                });
            }*/
            load_wall();
        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
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
load_wall = function () {
    LAST_FM.user.getShouts({
        user : ACTIVE_USER
    }, {
        success : function(data) {
            var WALL = {};
            var shouts = lastFM_user_getShouts(data);
            for (var i = 0; i < shouts.length; i++) {
                if (filter(shouts[i])) {
                    var shout = shout_json(shouts[i]);
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
};

/**
 * Clears all shouts from the wall.
 * @returns {undefined}
 */
clear_wall = function () {
    jQuery('.shout').remove();
    return;
};

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
* @returns {JSON}
*/
shout_json = function (shout) {
    var status = shout.body.replace(/%22/g, '"');
    status = status.replace(/@RXFM/, '');
    var json = eval("(" + status + ')');
    json.author = shout.author;
    json.date = shout.date;
    return json;
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
    
    html += '<li data-theme="c" id="' + 'status-' + status.status_id + '" class="status-update shout">'
            + 'I\'m looking for music similar to <em>' + status.artist + '</em>! ' + status.message
            + '<button onclick="toggle_hide(\'' + status.status_id + '\');">Show / Hide Comments</button>'
            + '</li>';
    
    replies.forEach(function (reply) {
        html += '<li data-theme="c" id="' + 'reply-' + reply.reply_id + '" '
            + 'class="shout status-reply comment-' + reply.status_id + '"'
            + '>'
            + '<a href="comment.html?recommendation=' + reply.artist
            + '&author=' + reply.author
            + '&artist=' + status.artist
            + '" data-transition="slide" '
            + 'data-ajax="false" '
            + '>'
            + reply.author + ' says: '
            + 'Check out: <em>' + reply.artist + '</em>! ' + reply.message
            + '</a>'
            + '</li>';
    });
    return html;
};

new_status = function () {
    var artist = $('input[name=artist]', '#new-status').val();
    if (artist.toString() !== '') {
        $('input[name=artist]', '#new-status').val('');
        var user = ACTIVE_USER;
        var status_id = (artist + user + new Date().toDateString()).toString().hashCode();
        var message = CHANNEL + '{'
                + 'artist:[%22' + artist + '%22],'
                + 'message:%22%22,'
                + 'status_id:%22' + status_id + '%22,'
                + 'reply_id:undefined'
                + '}';
        console.log(message);
        LAST_FM.user.shout({ user : user, message : message }, {key : SESSION_KEY}, {
            success : function (data) {
                console.log("success.");
                refresh();
            },
            error : function (data) { console.error(data); }
        });
    }
};

String.prototype.hashCode = function(){
   var hash = 0, i, char;
   if (this.length == 0) return hash;
   for (i = 0; i < this.length; i++) {
       char = this.charCodeAt(i);
       hash = ((hash<<5)-hash)+char;
       hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
};

/**
 * <p>Refreshes the feed.</p>
 * @returns {undefined}
 */
refresh = function () {
    clear_wall();
    load_wall();
    return;
};

toggle_hide = function(status_id) {
    if (DEBUG) console.log("feed.js#toggle_hide");
    jQuery('.comment-' + status_id).toggle();
};