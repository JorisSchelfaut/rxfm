function lastFM_user_getShouts(data) {
    if (data.shouts) {
        if (data.shouts.shout) {
            if (data.shouts.shout[0]) {
                return data.shouts.shout;
            }
            return [data.shouts.shout];
        }
        return [];
    }
    return [];
};

/**
 * The list of items in common.
 * @param {type} data
 * @returns {Array}
 */
function lastFM_tasteometer_compare(data) {
    if (data.comparison.result.artists) {
        if (data.comparison.result.artists.artist) {
            if (data.comparison.result.artists.artist[0]) {
                return data.comparison.result.artists.artist;
            }
            return [data.comparison.result.artists.artist];
        }
        return [];
    }
    return [];
};