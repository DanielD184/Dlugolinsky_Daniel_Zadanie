import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db';
import { checkIsInRole } from '../auth/roleCheck';
import { USER_ROLE } from '../utils/enums';
import { UserModel } from '../db/users';

const router: Router = Router()

const passport  = require('passport');
const jwt = require('jsonwebtoken');

const {
	Users,
	Exercise
} = models

export default () => {
	// Get all Users etc. / Admin only
	router.get('/', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
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

	// Get profile / All users
	router.get('/profile', passport.authenticate('jwt', {session:false}), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		
		const data = await Users.findOne({where:{token:token}})

		const exercise = await Exercise.findAll({ paranoid: false, where:{userId:data.id}})
		var exerciseFiltered = Array();
		exercise.forEach(data => {
			if(data.deletedAt){
				exerciseFiltered.push({name:data.name, datetime:data.createdAt, difficulty:data.difficulty, duration: ((data.deletedAt - data.createdAt)/1000)	.toFixed(0)})
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

	// Find User by ID / Admin only
	router.get('/:id', passport.authenticate('jwt', {session:false}), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;

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

	// Update User / Admin only
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

	// Login
	router.post('/login', async (_req: Request, res: Response, _next: NextFunction) => {
		const { email, password } = _req.body;

        const userWithEmail = await UserModel.findOne({ where: {email} }).catch((err) => {
            console.error("Error", err);
        });

        if(!userWithEmail)
            return res.json({ message: "Email or password doesnt match!"});

        if(userWithEmail.password !== password)
            return res.json({ message: "Email or password doesnt match!"});

        const jwtToken = jwt.sign({ email: userWithEmail.email, password: userWithEmail.password }, 'test')
        res.json({ Message: "Welcome!", token:jwtToken, role:userWithEmail.role});
        Users.update({token : jwtToken}, {where: { email:userWithEmail.email}})
	})

	// Registration
	router.post('/register', async (_req: Request, res: Response, _next: NextFunction) => {

		const { name, surname, nickName, email, password, age, role } = _req.body;

		const alreadyExists = await UserModel.findOne({ where: {email} });

		if (alreadyExists) return res.json({ message:"User Email already exists"});

		const newUser = new UserModel({ name, surname, nickName, email, password, age, role })
		const savedUser = await newUser.save().catch((err) => {
			console.log("err", err);
			res.json({error:"Cannot register at the moment"})
		}); 

		if(savedUser) return res.json({message: 'Thanks for registering!' });
		else res.json({ error:"Cannot register at the moment!"});
	})

	return router
}