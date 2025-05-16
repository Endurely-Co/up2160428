import express, {json} from 'express';
const router = express.Router();
import db from '../data/queries.js';

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
    try{
        const userType = req.query.type;
        const email = req.query.email;
        const hasUserRegistered = await db.hasRegisteredForRace(email);
        console.log('userType_userType', userType);
        const response = {'menus': []};
        const timer = {id: 'stop-watch', name: 'Race Timer', page: 'timer'};
        let raceData = {id: 'my-race', name: 'My race', page: 'dashboard'};
        const raceBoard =  {id: 'race-board', name: 'Race board', page: 'race-board'}
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
                timer,raceData, raceBoard]
            menus.forEach((menu) => {
                response['menus'].push(menu)
            });
        }else if(userType === 'organiser'){
            raceData['id'] = 'cur-race';
            raceData['name'] = 'Current Race';
            [timer,raceData,
                {id: 'new-race', name: 'New Race', page: 'new-race'},raceBoard]
                .forEach((menu) => {
                    response['menus'].push(menu)
                });
        }else{
            return res.status(404).json({
                error: 'User Not Found'
            });
        }
        return res.status(200).json(response);
    }catch (e) {
        return res.status(500).send({error: e});
    }
});
// requestRacerPosition
router.get('/racers', async (req, res) => {
    try {
        const racers = await db.requestAllRacers();
        return res.status(200).json(racers);
    }catch (e) {
        return res.status(500).send({error: e});
    }
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

router.get('/single-race', async function singleRace(req, res) {
    const races = await db.requestSingleRace();
    return res.status(200).json(races)
});

router.get('/races', async function singleRace(req, res) {
    const races = await db.getRaces();
    return res.status(200).json(races)
});


router.post('/new-race', async (req, res) => {
    return newRace(req, res);
});


async function newRace(req, res){
    const {name, start_time, email, address, postcode, city} = req.body;
    console.log(req.body);
    try{
        const result = await db.createNewRace(email,
            name, 0, start_time, address, postcode, city);
        if(result.error){
            return res.status(404).json({ error: result.error.message });
        }

        res.status(201).json(req.body);
    }catch (error){
        console.log(error);
        res.status(500).send({error: error.message});
    }
}



router.get('/registered-race', async (req, res) => {
    try{
        const email = req.query.email;
        const raceById = await db.getRegisteredRaceById(email);
        return res.status(200).send({
            registered: raceById !== undefined
        });
    }catch (e) {
        return res.status(500).send({error: 'Cannot not get registered race'});
    }
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
        const racerPosition = await db.recordRace(runner.position,
            race_time, runner.race_id, race_id);
        raceLaps.push(racerPosition);
    }
    return res.status(200).json({
        message: 'Successfully recorded race',
        data: raceLaps
    });
});

router.get('/records', async (req, res) => {
    const racerPosition = await db.getRaceRecords();
    return res.status(200).json(racerPosition);
});

router.post('/disqualify', async function doDisqualifyRacer(req, res) {
    const {status, user_id, racer_id, email} = req.body;
    try{
        const result = await db.disqualifyRunner(status, user_id, racer_id, email);
        return res.status(200).json(result);
    }catch (e) {
        console.log(e);
        return res.status(500).send({error: e.message});
    }
});

//checkRacerStatus

router.post('/racer-status', async function racerStatus(req, res)  {
    try{
        const {email} = req.body;
        const racerStatus = await db.checkRacerStatus(email);
        console.log('racerStatus ---->', racerStatus);
        return res.status(200).json({
            data: {
                is_disqualified: racerStatus ? racerStatus.disqualified === 1 : null
            }
        });
    }catch (e) {
        return res.status(500).send({error: e.message});
    }
});

router.get('/disqualify', async function getDisqualifiedRacer(req, res)  {

    try{
        const disqualifiedRacers = await db.getDisqualifiedRacers();
        return res.status(200).json({
            data: disqualifiedRacers
        });
    }catch (e) {
        return res.status(500).send({error: e});
    }
});

router.post('/register-race', async function registerUserForRace (req, res) {
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


