import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import { checkIsInRole } from '../auth/roleCheck'
import { USER_ROLE } from '../utils/enums'

const router: Router = Router()

const passport  = require('passport');

const {
	Users,
	Exercise
} = models

export default () => {
	router.get('/', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		const loggedUser = await Users.findOne({where:{token:token}})		

		if(loggedUser.role == USER_ROLE.ADMIN){
			await Users.findAll()
			.then((data) =>  {
				return res.json({
					id: data,
					message: 'List of users'
				})
			})
		}
		else{
			await Users.findAll()
			.then((data) =>  {
				var elements = [];

				data.forEach(element => {
					elements.push({id: element.id, nickName: element.nickName});
				});

				return res.json({
					data:elements,
					message: 'List of users'
				})
			})
			
			
		}
	})

	router.get('/profile', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		
		const data = await Users.findOne({where:{token:token}})

		const exercise = await Exercise.findAll({ paranoid: false, where:{userId:data.id}})
		var exerciseFiltered = Array();
		exercise.forEach(data => {
			if(data.deletedAt){
				//TODO:Calculate duration
				exerciseFiltered.push({name:data.name, datetime:data.createdAt, difficulty:data.difficulty, duration: (data.deletedAt - data.createdAt)})
			}
		})
		

		return res.json({
			name: data.name,
			surname: data.surname,
			age: data.age,
			nickName: data.nickName,
			message: 'Details of user',
			exercises: exerciseFiltered
		})
	})

	router.get('/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;

		if(res.status(500)){
			console.error("User account problem! checkIsInRole")
			return
		}

		await Users.findByPk(this_id)
		.then((user) => {
			return res.json({
				data: user,
				message: 'Details of user'
			})
		})
		.catch(err => {
			res.status(500).send({
				message: 'Cant find user with id ' + this_id
			})
		})
	})

	router.put('/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const { name, surname, nickName, age, role } = _req.body;
		if(res.status(500)){
			console.error("User account problem! checkIsInRole")
			return
		}
		await Users.update({ name, surname, nickName, age, role }, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  res.send({
				message: "User was successfully updated!"
			  });
			} else {
			  res.send({
				message: `Cannot update user with id=${this_id}.`
			  });
			}
		  })
		.catch(err => {
			res.status(500).send({
				message: "Could not update user with id=" + this_id
			});
		});
	})

	return router
}