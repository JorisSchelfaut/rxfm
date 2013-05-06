jQuery(document).ready(function() {
    try {
        $(function() {

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
                                shout.author = shouts[i].author;
                                if (! WALL[shout.status_id]) WALL[shout.status_id] = { replies : new Array() };
                                if (shout.author.toString() === AUTHOR.toString()) {
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

        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
});