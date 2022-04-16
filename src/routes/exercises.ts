import { Router, Request, Response, NextFunction } from 'express'
	
import { models } from '../db'
import { EXERCISE_DIFFICULTY, USER_ROLE } from '../utils/enums'
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
	router.post('/', passport.authenticate('jwt', {session:false}), setLang(), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		const user = await Users.findOne({where:{token:token}})
		const { difficulty, name , programID} = _req.body;

		if(difficulty !== EXERCISE_DIFFICULTY.EASY && difficulty !== EXERCISE_DIFFICULTY.MEDIUM && difficulty !== EXERCISE_DIFFICULTY.HARD){
			return res.status(400).json({
				status:400,
				message:_req.i18n.__("Choose correct difficulty! EASY/MEDIUM/HARD")
			})
		}
		if(!isNaN(programID)){
			await Program.findOne({where: {id:programID}})
			.then(programExists => {
				if(!programExists){
					return res.status(400).json({
						status:400,
						message:_req.i18n.__("Program doesnt exist!")
					})
				}
			})
		}
		else{
			return res.status(400).json({
				status:400,
				message:_req.i18n.__("ProgramID must be a number!")
			})
		}
		const userId = user.id

		try{
			const newExercise = new Exercise({ difficulty, name, programID, userId })
			
			const savedExercise = await newExercise.save().catch((err) => {
				console.error(err);
				return res.json({message:_req.i18n.__("Cannot create new exercise at the moment!")})
			}); 

			if(savedExercise) return res.json({message: _req.i18n.__('Thanks for creating new exercise!')});
			else return res.json({ message:_req.i18n.__("Cannot create new exercise at the moment!")});
		}
		catch(err){
			console.error(err)
			return res.status(400).json(
				{
					status:400, 
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
			console.error(err)
			res.status(500).json({
				status:500,
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
		if(test === null){
			return res.send({
				message: _req.i18n.__("User doesnt track this exercise.")
			})
		}
		
		await Exercise.destroy({where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  	res.send({
					message: _req.i18n.__("Exercise was ended successfully!")
			  	});
			} 
			else {
				res.send({
					message: _req.i18n.__("Cannot end Exercise with id ") + this_id
				});
			}
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({
				status:500,
			  	message: _req.i18n.__("Could not end Exercise with id ") + this_id
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
			console.error(err)
			res.status(500).json({
				status:500,
				message: _req.i18n.__("Could not delete Exercise with id ") + id
			});
		});
	})

	return router
}
