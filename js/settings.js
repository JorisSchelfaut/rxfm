var KEY = 'user';
var ACTIVE_USER = localStorage.getItem(KEY);
var SESSION_KEY = localStorage.getItem('session-' + ACTIVE_USER);

reset = function () {
    
    // Remove session;
    localStorage.removeItem('session-' + ACTIVE_USER);
    
    // Remove user;
    localStorage.removeItem(KEY);
    
    var root = window.location.toString().split('settings.html')[0];
    window.location.href = root;
};
