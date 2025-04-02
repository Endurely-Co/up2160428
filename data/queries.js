const database = require("./model");

const newRace = "INSERT INTO race(name, loop_km, start_time, cutoff_time, user_id) VALUES($1, $2, $3, $4, $5)";

const latestRace = "SELECT * FROM race ORDER BY start_time DESC LIMIT 1";

const updateUserLogin = 'UPDATE users SET isloggedin = $3 WHERE email = $1 AND name = $2';

const queryForUser = 'SELECT * FROM users WHERE email = $1 AND name = $2';

const insertNewUser = 'INSERT INTO users (name, email, isloggedin) VALUES ($1, $2, $3)';

const createNewUser = database.prepare(insertNewUser);

const loginUser = database.prepare(queryForUser);

const updateUserLoginStatus = database.prepare(updateUserLogin);

const requestLatestRace = database.prepare(latestRace);

const createNewRace = database.prepare(newRace);

module.exports = {
    createNewRace, loginUser, updateUserLoginStatus,
    requestLatestRace, createNewUser
};
