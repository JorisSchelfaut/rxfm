var DEBUG           = true;
var ACTIVE_USER     = 'soundsuggest';
var CHANNEL         = '@RXFM';
var API_KEY         = 'a7eec810bcefeb721b140a929b474983';
var API_SECRET      = 'ab5950262d6fb5069bc14d718d13e5f7';
var LIMIT = 5;
var LAST_FM         = new LastFM({
    apiKey      : API_KEY,
    apiSecret   : API_SECRET,
    cache       : new LastFMCache(),
    apiUrl      : 'http://ws.audioscrobbler.com/2.0/'
});

var friend = $.url().param('user').replace(/%20/g, ' ');

LAST_FM.user.getInfo({
    user    : friend
},
{
    success : function (data) {
        var html = '';
        html += '<h2>' + friend + '</h2>';
        
        LAST_FM.tasteometer.compare({
            type1   : 'user',
            type2   : 'user',
            value1  : ACTIVE_USER,
            value2  : friend,
            limit   : LIMIT
        },
        {
            success: function(response2) {
                
                function a(obj) {
                    return '<em><a href="' + obj.url
                            + '" target="_blank" title="'
                            + obj.name + '">' + obj.name + '</a></em>';
                }
                
                var score = Number(response2.comparison.result.score) * 100;

                html += '<p>The similarity score between you and <strong>'
                        + friend + '</strong>'
                        + ' equals <strong>' + score.toFixed(2)
                        + '%</strong>.</p>';
                
                html += '<p>';
                var incommon = lastFM_tasteometer_compare(response2);
                if (Number(incommon.length) !== Number(0)) {
                    if (Number(incommon.length) > Number(1)) {
                        var artists = '';
                        for (var i = 0; i < incommon.length - 2; i++) {
                            artists += a(incommon[i]) + ', ';
                        }
                        artists += a(incommon[incommon.length - 2])
                                + ' and ' + a(incommon[incommon.length - 1]);
                        html += 'Artists you have in common with <strong>'
                             + friend + '</strong> include: ' + artists;
                    } else {
                        html += 'You have one artist in common with <strong>'
                             + friend + '</strong>, namely: '
                             + a(incommon[0]) + '.';
                    }
                } else {
                    html += 'You have no artists in common with <strong>'
                         + friend + '</strong>.';
                }
                html += '</p>';
                
                jQuery('#friend').append(html);
            },
            error: function(error, msg) {
                alert(error + " " + msg);
            }
        });
    },
    error : function (data) {}
});