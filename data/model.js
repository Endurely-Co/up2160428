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
        user_type  TEXT CHECK (user_type IN ('runner', 'volunteer', 'organiser')) NOT NULL,
        race_id CHAR(4) CHECK (length(race_id) <= 4) NULL
        );

    CREATE TABLE IF NOT EXISTS registered_race(
                                                  user_id INTEGER PRIMARY KEY,
                                                  race_id INTEGER,
                                                  FOREIGN KEY(user_id) REFERENCES user(id),
        FOREIGN KEY(race_id) REFERENCES race(id)
        );

    CREATE TABLE IF NOT EXISTS race
    (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         VARCHAR(100)  NOT NULL,
        loop_km      DECIMAL(5, 2) NOT NULL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        start_time   DATETIME DEFAULT CURRENT_TIMESTAMP,
        cutoff_time  INTEGER NOT NULL,
        email        VARCHAR(50) NOT NULL,
        race_ended   BOOLEAN DEFAULT 0
--         racer_id INTEGER NULL,
--         FOREIGN KEY(racer_id) REFERENCES user(id)
        );

    CREATE TABLE IF NOT EXISTS racer_position(
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude FLOAT(10, 6),
        longitude FLOAT(10, 6),
        race_position INTEGER,
        racer_id INTEGER PRIMARY KEY,
        FOREIGN KEY(racer_id) REFERENCES user(id)
        );

    CREATE TABLE IF NOT EXISTS race_result(
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        runner_position INTEGER NOT NULL,
        racer_id INTEGER PRIMARY KEY,
        FOREIGN KEY(racer_id) REFERENCES user(id)
    );
`

database.exec(initDatabase);

export default database;
