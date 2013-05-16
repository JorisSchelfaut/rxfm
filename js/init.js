var DEBUG = false;
/*
if (Modernizr.localstorage) {
    // good times
    console.log('Good times.');
} else {
    // bad times
    console.log('Bad times.');
}
*/
var KEY = 'user';
var ACTIVE_USER = localStorage.getItem(KEY);
if (ACTIVE_USER) {
    getSessionKeyForUser(ACTIVE_USER);
} else {
    ACTIVE_USER = window.prompt('Type a username : ', 'username');
    localStorage.setItem(KEY, ACTIVE_USER);
    getSessionKeyForUser(ACTIVE_USER);
}

getSessionKeyForUser = function (user) {
    
    var KEY_SESSION = 'session-' + user;
    var SESSION_KEY = localStorage.getItem(KEY_SESSION);
    
    if (SESSION_KEY) {
        // We're done.
    } else {
        // Get a session key!
        var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
        var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
        var LAST_FM = new LastFM({
            apiKey    : API_KEY,
            apiSecret : API_SECRET,
            cache     : new LastFMCache()
        });
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
                    localStorage.setItem(KEY_SESSION, SESSION_KEY);
                },
                error : function (data) {}
            });
        }
        
    }
    
    
};
