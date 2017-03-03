"use strict";
let dotenv = require('dotenv');   //for use of our environment letiables
dotenv.load();
const urlHandler = require('./urlHandler.js');

const express = require('express');
const app = express();

const mongoose = require('mongoose');

const port =  process.env.PORT || 8888;

const dataBaseLocation = process.env.MONGOLAB_URI;
// const dataBaseLocation = `mongodb://localhost:27017/url_shortener`;

const hostUrl = 'https://rocky-reef-42703.herokuapp.com';
// const hostUrl = 'http://localhost:8888';

let favicon = require('serve-favicon');
let path = require('path');
let assert = require('mongoose-assert')(mongoose);
mongoose.connect(dataBaseLocation);


let sassMiddleware = require("node-sass-middleware");
app.use(sassMiddleware({
    src: __dirname + '/public',
    dest: '/tmp'
}));

app.use(favicon(path.join(__dirname , 'public', 'favicon.ico')));  //this eventally stopped my favicon woes

app.use(express.static('/tmp'));  //'/tmp' folder holds temporary sass file

app.get("/", function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

app.get("/new/*", function (request, response) {
    let originalUrl = request.params[0];
    // let urlObject = urlHandler('store', originalUrl);
    // response.json(urlObject);

    let urlObject = urlHandler('store', originalUrl, function(err, obj) {
        if (err) console.log('Error getting refrence ' + err);
        if (obj !== undefined) {
            console.log('object is valid, returning it to the user');
            response.json(obj);
        } else {
            console.log('object is not valid, redirecting user to index');
            response.sendFile(__dirname + '/public/index.html');
        };
    });
});

app.get("/:shortened", function (request, response) {
    console.log('request.params.shortened: ', request.params.shortened);
    let shorty = request.params.shortened;
    // let newDirection = `${urlHandler('retrieve', shorty)}`;

    let newDirection = urlHandler('retrieve', shorty, function(err, url) {
        if (err) console.log('Error getting refrence ' + err);
        if (url !== undefined) {
            console.log('refrence is valid, redirecting the user');
            response.redirect(url);
        } else {
            console.log('refrence is not valid, redirecting user to index');
            response.sendFile(__dirname + '/public/index.html');
        };
    });
});

    // listen for requests
let listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
