//TODO: track exercises he has completed (he can track same exercise multiple times, we want to save datetime of completion and duration in seconds)
//see list of completed exercises (with datetime and duration) in profile
//remove tracked exercise from completed exercises list

import { Router, Request, Response, NextFunction } from 'express'
import { nextTick } from 'process'
import roleCheck from '../auth/roleCheck';

import { models } from '../db'
import { USER_ROLE } from '../utils/enums'
import { roleCheck } from '../auth/roleCheck'

const router: Router = Router()
const passport  = require('passport');

const {
	Exercise,
	Program,
	Users
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => 
	{		
		const exercises = await Exercise.findAll({
			include: [{
				model: Program,
				as: 'program'
			}]
		})

		return res.json({
			data: exercises,
			message: 'List of exercises'
		})
	})

	router.post('/', passport.authenticate('jwt', {session:false}), roleCheck, async (_req: Request, res: Response, _next: NextFunction) => {
		const { difficulty, name , programID} = _req.body;

		const alreadyExists = await Exercise.findOne({ where: {name} });

		if (alreadyExists) return res.json({ message:"Exercise already exists"});

		const newExercise = new Exercise({ difficulty, name, programID })
		const savedExercise = await newExercise.save().catch((err) => {
			console.log("err", err);
			res.json({error:"Cannot create new exercise at the moment"})
		}); 

		if(savedExercise) return res.json({message: 'Thanks for creating new exercise!' });
		else res.json({ error:"Cannot create new exercise at the moment!"});
	})
	

	router.put('/:id', passport.authenticate('jwt', {session:false}), roleCheck, async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		await Exercise.update(_req.body, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  res.send({
				message: "Exercise was successfully updated!"
			  });
			} else {
			  res.send({
				message: `Cannot update Exercise with id=${this_id}.`
			  });
			}
		  })
		  .catch(err => {
			res.status(500).send({
			  message: "Could not update Exercise with id=" + this_id
			});
		  });
	})
	
	router.delete('/delete/:id', passport.authenticate('jwt', {session:false}), roleCheck, async (_req: Request, res: Response, _next: NextFunction) => {
		const id = _req.params.id;
		await Exercise.destroy({where: { id:id}})
		.then(num => {
			if (num == 1) {
			  res.send({
				message: "Exercise was deleted successfully!"
			  });
			} else {
			  res.send({
				message: `Cannot delete Exercise with id=${id}.`
			  });
			}
		  })
		  .catch(err => {
			res.status(500).send({
			  message: "Could not delete Exercise with id=" + id
			});
		  });
	})

	return router
}
