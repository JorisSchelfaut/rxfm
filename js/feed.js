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
    apiUrl      : 'https://ws.audioscrobbler.com/2.0/'
});

jQuery(document).ready(function() {
    try {
        $(function() {
            load_wall();
        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
});

toggle_hide = function(status_id) {
    if (DEBUG) console.log("feed.js#toggle_hide");
    if (jQuery('#status-' + status_id).hasClass('show-replies')) {
        jQuery('#status-' + status_id).attr('data-icon', 'arrow-d');
    } else {
        jQuery('#status-' + status_id).addClass('show-replies');
        jQuery('#status-' + status_id).attr('data-icon', 'arrow-u');
    }
    jQuery('.comment-' + status_id).toggle();
};

/**
 * Loads the recent status updates from friends.
 * @returns {load_wall}
 */
load_wall = function () {
    LAST_FM.user.getFriends({
        user : ACTIVE_USER
    }, {
        success : function(data) {
            var friends = data.friends.user;
            // For each friend, fetch the latest status.
            getShouts(friends, 0);
        },
        error : function (data) {
            console.log(data.error + ' : ' + data.message);
        }
    });

    getShouts = function (friends, index) {
        if (Number(index) === Number(friends.length)) {
            return;
        }
        var AUTHOR = friends[index].name;
        LAST_FM.user.getShouts({
            user : AUTHOR
        }, {
            success : function(data) {
                var WALL = {};
                var shouts = lastFM_user_getShouts(data);
                for (var i = 0; i < shouts.length; i++) {
                    if (filter(shouts[i])) {
                        var shout = shout_json(shouts[i]);
                        if (! WALL[shout.status_id]) WALL[shout.status_id] = { replies : new Array() };
                        if (shout.author.toString() === AUTHOR.toString()) {
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
                index++;
                getShouts(friends, index);
            },
            error : function (data) {
                console.log(data.error + ' : ' + data.message);
            }
        });
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
        
        html += '<div id="' + 'status-' + status.status_id + '" class="status-update shout" '
            + ' data-role="collapsible" '
            + ' data-collapsed="true" '
            + ' data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d" '
            + ' data-iconpos="left" '
            + ' data-inset="true" '
            + '>';
        html += '<h2 title="Similar to \'' + status.artist + '\'">'
            + status.author + ' '
            +       ' : "' + status.artist + '"?'
            +   '</h2>';
        html += '<ul class="shouts-list" data-role="listview" data-theme="d" data-divider-theme="d">';
        // List divider with form
        html += '<li data-role="list-divider">'
            +       '<span>' + status.date + '</span>'
            +       show_inputform(status.status_id, status.author)
            +       '<span class="ui-li-count">' + replies.length + '</span>'
            +   '</li>'; 
        replies.forEach(function (reply) {
            html += '<li id="' + 'reply-' + reply.reply_id + '" '
                + ' class="shout status-reply comment-' + reply.status_id + '">';
            html += '<h3>' + reply.author + '</h3>';
            html += '<p>'
                + 'Suggests the following artist: '
                + '"' + reply.artist + '" '
                + '</p>';
            html += '<p class="ui-li-aside">' + reply.date + '</p>';
            html += '</a>'; // close a
            html += '</li>'; // close li
        });
        html += '   </ul>'; // close ul
        html += '</div>';   // close div
        return html;
    };
    
    show_inputform = function (status_id, recipient) {
        var html = '';
        html += '<div id="new-reply-' + status_id + '">';
        html += '    <input name="artist" placeholder="" value="" type="text" class="artist-input"/>';
        html += '    <button onclick="new_reply(\'' + status_id + '\',\'' + recipient + '\')">Reply!</button>';
        html += '</div>';
        return html;
    };
//    <ul id="new-status-artist" data-role="listview" 
//        data-inset="true" data-filter="true"
//        data-filter-placeholder="Artist name..."
//        data-filter-theme="d">
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
 * 
 * @param {type} status_id
 * @param {type} recipient
 * @returns {undefined}
 */
new_reply = function (status_id, recipient) {
    var artist = $('input[name=artist]', '#new-reply-' + status_id).val();
    if (artist.toString() !== '') {
        $('input[name=artist]', '#new-status').val('');
        var user = recipient;
        var reply_id = (artist + user + new Date().toDateString()).toString().hashCode();
        var message = CHANNEL + '{'
                + 'artist:[%22' + artist + '%22],'
                + 'message:%22%22,'
                + 'status_id:%22' + status_id + '%22,'
                + 'reply_id:%22' + reply_id + '%22'
                + '}';
        if (DEBUG) console.log(message);
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

/**
 * Shows the reply form for a given status.
 * @param {type} status_id
 * @returns {undefined}
 */
show_form = function (status_id) {
    jQuery('#new-reply-' + status_id).toggle();
};