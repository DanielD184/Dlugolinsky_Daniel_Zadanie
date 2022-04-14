import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { UserModel } from '../db/users'

const router: Router = Router()

export default () => {
	router.post('/', async (_req: Request, res: Response, _next: NextFunction) => {

		const { name, surname, nickName, email, age, role } = _req.body;

		const alreadyExists = await UserModel.findOne({ where: {email} });

		if (alreadyExists) return res.json({ message:"User Email already exists"});

		const newUser = new UserModel({ name, surname, nickName, email, age, role })
		const savedUser = await newUser.save().catch((err) => {
			console.log("err", err);
			res.json({error:"Cannot register at the moment"})
		}); 

		if(savedUser) return res.json({message: 'Thanks for registering!' });
		else res.json({ error:"Cannot register at the moment!"});
	})

	return router
}