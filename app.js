import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import injectApi from './api/injector.js';
import injectScreen from './screens/injector.js';
import fs from 'fs';
import { fileURLToPath } from 'url';

let app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html'); // Set default engine to HTML
app.engine('html', viewEngine);


function viewEngine(filePath, options, callback){
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) return callback(err);
        return callback(null, content);
    });
}

// Inject dependencies
await injectApi(app);
await injectScreen(app);

export default app;
