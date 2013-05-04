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

                LAST_FM.user.getShouts({
                    user : friends[index].name
                }, {
                    success : function(data) {
                        var html = '';
                        if (data.shouts.shout) {
                            if (data.shouts.shout[0]) {
                                for (var i = 0; i < data.shouts.shout.length; i++) {
                                    if (filter(data.shouts.shout[i], friends[index].name)) {
                                        html += '<li data-theme="c"><a href="#page1" data-transition="slide">'
                                                + body_status(data.shouts.shout[i].body)
                                                + '</a></li>';
                                    }
                                }
                            } else {
                                if (filter(data.shouts.shout, friends[index].name)) {
                                    html += '<li data-theme="c"><a href="#page1" data-transition="slide">'
                                            + body_status(data.shouts.shout.body)
                                            + '</a></li>';
                                } else {
                                    //if (DEBUG) console.log('Shout was not accepted : "' + data.shouts.shout.body + '"');
                                }
                            }
                            $('#shouts-list').append(html).listview('refresh');
                        } else {
                            if (DEBUG) console.log('You have no shouts. Sorry.');
                        }
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
             * Filters on author: must be the same as the provided author.
             * Filters on body, must contain @RXFM
             * @param {Object} shout
             * @param {String} author
             * @returns {Boolean}
             */
            filter = function (shout, author) {
                if (shout.author.toString() === author)
                    if (shout.body.indexOf(CHANNEL) !== -1) return true;
                return false;
            };

            /**
             * Generates a status from the encoded string.
             * @param {type} body
             * @returns {String}
             */
            body_status = function (body) {
                var json = eval("(" + body.replace(/@RXFM/, '') + ')');
                return 'I\'m looking for music similar to <em>' + json.artist + '</em>! ' + json.message;
            };

        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
});