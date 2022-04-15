import { Router, Request, Response, NextFunction } from 'express'
	
import { models } from '../db'
import { USER_ROLE } from '../utils/enums'
import { checkIsInRole } from '../auth/roleCheck';


const router: Router = Router()
const passport  = require('passport');

const {
	Exercise,
	Program,
	Users
} = models

export default () => {
	// Get all exercises / Admin only
	router.get('/', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => 
	{		
		const exercises = await Exercise.findAll({ paranoid: false,
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

	// Create new exercises / Admin only
	router.post('/', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const { difficulty, name , programID, userId} = _req.body;

		const alreadyExists = await Exercise.findOne({ where: {name} });

		if (alreadyExists) return res.json({ message:"Exercise already exists"});

		const newExercise = new Exercise({ difficulty, name, programID, userId })
		const savedExercise = await newExercise.save().catch((err) => {
			console.log("err", err);
			res.json({error:"Cannot create new exercise at the moment"})
		}); 

		if(savedExercise) return res.json({message: 'Thanks for creating new exercise!' });
		else res.json({ error:"Cannot create new exercise at the moment!"});
	})
	
	// Update exercises / Admin only
	router.put('/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		await Exercise.update(_req.body, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: "Exercise was successfully updated!"
			  	});
			} 
			else {
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

	// End Exercise / All
	router.put('/endexercise/:id', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
		const id = _req.params.id;
		await Exercise.destroy({where: { id:id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: "Exercise was deleted successfully!"
			  	});
			} 
			else {
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

	// Track exercise
	router.put('/track/:id', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const token = _req.get('Authorization').split(" ")[1];
		const data = await Users.findOne({where:{token:token}})

		await Exercise.update(_req.body, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: "Exercise was successfully updated!"
			  	});
			} 
			else {
			  	res.send({
					message: `Cannot update Exercise with id=${this_id}.`
			  	});
			}
		})
		.catch(err => {
			res.status(500).send({
			  	message: "Could not update Exercise with id=" + this_id,
			});
		});
	})
	
	// Delete Exercise / Admin only
	router.delete('/delete/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const id = _req.params.id;
		await Exercise.destroy({where: { id:id}, force: true})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: "Exercise was deleted successfully!"
			  	});
			} 
			else {
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
