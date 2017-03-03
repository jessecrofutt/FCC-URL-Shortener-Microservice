"use strict";
const Url = require('./models/url');
const validUrl = require('valid-url');
const hostUrl = 'http://localhost:8888';
var shortUrl = hostUrl;
var populatedObject = {};

module.exports = function(method, data, callback) {
    console.log('entrydata: ', data);
    var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    var base = alphabet.length; // base is the length of the alphabet (58 in this case)
    var returnable;
    var link;
        // utility function to convert base 10 integer to base 58 string
    function encode(num){
        var encoded = '';
        while (num){
            var remainder = num % base;
            num = Math.floor(num / base);
            encoded = alphabet[remainder].toString() + encoded;
        };
        return encoded;
    };
        // utility function to convert a base 58 string to base 10 integer
    function decode(str){
        var decoded = 0;
        while (str){
            var index = alphabet.indexOf(str[0]);
            var power = str.length - 1;
            decoded += index * (Math.pow(base, power));
            str = str.substring(1);
        };
        return decoded;
    };

    function prefixValidator(prefix) {
        result = false;
        let array = prefix.split("");
        let http = array.slice(0,7).join('');
        let https = array.slice(0,8).join('');
        if (http === 'http://' || https === 'https://') {
          result = true;
        }
        return result;
    }

    if (method === 'store') {
        if(prefixValidator(data)) {       //check for http(s)://
            if(validUrl.isWebUri(data)) {   //check for other criteria
                console.log('Looks like an URI');
                Url.findOne({long_url: data}, function(err, doc) {
                    console.log('data: ', data);
                    if(doc){
                        console.log(doc._id);
                        console.log(doc);
                        // shortUrl = `${hostUrl}/${encode(doc._id)}`;
                        console.log('Url has been shortened');
                        console.log(shortUrl);
                        populatedObject = {
                                            'original url': `${data}`,
                                            'shortened url':  `${hostUrl}/${(doc._id)}`
                                          };
                        callback(null, populatedObject);
                    } else {
                        console.log('Url hasn\'t been shortened');
                        var newUrl = Url({
                            long_url: data
                        });
                        newUrl.save(
                          function(err) {
                            if (err) {
                                console.log(err);
                            };
                                console.log('saving document');
                                shortUrl = `${hostUrl}/${encode(newUrl._id)}`;
                                console.log('${hostUrl}/${encode(newUrl._id)}', `${hostUrl}/${encode(newUrl._id)}` )
                                populatedObject = {
                                                    'original url': `${data}`,
                                                    'shortened url': `${shortUrl}`
                                                  };
                                callback(null, populatedObject);
                        });
                    };
                });
            }
        } else {
          console.log('Not a URI');
          populatedObject = {
                              'Invalid Url': ``,
                              'Correct Format': 'http(s)://wwww.'
                            };
          callback(null, populatedObject);
        };
    };
    if (method === 'retrieve') {
        console.log('data: ', data);
            Url.findOne({_id: data}, function (err, doc){
                if (err) {
                  callback(err);
                };
                console.log('doc: ', doc);
                if (doc) {
                    // found an entry in the DB, redirect the user to their destination
                    link = `${doc.long_url}`;
                    callback(null, link);
                    console.log('doc.long_url: ', doc.long_url)
                    console.log('doc found');
                } else {
                    // nothing found, take 'em home
                    console.log('doc not found');
                    link = `${hostUrl}`;
                    callback(null, link);
                    console.log(link);
                };
        });
    };
};
