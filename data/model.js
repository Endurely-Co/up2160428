import {DatabaseSync} from "node:sqlite";
import {fileURLToPath} from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const database = new DatabaseSync(`${__dirname}/race.db`);

const initDatabase = `
    CREATE TABLE IF NOT EXISTS user
    (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      VARCHAR(50) UNIQUE                    NOT NULL,
        name       VARCHAR(50)                           NOT NULL,
        isLoggedIn BOOLEAN                               NOT NULL,
        user_type  TEXT CHECK (user_type IN ('runner', 'volunteer', 'organiser')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS race
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        VARCHAR(100)  NOT NULL,
        loop_km     DECIMAL(5, 2) NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        start_time  DATETIME DEFAULT CURRENT_TIMESTAMP,
        cutoff_time INTEGER       NOT NULL, -- Store cutoff time in minutes (or seconds, as per your requirement)
        email     VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS racer(
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude FLOAT(10, 6),
        longitude FLOAT(10, 6),
        race_position INTEGER,
        racer_id INTEGER PRIMARY KEY,
        FOREIGN KEY(racer_id) REFERENCES user(id)
        );

`

database.exec(initDatabase);

export default database;
