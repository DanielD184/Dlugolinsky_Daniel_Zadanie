import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import { checkIsInRole } from '../auth/roleCheck'
import { USER_ROLE } from '../utils/enums';

const router: Router = Router()
const passport  = require('passport');

const {
	Program
} = models

export default () => {

	// Show all programs / Admin only
	router.get('/', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN),  async (_req: Request, res: Response, _next: NextFunction) => {
		
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of programs'
		})
	})
	
	// Create new program / Admin only
	router.post('/', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {

		const { name } = _req.body;

		const alreadyExists = await Program.findOne({ where: {name} });

		if (alreadyExists) return res.json({ message:"Program already exists"});

		const newProgram = new Program({ name })
		const savedProgram = await newProgram.save().catch((err) => {
			console.log("err", err);
			res.json({error:"Cannot create new Program at the moment"})
		}); 

		if(savedProgram) return res.json({message: 'Thanks for creating new Program!' });
		else res.json({ error:"Cannot create new Program at the moment!"});
	})
	
	// Update Program / Admin only
	router.put('/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {

		const this_id = _req.params.id;
		await Program.update(_req.body, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			
			  	res.send({
					message: "Program was successfully updated!"
			  	});
			} 
			else {
			  	res.send({
					message: `Cannot update Program with id=${this_id}.`
			  	});
				}
		})
		.catch(err => {
			res.status(500).send({
			  	message: "Could not update Program with id=" + this_id
			});
		});
	})
	
	// Delete program / Admin only
	router.delete('/delete/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const id = _req.params.id;
		await Program.destroy({where: { id:id}})
		.then(num => {
			if (num == 1) {
			  res.send({
				message: "Program was deleted successfully!"
			  });
			} else {
			  res.send({
				message: `Cannot delete Program with id=${id}.`
			  });
			}
		  })
		  .catch(err => {
			res.status(500).send({
			  message: "Could not delete Program with id=" + id
			});
		  });
	})

	return router
}
