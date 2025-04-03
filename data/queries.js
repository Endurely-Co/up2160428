const database = require("./model");
const cache = require("./cache");

const newRace = `INSERT INTO race(name, loop_km, start_time, cutoff_time, user_id) VALUES($1, $2, $3, $4, $5)`;

const latestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const updateUserLogin = `UPDATE users SET isLoggedIn = ? WHERE email = ? AND name = ?`;

const queryForUser = `SELECT * FROM users WHERE email = ? AND name = ?`;

const queryCheckedLogIn = `SELECT isLoggedIn FROM users WHERE email = ?`;

const insertNewUser = `INSERT INTO users (name, email, isLoggedIn, user_type) VALUES (?, ?, ?, ?)
RETURNING id, name, email, isLoggedIn, user_type`;


const requestLatestRace = database.prepare(latestRace);

const createNewRace = database.prepare(newRace);

function checkLoggedIn() {
    const email = cache.getLogIn();
    console.log('new_data_email', email);
    if (email === undefined) {
        return {
            error: "User is not signed in!",
        }
    }
    const hasLoggedIn = database.prepare(queryCheckedLogIn).get(email);
    return {
        user_logged_in: hasLoggedIn,
        redirect_url: '/'
    };
}

function createNewUser(email, name, userType){
    try{
        const insert = database.prepare(insertNewUser);
        const newUser = insert.get(name, email, 'true', userType);
        console.log(newUser.id);
        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        };
    }catch(err){
        return {
            error: err.message,
        }
    }
}

function loginUser(email, name){
    const query = database.prepare(queryForUser);
    const user = query.get(email, name);
    if (user !== undefined){
        const signUserIn = database.prepare(updateUserLogin);
        signUserIn.get('true', name, email); // Update log in
        cache.setLogIn(email);
        console.log('user', cache.getLogIn());
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            isLoggedIn: user.isLoggedIn,
        }
    }
    return {
        error: "User not found",
    };
}

module.exports = {
    createNewRace, loginUser,
    requestLatestRace, createNewUser,
    checkLoggedIn
};
