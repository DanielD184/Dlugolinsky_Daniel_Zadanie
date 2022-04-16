import { Router, Request, Response, NextFunction } from 'express'
	
import { models } from '../db'
import { USER_ROLE } from '../utils/enums'
import { checkIsInRole } from '../auth/roleCheck'
import { setLang } from '../services/setLocale'
import { filterExercise } from '../services/filtering'
const router: Router = Router()
const passport  = require('passport');

const {
	Exercise,
	Program,
	Users
} = models

export default () => {
	// Get all exercises / Admin only
	router.get('/', passport.authenticate('jwt', {session:false}), setLang(), filterExercise(), async (_req: Request, res: Response, _next: NextFunction) => {
		if (_req.query.page && _req.query.limit){
			return res.json({
				data: _req.paginatedExercises,
				message: _req.i18n.__('List of exercises')
			})
		}
		else if(_req.query.programID){
			return res.json({
				data: _req.programIDExercise,
				message: _req.i18n.__('List of exercises')
			})
		}
		else if(_req.query.search){
			return res.json({
				data: _req.search,
				message: _req.i18n.__('List of exercises')
			})
		}
		else {
			return res.json({
				data: _req.exercises,
				message: _req.i18n.__('List of exercises')
			})
		}
	})

	// Create new exercises / Admin only
	router.post('/', passport.authenticate('jwt', {session:false}), setLang(), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		const user = await Users.findOne({where:{token:token}})
		const { difficulty, name , programID} = _req.body;
		const alreadyExists = await Exercise.findOne({ where: {name} });
		const userId = user.id

		if (alreadyExists) return res.json({ message:_req.i18n.__("Exercise already exists")});
		try{
		const newExercise = new Exercise({ difficulty, name, programID, userId })
		
		const savedExercise = await newExercise.save().catch((err) => {
			console.log("err", err);
			return res.json({error:_req.i18n.__("Cannot create new exercise at the moment!")})
		}); 

		if(savedExercise) return res.json({message: _req.i18n.__('Thanks for creating new exercise!')});
		else return res.json({ error:_req.i18n.__("Cannot create new exercise at the moment!")});
		}
		catch(err){
			return res.status(400).json(
				{
					status:400, 
					message:err.message
				})
		}
	})
	
	// Update exercises / Admin only
	router.put('/:id', passport.authenticate('jwt', {session:false}), setLang(), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		await Exercise.update(_req.body, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: _req.i18n.__("Exercise was successfully updated!")
			  	});
			} 
			else {
			  	res.send({
					message: _req.i18n.__("Cannot update Exercise with id ") + this_id
			  	});
			}
		})
		.catch(err => {
			res.status(500).send({
			  	message: _req.i18n.__("Could not update Exercise with id ") + this_id
			});
		});
	})

	// End Exercise / All
	router.delete('/endexercise/:id', passport.authenticate('jwt', {session:false}), setLang(), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const token = _req.get('Authorization').split(" ")[1];
		const data = await Users.findOne({where:{token:token}})
		const test = await Exercise.findOne({where:{userId:data.id, id:this_id}})
		console.log("tes")
		console.log(test)
		if(test === null){
			return res.send({
				message: _req.i18n.__("User doesnt track this exercise.")
			})
		}
		
		await Exercise.destroy({where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: _req.i18n.__("Exercise was deleted successfully!")
			  	});
			} 
			else {
				res.send({
					message: _req.i18n.__("Cannot delete Exercise with id ") + this_id
				});
			}
		})
		.catch(err => {
			res.status(500).send({
			  	message: _req.i18n.__("Could not delete Exercise with id ") + this_id
			});
		});
	})
	
	// Delete Exercise / Admin only
	router.delete('/delete/:id', passport.authenticate('jwt', {session:false}), setLang(), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const id = _req.params.id;
		await Exercise.destroy({where: { id:id}, force: true})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: _req.i18n.__("Exercise was deleted successfully!")
			  	});
			} 
			else {
			  	res.send({
					message: _req.i18n.__("Cannot delete Exercise with id ") + id
			  	});
			}
		})
		.catch(err => {
			res.status(500).send({
				message: _req.i18n.__("Could not delete Exercise with id ") + id
			});
		});
	})

	return router
}
