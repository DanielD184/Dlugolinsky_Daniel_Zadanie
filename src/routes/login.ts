import { UserModel } from '../db/users'
import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

const express = require("express");
const router: Router = Router();
const jwt = require('jsonwebtoken');

export default () => {
	router.post('/', async (_req: Request, res: Response, _next: NextFunction) => {

		const { email, name } = _req.body;

        const userWithEmail = await UserModel.findOne({ where: {email} }).catch((err) => {
            console.error("Error", err);
        });

        if(!userWithEmail)
            return res.json({ message: "Email or name doesnt match!"});

        if(userWithEmail.name !== name)
            return res.json({ message: "Email or name doesnt match!"});

        const jwtToken = jwt.sign({ email: userWithEmail.email }, process.env.ACCESS_TOKEN_SECRET)

        res.json({ Message: "Welcome!", token:jwtToken});   
	})

	return router
}