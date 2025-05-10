import database from "./model.js";


const newRace = `INSERT INTO race(name, start_time, cutoff_time, email, race_started) VALUES(?, ?, ?, ?, ?)`;

// race_started is used for start and pause race
// race_started True means the race is still running False is the race has been paused.
const updateRaceStart = `UPDATE race SET race_started = ?, start_time = ? WHERE id = ?`;

const updateRaceEnd = `UPDATE race SET race_started = ?, cutoff_time = ? WHERE id = ?`;

const queryRaceStatus = `SELECT race_started, start_time FROM race ORDER BY start_time DESC LIMIT 1`;

const latestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const allRaces = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const queryStartTime = `SELECT start_time, race_started FROM race ORDER BY start_time`;

const queryRaceId = `SELECT id FROM race ORDER BY start_time DESC LIMIT 1`;

const updateUserLogin = `UPDATE user SET isLoggedIn = ? WHERE email = ?`;

const registerUser = `INSERT INTO registered_race(user_id, race_id, disqualified) VALUES(?, ?, ?)`;

const updateDisqualifyUser = `UPDATE registered_race SET disqualified = ? WHERE race_id = ?`;

const queryDisqualifiedUserByRacer = `SELECT disqualified FROM registered_race WHERE race_id = ?`;

const queryDisqualifiedUsers = `SELECT disqualified, race_id FROM registered_race`;

const queryRegisteredRaces = `SELECT * FROM registered_race`;

const queryUserRaceRegistered = `SELECT * FROM registered_race WHERE user_id = ?`;

const queryRegisteredRaceById = `SELECT * FROM registered_race WHERE user_id = ?`
// const updateUserRace = `UPDATE race SET racer_id = ? WHERE id = ?`;

const queryForUser = `SELECT * FROM user WHERE email = ?`;

const queryForUserIdByEmail = `SELECT id FROM user WHERE email = ?`;

const queryForAllUsers = `SELECT * FROM user`;

const queryForOnlyRacers = `SELECT * FROM user WHERE user_type = 'runner' ORDER BY race_id ASC`;

const queryForUserById = `SELECT * FROM user WHERE id = ?`;

const queryCheckedLogIn = `SELECT isLoggedIn, user_type FROM user WHERE email = ?`;

const insertNewUser = `INSERT INTO user (name, email, isLoggedIn, user_type, race_id) VALUES (?, ?, ?, ?, ?)
RETURNING id, name, email, isLoggedIn, user_type, race_id`;

const queryRacerId = `SELECT race_id FROM race WHERE email = ?`;

const queryRacerById = `SELECT race_id, name FROM user WHERE race_id LIKE ?`;

const queryRaceNum = `SELECT race_id FROM user WHERE race_id IS NOT NULL ORDER BY race_id DESC LIMIT 1`;

const insertRacerPosition = `INSERT OR REPLACE INTO racer_position(latitude, longitude, racer_id) VALUES (?, ?, ?);`;

const selectAllRacePosition = `SELECT * FROM racer_position`;

const selectRacer = `SELECT * FROM racer_position ORDER BY latitude DESC, longitude DESC`;

const insertRaceResult = `INSERT OR REPLACE INTO race_record(runner_position, racer_id) VALUES (?, ?);`

const queryRaceResults = `SELECT * FROM race_record ORDER BY runner_position ASC;`

const insertNewLaps = `INSERT OR REPLACE INTO race_laps(racer_pos, laps_time, racer_id, race_id) VALUES (?, ?, ?, ?);`

const queryNewLaps = `SELECT * FROM race_laps`;

const queryUserType = `SELECT user_type FROM user WHERE email = ?`;


async function setRaceResult(){
    const racerLocation = await requestRacerPosition();
    for(let racer in racerLocation){
        const raceResult = await database.prepare(insertRaceResult);
        raceResult.get(2, racer.racer_id);
    }

    return (await database.prepare(queryRaceResults));
}

async function searchRacerById(query){
    const queryRacer = await database.prepare(queryRacerById);
    const searchedRacer = await queryRacer.all(`%${query}`);

    return searchedRacer;
}


async function getRacerId(email){
    const racerNumber = await database.prepare(queryRacerId);
    return racerNumber.get(email);
}


async function hasRegisteredForRace(email){
    const registerRace = await database.prepare(queryUserRaceRegistered);
    const userId = await getUserIdByEmail(email);
    console.log('registerRace', registerRace.get(userId));
    return registerRace.get(userId) !== undefined;
}

async function recordLaps(racerPos, raceTime, racerId, raceId){
    const newLaps = await database.prepare(insertNewLaps);
    newLaps.run(racerPos, raceTime, racerId, raceId);
    return {
        message: 'Laps record added successfully.',
    }
}

async function getNewLaps(){
    const newLaps = await database.prepare(queryNewLaps);
    return newLaps.all();
}

async function getRacers(){
    const racers = await database.prepare(queryForOnlyRacers);
    return racers.all();
}


// TODO: Refactor later on
async function updateStartRace(startTime, started){
    try {
        const raceById = await database.prepare(queryRaceId);
        const updateRace = await database.prepare(updateRaceStart);
        updateRace.run(started ? 1 : 0, isoToSQLiteDatetime(startTime), raceById.all()[0].id);
        return {
            message: 'Race started'
        };
    }catch (err) {
        return {
            error: err.message
        }
    }
}

async function getRaceStartTime(){
    //database.prepare(`DELETE FROM race WHERE start_time != null`);
    const startTime = await database.prepare(queryStartTime);
    console.log('race_started_race_started', startTime.all());
    const startTimes = startTime.all();

    if (startTimes.length ===0){
        return {start_time: null, end_time: null};
    }
    return {
        start_time: startTimes[0].start_time,
        race_started: startTimes[0].race_started
    }
}


function isoToSQLiteDatetime(dateTime) {
    const date = new Date('2025-05-01T19:06:52.885Z');
    date.setTime(dateTime);
    const pad = (n) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function updateEndRace(endTime){
    try {
        const raceById = await database.prepare(queryRaceId);
        const updateRace = await database.prepare(updateRaceEnd);
        // reset the start race '1970-01-01 01:00:00'
        updateRace.run(0, isoToSQLiteDatetime(endTime), raceById.all()[0].id);
        return {
            message: 'Race ended'
        };
    }catch (err) {
        return {
            error: err.message
        }
    }
}

async function getRegisteredRaces(){
    const registeredRaces = database.prepare(queryRegisteredRaces);
    const rRace =registeredRaces.all();
    return rRace;
}

async function getRegisteredRaceById(email){
    const registeredRaces = database.prepare(queryRegisteredRaceById);
    const curUId = await getUserIdByEmail(email);
    //const registeredRace = registeredRaces.get(curUId);
    return registeredRaces.get(curUId);
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

async function getAllRacePosition(){
    const allRacePosition = await database.prepare(selectAllRacePosition);
    return allRacePosition.all();
}


async function getRaceStatus(){
    const raceStatusQuery = await database.prepare(queryRaceStatus);
    const raceStatusQueries =  raceStatusQuery.all();
    if(raceStatusQueries.length === 0){
        return -1;
    }
    const raceStatus = raceStatusQueries[0];
    console.log('raceStatus', raceStatus.race_started, raceStatus.start_time);
    return raceStatus.race_started;
}

async function requestAllRacers() {
    const disqualifiedRacers = await database.prepare(queryDisqualifiedUsers);
    const disqualified = disqualifiedRacers.all();
    const racerQuery = await database.prepare(queryRegisteredRaces);

    const racersData = await Promise.all(racerQuery.all().map(async (racer) => {
        const userById = await database.prepare(queryForUserById);
        return userById.get(racer.user_id);
    }));
    const racers = [];
    /*
    racers.push({
            id: racer.id,
            name: racer.name,
            email: racer.email,
            isLoggedIn: racer.isLoggedIn,
            user_type: racer.user_type,
            race_id: racer.race_id,
            disqualified:
        });
     */

    console.log('racersData_racersData', racersData);
    for(let i =0; i < racersData.length ; i++){
        const racer = racersData[i];
        racers.push({
            id: racer.id,
            name: racer.name,
            email: racer.email,
            isLoggedIn: racer.isLoggedIn,
            user_type: racer.user_type,
            race_id: racer.race_id,
            disqualified: disqualified[i].disqualified
        });
    }
    return {
        racers: racers
    };
}

// @deprecated
async function requestRacerPosition(){
    const racer = await database.prepare(selectRacer);
    const userById = await database.prepare(queryForUserById);
    console.log('makeRacerPosition', racer.all(), userById);
    const result = racer.all().map(racerVal =>{
        //racerVal.id
        return makeRacerPosition(racerVal, userById.get(racerVal.racer_id));
    });
    return {
        data: result
    };
}

function makeRacerPosition(racer, user){
    return {
        runner_id: user.race_id,
        name: user.name,
        long: racer.longitude,
        lat: racer.latitude,
    };
}

async function requestAllRace(){
    const races = await database.prepare(allRaces);
    return races.all();
}

 async function requestLatestRace(){
    const recent = await database.prepare(latestRace);
     //const user = await database.prepare(queryRacerId);
    return recent.all().length === 0 ? [] : [recent.all()[0]];
}

// Normally, this thread would be lock to prevent interference
// That's yet to be covered in this course hence this
function getRaceId(racerIds){
    const charLimit = 4
    if(racerIds.length === 0){
        return '0001';
    }
    const raceIdInt = parseInt(racerIds[0].race_id) + 1;
    const zeroCount =
        charLimit - raceIdInt.toString().length; // v = 2, 0002
    let raceId = ''
    for (let i = 0; i < zeroCount; i++) {
        raceId += '0';
    }

    return `${raceId}${raceIdInt}`;
}

async function disqualifyRunner(status, racerId){
    // 0: disqualified
    // 1: not disqualified
    console.log('registerRace--', status, racerId);
    const registerRace = database.prepare(updateDisqualifyUser);
    registerRace.run(status, racerId);
    return {
        message: `${racerId} has been successfully disqualified`,
    }
}

async function getDisqualifiedRacers(){
    const disqualifiedRacers = await database.prepare(queryDisqualifiedUsers);
    return disqualifiedRacers.all();
}

async function registerRace(email){
    const race = await requestLatestRace();
    const queryUser = database.prepare(queryForUserIdByEmail)
    const user = queryUser.get(email);
    const registerRace = database.prepare(registerUser);
    // 0: disqualified
    // 1: not disqualified
    registerRace.get(user.id, race[0].id, 0); //race_id
    return {
        message: 'Race was registered'
    }
}

async function createNewRace(email, name, cutoff_time, start_time){
    const race = await database.prepare(newRace);
    race.get(name, start_time, cutoff_time,  email);
    return {
        email : email,
        name : name,
        cutoff_time : cutoff_time,
        start_time : start_time,
    }
}

async function checkLoggedIn(email) {
    //const email = cache.getLogIn();
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

        const newUser = insert.get(name, email, 'false', userType, lastRaceNumber);
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

async function invalidateUser(email) {
   // const email = cache.getLogIn();
    //cache.clear();
    await changeUserStatus(email, false);
    return {
        message: 'User has been logged out'
    };
}



async function getUserType(email){
    const query = database.prepare(queryUserType);
    const userByEmails = query.get(email);
    return userByEmails[0];
}


async function getUserIdByEmail(email){
    const query = database.prepare(queryForUserIdByEmail);
    const user = query.get(email)
    return user.id;
}

async function getUserByEmail(email){
    const query = await database.prepare(queryForUser);
    const user = query.get(email);
    return {
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        id: user.id,
        isLoggedIn: user.isLoggedIn,
    };
} // file:///Users/admin/WebstormProjects/new_webprog/data/queries.js:200:20

async function changeUserStatus(email, isLoggedIn = true){
    const query = database.prepare(queryForUser);
    const user = isLoggedIn ? query.get(email) : undefined;
    console.log('new_data_email1', user, email, isLoggedIn);
    if (user !== undefined){
        const signUserIn = await database.prepare(updateUserLogin);
        signUserIn.get(isLoggedIn.toString(), email); // Update log in
        //cache.setLogIn(email);
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
    getUserByEmail, getUserById: getUserIdByEmail, registerRace,
    getRegisteredRaces, getRegisteredRaceById,
    getAllRacePosition, updateStartRace,
    getRacers, requestAllRacers, updateEndRace,
    getNewLaps, getRaceStartTime,
    getRaceStatus, hasRegisteredForRace,
    searchRacerById, recordLaps,
    disqualifyRunner, getDisqualifiedRacers
};
