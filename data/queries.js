const database = require("./model");
const cache = require("./cache");

const newRace = `INSERT INTO race(name, loop_km, start_time, cutoff_time, user_id) VALUES($1, $2, $3, $4, $5)`;

const latestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const updateUserLogin = `UPDATE users SET isLoggedIn = ? WHERE email = ?`;

const queryForUser = `SELECT * FROM users WHERE email = ?`;

const queryCheckedLogIn = `SELECT isLoggedIn FROM users WHERE email = ?`;

const insertNewUser = `INSERT INTO users (name, email, isLoggedIn, user_type) VALUES (?, ?, ?, ?)
RETURNING id, name, email, isLoggedIn, user_type`;


const requestLatestRace = database.prepare(latestRace);

const createNewRace = database.prepare(newRace);

async function checkLoggedIn() {
    const email = cache.getLogIn();
    console.log('new_data_email', email);

    if (email === null) {
        return {
            error: {
               error: "User is not signed in!"
            }
        }
    }
    const hasLoggedIn = await database.prepare(queryCheckedLogIn).get(email);
    return {
        user_logged_in: hasLoggedIn,
        redirect_url: '/'
    };
}

async function createNewUser(email, name, userType){
    try{
        const insert = await database.prepare(insertNewUser);
        const newUser = insert.get(name, email, 'true', userType);
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

async function invalidateUser() {
    const email = cache.getLogIn();
    cache.clear();
    await changeUserStatus(email, false);
    return {
        message: 'User has been logged out'
    };
}

async function changeUserStatus(email, isLoggedIn = true){
    const query = database.prepare(queryForUser);
    const user = isLoggedIn ? query.get(email) : undefined;
    console.log('new_data_email1', user, email, isLoggedIn);
    if (user !== undefined){
        const signUserIn = await database.prepare(updateUserLogin);
        signUserIn.get(isLoggedIn.toString(), email); // Update log in
        cache.setLogIn(email);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            isLoggedIn: user.isLoggedIn,
        }
    }
    return {
        error: "User not logged in",
    };
}

module.exports = {
    createNewRace, changeUserStatus,
    requestLatestRace, createNewUser,
    checkLoggedIn, invalidateUser
};
