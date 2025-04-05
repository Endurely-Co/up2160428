import express from 'express';
const router = express.Router();
import db from '../data/queries.js';

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

router.post('/new-race', async (req, res) => {
    return newRace(req, res);
});


async function newRace(req, res){
    const {email, name, loop_km, start_time, cutoff_time} = req.body;
    console.log(req.body);
    try{
        const result = await db.createNewRace(email, name, cutoff_time, start_time,  loop_km);
        if(result.error){
            return res.status(404).json({ error: result.error.message });
        }

        res.status(201).json(req.body);
    }catch (error){
        res.status(500).send({error: error.message});
    }
}

export default router;


