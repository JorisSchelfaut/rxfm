jQuery(document).ready(function() {
    try {
        $(function() {

            var DEBUG           = true;
            var ACTIVE_USER     = 'soundsuggest';
            var CHANNEL         = '@RXFM';
            var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
            var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
            var SESSION_KEY     = '245679ce27a18ca85e038d52c2f767a4';
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

                html += '<li data-theme="c" id="' + 'status-' + status.status_id + '" class="status-update">'
                        + '<h4>[' + status.date + ']' + status.author + ':</h4>'
                        + 'I\'m looking for music similar to <em>' + status.artist + '</em>! ' + status.message
                        + show_inputform(status.status_id, status.author)
                        + '</li>';
                
                replies.forEach(function (reply) {
                    html += '<li data-theme="c" id="' + 'reply-' + reply.reply_id + '" class="status-reply">'
                        //+ '<a href="#page1" data-transition="slide">'
                        + '<a href="comment.html?recommendation=' + reply.artist
                        + '&author=' + reply.author
                        + '&artist=' + status.artist
                        + '" data-transition="slide">'
                        + '[' + reply.date + ']' + reply.author + ' says: '
                        + 'Check out: <em>' + reply.artist + '</em>! ' + reply.message;
                        + '</a></li>';
                });

                return html;
            };
            
            show_inputform = function (status_id, recipient) {
                var html = '';
                html += '<div id="new-relply-' + status_id + '">'
                html += '    <div data-role="fieldcontain">'
                html += '        <label for="textinput1">Recommend an artist: </label>'
                html += '        <input name="artist" placeholder="" value="" type="text">'
                html += '    </div>'
                html += '    <button onclick="new_reply(\'' + status_id + '\',\'' + recipient + '\')">Post!</button>'
                html += '</div>';
                return html;
            };


            new_reply = function (status_id, recipient) {
                var artist = $('input[name=artist]', '#new-reply-' + status_id).val();
                var user = recipient;
                var reply_id = (artist + user + new Date().toDateString()).toString().hashCode();
                var message = CHANNEL + '{'
                        + 'artist:[%22' + artist + '%22],'
                        + 'message:%22%22,'
                        + 'status_id:%22' + status_id + '%22,'
                        + 'reply_id:%22' + reply_id + '%22'
                        + '}';
                console.log(message);/*
                LAST_FM.user.shout({ user : user, message : message }, {key : SESSION_KEY}, {
                    success : function (data) {
                        console.log("success.");
                    },
                    error : function (data) { console.error(data); }
                });*/
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
        });
    } catch (exception) {
        console.error("An exception occurred : " + exception);
    }
});

