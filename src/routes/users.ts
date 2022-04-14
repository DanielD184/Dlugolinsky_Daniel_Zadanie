import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'

const router: Router = Router()

const {
	Users
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const users = await Users.findAll()
		return res.json({
			data: users.filter,
			message: 'List of users'
		})
	})

	return router
}