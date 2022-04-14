import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'

const router: Router = Router()

const {
	Exercise,
	Program,
    Users
} = models

const jwt = require('jsonwebtoken');

const passport  = require('passport');

//require('../auth/passport')
export default () => {
	router.get('/', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
        const users = await Users.findAll()
        return res.json({
			data: users,
			message: 'List of users'
		})
	})
	
	return router
}