import express from 'express';
const router = express.Router();
import db from '../data/queries.js';
import cache from "../data/cache.js";

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
    if(userType === 'runner'){
        response['menus'].push({id: 'my-race', name: 'My race', page: 'dashboard'});
    }else if(userType === 'volunteer'){
        const menus = [
            {id: 'stop-watch', name: 'Stop watch', page: 'timer'},
            {id: 'cur-race', name: 'Current Race', page: 'dashboard'}]
        menus.forEach((menu) => {
            response['menus'].push(menu)
        });
    }else{
        [{id: 'stop-watch', name: 'Stop watch', page: 'timer'},
            {id: 'current-race', name: 'Current Race', page: 'dashboard'},
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

export default router;


