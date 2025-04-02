const {DatabaseSync} = require("node:sqlite");

const database = new DatabaseSync(`${__dirname}/race.db`);

const initDatabase = `

    CREATE TABLE IF NOT EXISTS users
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
        user_id     INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
`

database.exec(initDatabase);

module.exports = database;
