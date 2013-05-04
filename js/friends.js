var DEBUG           = true;
var ACTIVE_USER     = 'soundsuggest';
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
        var html = '';
        if (data.friends.user) {
            if (data.friends.user[0]) {
                for (var i = 0; i < data.friends.user.length; i++) {
                    html += '<li data-theme="c"><a href="#page1" data-transition="slide">' + data.friends.user[i].name + '</a></li>';
                }
            } else {
                html += '<li data-theme="c"><a href="#page1" data-transition="slide">' + data.friends.user.name + '</a></li>';
            }
            $('#friends-list').append(html).listview('refresh');
        } else {
            if (DEBUG) console.log('You have no friends. Sorry.');
        }
    },
    error : function (data) {
        console.log(data.error + ' : ' + data.message);
    }
});