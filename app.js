let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

const apiInjector = require('./api/injector');
const screenInjector = require('./screens/injector');
const fs = require("fs");

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html'); // Set default engine to HTML
app.engine('html', vieEngine);

function vieEngine(filePath, options, callback){
    const fs = require('fs');
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) return callback(err);
        return callback(null, content);
    });
}

apiInjector.inject(app);
screenInjector.inject(app);

module.exports = app;
