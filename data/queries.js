import database from "./model.js";


// Turn on foreign keys (run once on startup)
database.run(`PRAGMA foreign_keys = ON;`);

// Queries

const queryLatestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const newRace = `INSERT INTO race(name, start_time, cutoff_time, email, address, postcode, city) VALUES (?, ?, ?, ?, ?, ?, ?)`;

const updateRaceStart = `UPDATE race SET race_started = ?, recorded_start_time = ? WHERE id = ?`;

const updateRaceEnd = `UPDATE race SET race_started = ?, cutoff_time = ? WHERE id = ?`;

const queryRaceStatus = `SELECT race_started, start_time FROM race ORDER BY start_time DESC LIMIT 1`;

const latestRace = `SELECT * FROM race ORDER BY start_time DESC LIMIT 1`;

const queryStartTime = `SELECT recorded_start_time, race_started FROM race ORDER BY start_time LIMIT 1`;

const queryRaceId = `SELECT id FROM race ORDER BY start_time DESC LIMIT 1`;

const queryRaces = `SELECT * FROM race`;

const updateUserLogin = `UPDATE user SET isLoggedIn = ? WHERE email = ?`;

const registerUser = `INSERT INTO registered_race(user_id, race_id, disqualified) VALUES(?, ?, ?)`;

const updateDisqualifyUser = `UPDATE registered_race SET disqualified = ? WHERE user_id = ?`;

const queryDisqualifiedUserByRacer = `SELECT disqualified FROM registered_race WHERE race_id = ?`;

const queryDisqualifiedUsers = `SELECT disqualified, race_id, user_id FROM registered_race`;

const queryRegisteredRaces = `SELECT * FROM registered_race`;

const queryUserRaceRegistered = `SELECT * FROM registered_race WHERE user_id = ?`;

const queryUserForDisqualified = `SELECT disqualified FROM registered_race WHERE user_id = ?`;

const queryRegisteredRaceById = `SELECT * FROM registered_race WHERE user_id = ? AND race_id = ?`;

const queryForUser = `SELECT * FROM user WHERE email = ?`;

const queryForUserIdByEmail = `SELECT id, user_type FROM user WHERE email = ?`;

const updateUserRaceId = `UPDATE user SET race_id = ? WHERE email = ?`;

const queryForAllUsers = `SELECT * FROM user`;

const queryForOnlyRacers = `SELECT * FROM user WHERE user_type = 'runner' ORDER BY race_id ASC`;

const queryForUserById = `SELECT * FROM user WHERE id = ?`;

const queryCheckedLogIn = `SELECT isLoggedIn, user_type, race_id FROM user WHERE email = ?`;

const insertNewUser = `INSERT INTO user (name, email, isLoggedIn, user_type, race_id) VALUES (?, ?, ?, ?, ?)`;

const queryRacerId = `SELECT race_id FROM race WHERE email = ?`;

const queryRacerById = `SELECT race_id, name FROM user WHERE race_id LIKE ?`;

const queryRacerByRaceId = `SELECT * FROM user WHERE race_id = ?`;

const queryRaceNum = `SELECT race_id FROM user WHERE race_id IS NOT NULL ORDER BY race_id DESC LIMIT 1`;

const insertRacerPosition = `INSERT OR REPLACE INTO racer_position(latitude, longitude, racer_id) VALUES (?, ?, ?);`;

const selectAllRacePosition = `SELECT * FROM racer_position`;

const selectRacer = `SELECT * FROM racer_position ORDER BY latitude DESC, longitude DESC`;

const insertRaceResult = `INSERT OR REPLACE INTO race_record(runner_position, racer_id) VALUES (?, ?);`;

const queryRaceResults = `SELECT * FROM race_record ORDER BY runner_position ASC;`;

const insertNewLaps = `INSERT OR REPLACE INTO race_laps(racer_pos, laps_time, racer_id, race_id) VALUES (?, ?, ?, ?);`;

const queryNewLaps = `SELECT * FROM race_laps`;

const queryUserType = `SELECT user_type FROM user WHERE email = ?`;

const deleteRaceById = `DELETE FROM race WHERE user_id = ?`;


function isoToSQLiteDatetime(dateTime) {
    const date = new Date(dateTime);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}


async function checkRacerStatus(email) {
    const user = await getAsync(queryForUserIdByEmail, [email]);
    if (!user) return null;
    const disqualified = await getAsync(queryUserForDisqualified, [user.id]);
    return disqualified;
}

async function getRaces() {
    return allAsync(queryRaces);
}

async function searchRacerById(query) {
    return allAsync(queryRacerById, [`%${query}%`]);
}

async function getRacerId(email) {
    return getAsync(queryRacerId, [email]);
}

async function hasRegisteredForRace(email) {
    const user = await getAsync(queryForUserIdByEmail, [email]);
    if (!user) return false;
    const reg = await getAsync(queryUserRaceRegistered, [user.id]);
    return !!reg;
}

async function recordRace(racerPos, raceTime, racerId, raceId) {
    await runAsync(insertNewLaps, [racerPos, raceTime, racerId, raceId]);
    return { message: 'Race record added successfully.' };
}

async function getRaceRecords() {
    return allAsync(queryNewLaps);
}

async function getRacers() {
    return allAsync(queryForOnlyRacers);
}

async function updateStartRace(startTime, started) {
    try {
        const race = await getAsync(queryRaceId);
        if (!race) throw new Error('No race found');
        await runAsync(updateRaceStart, [started ? 1 : 0, isoToSQLiteDatetime(startTime), race.id]);
        return { message: 'Race started' };
    } catch (err) {
        return { error: err.message };
    }
}

async function updateEndRace(endTime) {
    try {
        const race = await getAsync(queryRaceId);
        if (!race) throw new Error('No race found');
        await runAsync(updateRaceEnd, [0, isoToSQLiteDatetime(endTime), race.id]);
        return { message: 'Race ended' };
    } catch (err) {
        return { error: err.message };
    }
}

async function createNewRace(email, name, cutoff_time, start_time, address, postcode, city) {
    await runAsync(newRace, [name, start_time, cutoff_time, email, address, postcode, city]);
    return { email, name, cutoff_time, start_time, address, postcode, city };
}

async function createNewUser(email, name, userType) {
    try {
        const result = await runAsync(insertNewUser, [name, email, 'false', userType, null]);
        // To get inserted row id or data, you'd run a SELECT afterwards or use this.lastID
        return { id: result.lastID, name, email, racer_id: null };
    } catch (err) {
        return { error: err.message };
    }
}

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

async function getUserIdByEmail(email) {
    const user = await getAsync(queryForUserIdByEmail, [email]);
    return user ? user.id : null;
}

async function requestLatestRace() {
    const recent = await allAsync(latestRace);
    return recent.length === 0 ? [] : [recent[0]];
}

async function checkLoggedIn(email) {
    if (email === null) {
        return {
            error: "User is not signed in!",
            redirect_url: '/login',
        };
    }
    const row = await getAsync(queryCheckedLogIn, [email]);
    const { user_type, isLoggedIn: hasLoggedIn, race_id } = row;
    return {
        user_logged_in: hasLoggedIn,
        user_type,
        redirect_url: '/',
        race_id,
    };
}


function runAsync(sql, params=[]) {
    return new Promise((resolve, reject) => {
        database.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);  // this.lastID, this.changes
        });
    });
}

function getAsync(sql, params=[]) {
    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allAsync(sql, params=[]) {
    return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function invalidateUser(email) {
    await changeUserStatus(email, false);
    return {
        message: 'User has been logged out',
    };
}

async function changeUserStatus(email, isLoggedIn = true) {
    const user = isLoggedIn ? await getAsync(queryForUser, [email]) : undefined;
    if (user !== undefined) {
        await runAsync(updateUserLogin, [isLoggedIn.toString(), email]);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            isLoggedIn: user.isLoggedIn,
            racer_id: user.racer_id,
        };
    }
    return { error: 'User not logged in' };
}

async function requestSingleRace() {
    return allAsync(queryLatestRace);
}

async function registerRace(email) {
    const race = await requestLatestRace();
    const user = await getAsync(queryForUserIdByEmail, [email]);
    let lastRaceNumber = null;
    if (user.user_type === 'runner') {
        const lastRace = await allAsync(queryRaceNum);
        lastRaceNumber = getRaceId(lastRace);
        console.log('lastRaceNumber', lastRaceNumber, lastRace, user.user_type);
    }
    await runAsync(updateUserRaceId, [lastRaceNumber, email])
    await runAsync(registerUser, [user.id, race[0].id, 0]);
    return {
        message: 'Race was registered',
        racer_id: lastRaceNumber
    };
}

async function getDisqualifiedRacers() {
    return allAsync(queryDisqualifiedUsers);
}

// use user_id to disqualify the user
async function disqualifyRunner(status, userId, racerId, email) {
    const user = await getAsync(queryForUser, [email]); //email
    if (user.user_type !== 'volunteer' && user.user_type !== 'organiser') {
        return {
            error: "You don't have permission to perform operations.",
        };
    }
    console.log('user_in_id', racerId, status);
    await runAsync(updateDisqualifyUser, [status, racerId]);
    return {
        message:
            status === 1
                ? `${racerId} has been successfully disqualified`
                : `${racerId} is back in the race`,
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

async function requestRacerPosition() {
    const racerVals = await allAsync(selectRacer);
    const result = await Promise.all(
        racerVals.map(async (racerVal) => {
            const user = await getAsync(queryForUserById, [racerVal.racer_id]);
            return makeRacerPosition(racerVal, user);
        })
    );
    return { data: result };
}

async function requestAllRacers() {
    const disqualified = await allAsync(queryDisqualifiedUsers);
    const racers = await allAsync(queryRegisteredRaces);
    let userIds = [];

    const racersData = await Promise.all(
        racers.map(async (racer) => {
            console.log('requestAllRacers1', `${racer.user_id}`);
            userIds.push(racer.user_id);
            return getAsync(queryForUserById, [racer.user_id]);
        })
    );

    let index = -1;
    const result = racersData.map( function mapToResponse(racer, i) {
        index += 1;
        console.log('requestAllRacers', `${userIds[index]}`);
        return {
            id: racer.id,
            name: racer.name,
            email: racer.email,
            isLoggedIn: racer.isLoggedIn,
            user_type: racer.user_type,
            race_id: racer.race_id,
            user_id: userIds[index],
            disqualified: disqualified[i] ? disqualified[i].disqualified : null,
        }
    });

    return { racers: result };
}

async function getRaceStatus() {
    const raceStatusQueries = await allAsync(queryRaceStatus);
    if (raceStatusQueries.length === 0) return -1;
    const raceStatus = raceStatusQueries[0];
    console.log('raceStatus', raceStatus.race_started, raceStatus.start_time);
    return raceStatus.race_started;
}

async function getAllUsers() {
    return allAsync(queryForAllUsers);
}

async function updateRacerPosition(latitude, longitude, racer_id) {
    await runAsync(insertRacerPosition, [latitude, longitude, racer_id]);
    return {
        latitude: latitude,
        longitude: longitude,
        user: racer_id,
    };
}

async function getRegisteredRaceById(email) {
    const curUId = await getUserIdByEmail(email);
    const raceIdRow = await getAsync(queryRaceId);
    if (!raceIdRow) throw new Error('No race found');
    const raceId = raceIdRow.id;
    return getAsync(queryRegisteredRaceById, [curUId, raceId]);
}

async function getRegisteredRaces() {
    return allAsync(queryRegisteredRaces);
}

async function getRaceStartTime() {
    const startTimes = await allAsync(queryStartTime);
    console.log('startTimes', startTimes)
    if (startTimes === undefined ||startTimes.length === 0) {
        return { recorded_start_time: null, race_started: null };
    }
    return {
        recorded_start_time: startTimes[0].recorded_start_time,
        race_started: startTimes[0].race_started,
    };
}

async function getAllRacePosition() {
    return allAsync(selectAllRacePosition);
}


// Add more functions similarly...

export default {
    database, requestSingleRace,
    checkRacerStatus, changeUserStatus,
    getRaces, invalidateUser, getDisqualifiedRacers,
    searchRacerById, disqualifyRunner,
    getRacerId, registerRace,
    hasRegisteredForRace, requestRacerPosition,
    recordRace, requestAllRacers,
    getRaceRecords, getRaceStatus,
    getRacers, getAllUsers, updateRacerPosition,
    updateStartRace, getRegisteredRaceById,
    updateEndRace, getRegisteredRaces,
    createNewRace, getRaceStartTime,
    createNewUser, getAllRacePosition,
    getUserIdByEmail,
    requestLatestRace,
    checkLoggedIn
};
