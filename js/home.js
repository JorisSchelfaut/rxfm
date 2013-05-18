var DEBUG = true;
var ACTIVE_USER = localStorage.getItem('user');
var SESSION_KEY = localStorage.getItem('session-' + ACTIVE_USER);
var CHANNEL         = '@RXFM';
var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
var LAST_FM         = new LastFM({
    apiKey      : API_KEY,
    apiSecret   : API_SECRET,
    cache       : new LastFMCache(),
    apiUrl      : 'http://ws.audioscrobbler.com/2.0/'
});
var $ul;
var $input;
var ARTISTS = [];

jQuery(document).ready(function() {
    try {
        $(function() {
            
            loadLibrary(function () {
                $("#new-status-artist").on("listviewbeforefilter", function (e, data) {
                    $ul = $(this);
                    $input = $(data.input);
                    var value = $input.val();
                    var html = "";
                    $ul.html("");
                    if (value && value.length > 2) {
                            $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
                            $ul.listview("refresh");
                            $.each(ARTISTS, function (i, val) {
                                html += "<li>"
                                        + '<a ' + ' href="#" '
                                        + ' data-role="button" '
                                        + ' data-icon="arrow-r" data-iconpos="right" ' 
                                        + ' data-theme="a" rel="external" '
                                        + ' onclick="complete(\'' + val
                                        + '\'); return false" '
                                        + '>' + val + '</a>' + "</li>";
                            });
                            $ul.html(html);
                            $ul.listview("refresh");
                            $ul.trigger("updatelayout");
                    }
                });
                load_wall();
            });
        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
});

function loadLibrary (callback) {
    LAST_FM.library.getArtists({
        limit : 200,
        user : ACTIVE_USER
    },{
        success : function (data) {
            data.artists.artist.forEach(function (a) {
                ARTISTS.push(a.name);
            });
            callback();
        }, error : function () {}
    });
}

/**
 * Selecting a completion suggestion.
 * @param {type} value
 * @returns {undefined}
 */
complete = function (value) {
    // Dismiss the completion suggestions list.
    $ul.html('');
    $ul.listview("refresh");
    $ul.trigger("updatelayout");
    // Set the input value to the selected suggestion.
    $input.val(value);
};

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
            
            orderKeysByTimestamp = function (keys, WALL) {
                for (var i = 0; i < keys.length; i++) {
                    for (var j = 0; j < keys.length; j++) {
                        var d1 = new Date(WALL[keys[i]].status.date);
                        var d2 = new Date(WALL[keys[j]].status.date);
                        if (d1 > d2) {
                            var tmp = keys[j];
                            keys[j] = keys[i];
                            keys[i] = tmp;
                        }
                    }
                }
                return keys;
            };
            
            var keys = [];
            for (var key in WALL) {
                keys.push(key);
            }
            keys = orderKeysByTimestamp(keys, WALL);
            var html = '';
            for (var i = 0; i < keys.length; i++) {
                html += statuslayout(WALL[keys[i]]);
            }
            $('#shouts-div').append(html).collapsibleset('refresh');
            $("#shouts-div ul").each(function(i) {
                $(this).listview(); 
            }); 
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
    var new_replies = 0;
    var COMMENTS = localStorage.getObject('home_replies') || {};
    replies.forEach(function (reply) {
        var reply_key = 'reply_' + reply.reply_id;
        if (! COMMENTS[reply_key]) new_replies++;
    });
    
    html += '<div id="' + 'status-' + status.status_id + '" class="status-update shout" '
            + ' data-role="collapsible" '
            + ' data-collapsed="true" '
            + ' data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d" '
            + ' data-iconpos="left" '
            + ' data-inset="true" '
            + '>'
            + ' <h2>'
            + 'Looking for music similar to "' + status.artist + '".';
    html += ((new_replies > 0)?('<span class="ui-li-count">' + new_replies + '</span>'):'');
    html += ' </h2>';
    html += '   <ul class="shouts-list" data-role="listview" data-theme="d" data-divider-theme="d">';
    html += '<li data-role="list-divider">' + status.date;
    html += '<span class="ui-li-count">' + replies.length + '</span>';
    html += '</li>'; 
    replies.forEach(function (reply) {
        html += '<li id="' + 'reply-' + reply.reply_id + '" '
            + ' class="shout status-reply comment-' + reply.status_id + '" '
            + '>' // end li
            + '<a '
            + ' href="comment.html?recommendation=' + reply.artist
            + '&author='   + reply.author
            + '&artist='   + status.artist
            + '&reply='    + reply.reply_id
            + '" ' // end href
            + ' data-transition="slide" '
            + ' data-ajax="false" '
            + '>' // end a
            + '<h3>' + reply.author + '</h3>'
            + '<p>'
            + 'Suggests the following artist: '
            + '"' + reply.artist + '" '
            + '</p>'
            + '<p class="ui-li-aside">' + reply.date
            + '</p>'
            + '</a>' // close a
            + '</li>'; // close li
    });
    html += '   </ul>'; // close ul
    html += '</div>';   // close div
    return html;
};

/**
 * Create a new status.
 * @returns {undefined}
 */
new_status = function () {
    //var artist = $('input[name=artist]', '#new-status').val();
    var artist = $input.val();
    if (artist.toString() !== '') {
        //$('input[name=artist]', '#new-status').val('');
        $input.val('');
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
