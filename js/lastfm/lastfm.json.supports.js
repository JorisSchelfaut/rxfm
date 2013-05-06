function lastFM_user_getShouts(data) {
    var shouts = [];
    
    if (data.shouts) {
        if (data.shouts.shout) {
            if (data.shouts.shout[0]) {
                return data.shouts.shout;
            }
            return [data.shouts.shout];
        }
        return shouts;
    }
    return shouts;
};
