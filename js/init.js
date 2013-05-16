var DEBUG = false;

// Verifying if there are stored settings.
var hasStoredSettings = localStorage.getItem('user');
if (DEBUG) console.log('ACTIVE_USER == ' + ACTIVE_USER);

if (hasStoredSettings) {
    // We're done.
    if (DEBUG) {
        var ACTIVE_USER = localStorage.getItem(KEY);
        var SESSION_KEY = localStorage.getItem('session-' + ACTIVE_USER);
        console.log('ACTIVE_USER == ' + ACTIVE_USER);
        console.log('SESSION_KEY == ' + SESSION_KEY);
    }
} else {
    // Get a session key!
    var API_KEY = 'a7eec810bcefeb721b140a929b474983';
    var API_SECRET = 'ab5950262d6fb5069bc14d718d13e5f7';
    var LAST_FM = new LastFM({
        apiKey    : API_KEY,
        apiSecret : API_SECRET,
        cache     : new LastFMCache()
    });
    var authURL = 'http://www.last.fm/api/auth/?api_key=' + API_KEY + '&cb=' + window.location.href;
    if (!$.url().param('token')) {
        window.location.href = authURL;
    } else {
        LAST_FM.auth.getSession({
            token: $.url().param('token')
        }, {
            success: function(data) {
                SESSION_KEY = data.session.key;
                ACTIVE_USER = data.session.name;
                if (DEBUG) {
                    console.log('ACTIVE_USER == ' + ACTIVE_USER);
                    console.log('SESSION_KEY == ' + SESSION_KEY);
                }
                localStorage.setItem('user', ACTIVE_USER);
                localStorage.setItem('session-' + ACTIVE_USER, SESSION_KEY);
            },
            error : function (data) {
                console.error('Error occurred when getting a Last.fm session.');
            }
        });
    }
}