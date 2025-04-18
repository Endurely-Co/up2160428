import database from "./model.js";
import cache from "./cache.js";


const newRace = `INSERT INTO race(name, loop_km, start_time, cutoff_time, email) VALUES(?, ?, ?, ?, ?)`;

const latestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const allRaces = `SELECT * FROM race ORDER BY start_time`;

const updateUserLogin = `UPDATE user SET isLoggedIn = ? WHERE email = ?`;

const queryForUser = `SELECT * FROM user WHERE email = ?`;

const queryForUserIdByEmail = `SELECT id FROM user WHERE email = ?`;

const queryForAllUsers = `SELECT * FROM user`;

const queryCheckedLogIn = `SELECT isLoggedIn, user_type FROM user WHERE email = ?`;

const insertNewUser = `INSERT INTO user (name, email, isLoggedIn, user_type, race_id) VALUES (?, ?, ?, ?, ?)
RETURNING id, name, email, isLoggedIn, user_type, race_id`;

const queryRaceNum = `SELECT race_id FROM user ORDER BY race_id DESC LIMIT 1;`;

const insertRacerPosition = `INSERT OR REPLACE INTO racer(latitude, longitude, racer_id) VALUES (?, ?, ?);`;

const selectRacer = `SELECT * FROM racer ORDER BY latitude DESC, longitude ASC`;

const insertRaceResult = `INSERT OR REPLACE INTO race_result(runner_position, racer_id) VALUES (?, ?);`

const queryRaceResults = `SELECT * FROM race_result ORDER BY runner_position ASC;`

async function setRaceResult(){
    const racerLocation = await requestRacerPosition();
    for(let racer in racerLocation){
        const raceResult = await database.prepare(insertRaceResult);
        raceResult.get(2, racer.racer_id);
    }

    return (await database.prepare(queryRaceResults));
}

async function updateRacerPosition(latitude, longitude, racer_id) {
    const racer = await database.prepare(insertRacerPosition);
    racer.get(latitude, longitude, racer_id);
    return {
        latitude: latitude,
        longitude: longitude,
        user: racer_id,
    }
}

async function getAllUsers(){
    const users =await database.prepare(queryForAllUsers);
    return users.all();
}

async function requestRacerPosition(){
    const racer =await database.prepare(selectRacer);
    return racer.all();
}

async function requestAllRace(){
    const races = await database.prepare(allRaces);
    return races.all();
}

 async function requestLatestRace(){
    const recent = await database.prepare(latestRace);
    return recent.all().length === 0 ? [] : recent.all()[0];
}

// Normally, this thread would be lock to prevent interference
// That's yet to be covered in this course hence this
function getRaceId(racerIds){
    const charLimit = 4
    if(racerIds.length === 0){
        return '0001';
    }
    const raceIdInt = parseInt(racerIds[0]) + 1;
    const zeroCount =
        charLimit - raceIdInt.toString().length; // v = 2, 0002
    let raceId = ''
    for (let i = 0; i < zeroCount; i++) {
        raceId += '0';
    }

    return raceId + raceIdInt;
}

async function createNewRace(email, name, cutoff_time, start_time,  loop_km){
    const race = await database.prepare(newRace);
    race.get(name, loop_km, start_time, cutoff_time,  email);
    return {
        email : email,
        name : name,
        cutoff_time : cutoff_time,
        start_time : start_time,
        loop_km:loop_km
    }
}

async function checkLoggedIn() {
    const email = cache.getLogIn();
    console.log('new_data_email', email);

    if (email === null) {
        return {
            error: "User is not signed in!",
            redirect_url: '/login'
        }
    }
    const {user_type, hasLoggedIn} = await database.prepare(queryCheckedLogIn).get(email);
    return {
        user_logged_in: hasLoggedIn,
        user_type: user_type,
        redirect_url: '/'
    };
}

async function createNewUser(email, name, userType){
    try{
        const insert = await database.prepare(insertNewUser);
        const queryLastRaceNumber = await database.prepare(queryRaceNum);
        const lastRaceNumber = userType === 'runner' ?
            getRaceId(queryLastRaceNumber.all()) : null;

        const newUser = insert.get(name, email, 'true', userType, lastRaceNumber);
        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            racer_id: lastRaceNumber
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


async function getUserById(){
    const query = database.prepare(queryForUserIdByEmail);
    const user = query.get(cache.getLogIn())
    return user.id;
}

async function getUserByEmail(){
    const query = database.prepare(queryForUser);
    const user = query.get(cache.getLogIn())
    return {
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        id: user.id,
        isLoggedIn: user.isLoggedIn,
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
            user_type: user.user_type,
            isLoggedIn: user.isLoggedIn, //todo: to be changed to snake case
            racer_id: user.racer_id,
        }
    }
    return {
        error: "User not logged in",
    };
}

export default {
    createNewRace, changeUserStatus,
    requestLatestRace, createNewUser,
    checkLoggedIn, invalidateUser,
    requestAllRace, requestRacerPosition,
    updateRacerPosition, getAllUsers,
    getUserByEmail, getUserById
};
