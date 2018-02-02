var request = require('request');
var facebookConfig = require('../config/facebook')
var PRERENDER_URL = 'http://127.0.0.1:2999/';
var WRITECRAFT_URL = 'http://127.0.0.1:3001/';
var WRITECRAFT_OUTSIDE_URL = 'https://writecraft.io/';
if(process.env.WC_PRODUCTION == "true"){
    WRITECRAFT_URL = 'http://127.0.0.1:3000/';
}

module.exports = {
    cache: cache,
    refreshCache: refreshCache
};

function cache(url, callback){
    setTimeout(() => {
        sendRequest(url);
    });
}

function refreshCache(url, callback){
    setTimeout(() => {
            sendRequest(url + '?refresh_cache_ASENGOTIN', function(){
                //refresh FB cache
                request.post({url: `https://graph.facebook.com/?access_token=${facebookConfig.AppID}|${facebookConfig.AppSecret}`, form: {
                    id: WRITECRAFT_OUTSIDE_URL + url,
                    scrape: true
                }}, function(err, httpResp, body){
                    //FUCK YEAH FACEBOOK SCRAPER FIXED
                });
            });
    });
}

function sendRequest(url, callback){
    try {
        request(PRERENDER_URL + WRITECRAFT_URL + url, callback);
    } catch(e) {
        console.log(e);
    }
}