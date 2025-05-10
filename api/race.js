import express, {json} from 'express';
const router = express.Router();
import db from '../data/queries.js';
import cache from "../data/cache.js";
import queries from "../data/queries.js";

router.get('/current-race', async (req, res) => {
    try{
        const newRace = await db.requestLatestRace();
        return res.status(200).json({data: newRace});
    }catch (err){
        return res.status(500).send({
            error: "Internal Server Error: " + err,
        })
    }
});

router.get('/user-registered', async function hasUserRegisteredForRace(req, res){
    const email = req.query.email;
    const hasUserRegistered = await db.hasRegisteredForRace(email);
    return res.status(200).json({
        'registered': hasUserRegistered
    })
});

router.get('/search-racers', async function searchRacer(req, res){
    const racerQuery = req.query.q;
    const qRacer = await db.searchRacerById(racerQuery);
    console.log('qRacer', qRacer);
    return res.status(200).json({
        'racers': racerQuery.length > 0 ? qRacer : [],
    })
});

router.get('/user-type', async function userMenuByType(req, res) {
    const userType = req.query.type;
    const email = req.query.email;
    const hasUserRegistered = await db.hasRegisteredForRace(email);
    console.log('userType_userType', userType);
    const response = {'menus': []};
    const timer = {id: 'stop-watch', name: 'Stop watch', page: 'timer'};
    let raceData = {id: 'my-race', name: 'My race', page: 'dashboard'}
    if(userType === 'runner'){
        response['menus'].push(raceData);
        // Show timer tab only if the user has registered for the race
        if(hasUserRegistered){
            response['menus'].push(timer);
        }
    }else if(userType === 'volunteer'){
        raceData['id'] = 'cur-race';
        raceData['name'] = 'Current Race';
        const menus = [
            timer,raceData]
        menus.forEach((menu) => {
            response['menus'].push(menu)
        });
    }else if(userType === 'organiser'){
        raceData['id'] = 'cur-race';
        raceData['name'] = 'Current Race';
        [timer,raceData,
            {id: 'new-race', name: 'New Race', page: 'new-race'},
            {id: 'race-board', name: 'Participants', page: 'race-board'}]
            .forEach((menu) => {
                response['menus'].push(menu)
            });
    }else{
        return res.status(404).json({
            error: 'User Not Found'
        });
    }
    return res.status(200).json(response);
});
// requestRacerPosition
router.get('/racers', async (req, res) => {
    const racers = await db.requestAllRacers();
    return res.status(200).json(racers);
});

router.get('/race-status', async function raceStatus(req, res) {
    const raceStatus = await db.getRaceStatus();
    return res.status(200).json({
        race_ended: raceStatus === 0
    });
});

router.post('/suggest-racers', async (req, res) => {
    try{
        const inpValue = req.body;
        const suggestedRacers = await db.getRacers();
        //const filtered =
        return res.status(200).json(suggestedRacers);
    }catch (error){
        return res.status(500).send({
            error: "Internal Server Error: " + error
        })
    }
});

/// Get all participants in the race
router.get('/all-racer-board', async (req, res) => {
    const racers = await db.getAllRacePosition();
    return res.status(200).json(racers);
});

router.get('/start-time', async (req, res) => {
    const raceStartTime = await db.getRaceStartTime();
    return res.status(200).json(raceStartTime);
})

router.put('/start-race', async (req, res) => {
    const {start_time, started} = req.body;

    const startedRace = await db.updateStartRace( start_time, started); // req.params.id
    if (startedRace.error || start_time === undefined){
        return res.status(400).json(startedRace);
    }
    return res.status(200).json(startedRace);
});

router.put('/end-race', async (req, res) => {
    const {end_time} = req.body;
    const startedRace = await db.updateEndRace(end_time); // req.params.id
    if (startedRace.error || end_time === undefined){
        return res.status(400).json(startedRace);
    }
    return res.status(200).json(startedRace);
});

router.get('/races', async (req, res) => {
    const races = await db.requestAllRace();
    return res.status(200).json(races)
});


router.post('/new-race', async (req, res) => {
    return newRace(req, res);
});


async function newRace(req, res){
    const {name, start_time, cutoff_time, email} = req.body;
    console.log(req.body);
    try{
        const result = await db.createNewRace(email,
            name, cutoff_time, start_time);
        if(result.error){
            return res.status(404).json({ error: result.error.message });
        }

        res.status(201).json(req.body);
    }catch (error){
        res.status(500).send({error: error.message});
    }
}

// router.post('/racer-position', async (req, res) => {
//     if(cache.getUserType() === 'runner'){
//         const {latitude, longitude} = req.body;
//         const racer_id = await queries.getUserById(email);
//         const racerPosition = await db.updateRacerPosition(latitude, longitude,
//             racer_id);
//         return res.status(200).json(racerPosition);
//     }
//     return res.status(400).json({message: "User is not a runner"});
// });



router.get('/registered-race', async (req, res) => {
    const email = req.query.email;
    const raceById = await db.getRegisteredRaceById(email);
    return res.status(200).send({
        registered: raceById !== undefined
    });
});

router.get('/runner-positions', async (req, res) => {
    const racerPosition = await db.requestRacerPosition();
    return res.status(200).json(racerPosition);
});

router.post('/record-race', async (req, res) => {
    const {race_time, runners, race_id} = req.body;
    let raceLaps = []; // position, racer_id, race_id
    // racerPos, lapsTime, racerId, raceId
    for (let i =0; i< runners.length; i++){
        const runner = runners[i];
        const racerPosition = await db.recordLaps(runner.position,
            race_time, runner.race_id, race_id);
        raceLaps.push(racerPosition);
    }
    return res.status(200).json({
        message: 'Successfully recorded race',
        data: raceLaps
    });
});

router.get('/records', async (req, res) => {
    const racerPosition = await db.getNewLaps();
    return res.status(200).json(racerPosition);
});

router.post('/disqualify', async function doDisqualifyRacer(req, res) {
    const {racer_id, status} = req.params.id;
    try{
        const result = await db.disqualifyRunner(status, racer_id);
        return res.status(200).json(result);
    }catch (e) {
        return res.status(500).send({error: e});
    }
});


router.post('/register-race', async (req, res) => {
    try{
        const {email} = req.body;
        const registerRace = await db.registerRace(email);
        return res.status(200).json(registerRace);
    }catch (error){
        const uniqueErr = error.message.includes('UNIQUE');
        return res.status(500).json({ error: uniqueErr
                ? "You've already registered for this race"
                : 'Internal Server Error' });
    }
}); //console.error('error.message', error.message);


router.get('/register-races', async (req, res) => {
    const registeredRaces = await db.getRegisteredRaces();
    return res.status(200).send({
        data: registeredRaces
    });
})

export default router;


