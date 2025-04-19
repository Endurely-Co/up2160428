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

router.get('/user-type', async (req, res) => {
    const userType = cache.getUserType();
    const response = {'menus': []};
    const timer = {id: 'stop-watch', name: 'Stop watch', page: 'timer'};
    let raceData = {id: 'my-race', name: 'My race', page: 'dashboard'}
    if(userType === 'runner'){
        response['menus'].push(raceData);
        response['menus'].push(timer);
    }else if(userType === 'volunteer'){
        raceData['id'] = 'cur-race';
        raceData['name'] = 'Current Race';
        const menus = [
            timer,raceData]
        menus.forEach((menu) => {
            response['menus'].push(menu)
        });
    }else{
        raceData['id'] = 'cur-race';
        raceData['name'] = 'Current Race';
        [timer,raceData,
            {id: 'new-race', name: 'New Race', page: 'new-race'}]
            .forEach((menu) => {
            response['menus'].push(menu)
        });
    }
    return res.status(200).json(response);
});
// requestRacerPosition
router.get('/racers', async (req, res) => {
    const racers = await db.requestRacerPosition();
    return res.status(200).json(racers);
});

router.get('/races', async (req, res) => {
    const races = await db.requestAllRace();
    return res.status(200).json(races)
});


router.post('/new-race', async (req, res) => {
    return newRace(req, res);
});


async function newRace(req, res){
    const {name, loop_km, start_time, cutoff_time} = req.body;
    const email = cache.getLogIn();
    console.log(req.body);
    try{
        const result = await db.createNewRace(email,
            name, cutoff_time, start_time,  loop_km);
        if(result.error){
            return res.status(404).json({ error: result.error.message });
        }

        res.status(201).json(req.body);
    }catch (error){
        res.status(500).send({error: error.message});
    }
}

router.post('/racer-position', async (req, res) => {
    if(cache.getUserType() === 'runner'){
        const {latitude, longitude} = req.body;
        const racer_id = await queries.getUserById();
        const racerPosition = await db.updateRacerPosition(latitude, longitude,
            racer_id);
        return res.status(200).json(racerPosition);
    }
    return res.status(400).json({message: "User is not a runner"});
});



router.get('/registered-race', async (req, res) => {
    const raceById = await db.getRegisteredRaceById();
    return res.status(200).send({
        registered: raceById !== undefined
    });
});

router.get('/runner-positions', async (req, res) => {
    const racerPosition = await db.requestRacerPosition();

    return res.status(200).json(racerPosition);
});


router.post('/register-race', async (req, res) => {
    try{
        const email = cache.getLogIn();
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


