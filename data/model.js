import sqlite3 from 'sqlite3';
sqlite3.verbose();

import {fileURLToPath} from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const database = new sqlite3.Database(`${__dirname}/race.db`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

const initDatabase = `
    CREATE TABLE IF NOT EXISTS user(
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      VARCHAR(50) UNIQUE                    NOT NULL,
        name       VARCHAR(50)                           NOT NULL,
        isLoggedIn BOOLEAN                               NOT NULL,
        user_type  TEXT CHECK (user_type IN ('runner', 'volunteer', 'organiser')) NOT NULL,
        race_id CHAR(4) CHECK (length(race_id) <= 4) NULL
        );

    CREATE TABLE IF NOT EXISTS registered_race(
                                                  disqualified INTEGER NOT NULL,
                                                  user_id INTEGER PRIMARY KEY,
                                                  race_id INTEGER,
                                                  FOREIGN KEY(user_id) REFERENCES user(id),
        FOREIGN KEY(race_id) REFERENCES race(id)
        );

    CREATE TABLE IF NOT EXISTS race(
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         VARCHAR(100)  NOT NULL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        start_time   DATETIME DEFAULT CURRENT_TIMESTAMP,
        cutoff_time  INTEGER NOT NULL,
        address VARCHAR(100)  NOT NULL,
        postcode VARCHAR(15)  NOT NULL,
        city VARCHAR(100)  NOT NULL,
        email        VARCHAR(50) NOT NULL,
        race_ended   BOOLEAN DEFAULT 0,
        race_started INTEGER DEFAULT -1,
        recorded_start_time   DATETIME DEFAULT CURRENT_TIMESTAMP
        );

    

    CREATE TABLE IF NOT EXISTS race_laps(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        racer_pos INTEGER NOT NULL,
        laps_time TEXT NOT NULL,
        racer_id  INTEGER NOT NULL,
        race_id INTEGER NOT NULL,
        FOREIGN KEY(racer_id) REFERENCES user(id),
        FOREIGN KEY(race_id) REFERENCES race(id)
        );

    CREATE TABLE IF NOT EXISTS racer_position(
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude FLOAT(10, 6),
        longitude FLOAT(10, 6),
        race_position INTEGER,
        racer_id INTEGER PRIMARY KEY,
        FOREIGN KEY(racer_id) REFERENCES user(id)
        );

    CREATE TABLE IF NOT EXISTS race_record(
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        runner_position INTEGER NOT NULL,
        racer_id INTEGER PRIMARY KEY,
        laps INTEGER NOT NULL,
        FOREIGN KEY(racer_id) REFERENCES race_laps(id)
    );

    PRAGMA foreign_keys = ON; -- Support foreign key
`

database.exec(initDatabase);

export default database;
