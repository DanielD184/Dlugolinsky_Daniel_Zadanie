//TODO: Main tasks
//Get all users for User
//Get own profile data for User
//Everything else delete or for admin

import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'
import { roleCheck } from '../auth/roleCheck'

const router: Router = Router()

const passport  = require('passport');

const {
	Users
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const users = await Users.findAll()
		return res.json({
			data: users,
			message: 'List of users'
		})
	})


	router.get('/:id', async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const user = await Users.findByPk(this_id)
		return res.json({
			data: user,
			message: 'Details of user'
		})
	})

	router.put('/:id', passport.authenticate('jwt', {session:false}), roleCheck, async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const { name, surname, nickName, age, role } = _req.body;
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