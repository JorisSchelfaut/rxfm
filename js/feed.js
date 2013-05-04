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
        
        // For each friend, fetch the latest status.
        
        
    },
    error : function (data) {
        console.log(data.error + ' : ' + data.message);
    }
});

getShouts = function (user) {
    LAST_FM.user.getShouts({
        user : user
    }, {
        success : function(data) {
            
        },
        error : function (data) {
            console.log(data.error + ' : ' + data.message);
        }
    });
};
