import express from 'express';
const router = express.Router();
import db from '../data/queries.js';
import cache from "../data/cache.js";
import geolocation from "./geolocation.js";
import queries from "../data/queries.js";

router.get('/current-race', async (req, res) => {
    try{
        const newRace = await db.requestLatestRace();
        return res.status(200).json(newRace);
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

router.post('/racer', async (req, res) => {
    if(cache.getUserType() === 'runner'){
        const {race_position, racer_id} = req.body;
        const location = queries.registerLocation();
        const racerPosition = db.updateRacerPosition(
            location.latitude, location.longitude,
            race_position, racer_id);
        return res.status(200).json(racerPosition)
    }
    return res.status(400).json({message: "User is not a runner"});
});

router.get('/racer', async (req, res) => {
    const registerLocation = db.requestRacerPosition();
    return res.status(200).json(registerLocation);
});

export default router;


