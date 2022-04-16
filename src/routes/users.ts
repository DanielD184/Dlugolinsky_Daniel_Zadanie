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
import { setLang } from '../services/setLocale';


const router: Router = Router()
const passport  = require('passport');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator')

const {
	Users,
	Exercise
} = models

export default () => {
	// Get all Users etc. / Admin only
	router.get('/', passport.authenticate('jwt', {session:false}), setLang(), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		const loggedUser = await Users.findOne({where:{token:token}})		
		if(loggedUser === null){
			return res.status(400).json({
				status: 400,
				message: _req.i18n.__('User not found!')
			})
		}
		if(loggedUser.role == USER_ROLE.ADMIN){
			await Users.findAll()
			.then((data) =>  {
				return res.json({
					id: data,
					message: _req.i18n.__('List of users')
					})
			})
			.catch((err) => {
				return res.status(400).json({
					status: 400,
					message: err
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
					message: _req.i18n.__('List of users')
				})
			})
			.catch((err) => {
				return res.status(400).json({
					status: 400,
					message: err
				})
			})
			
			
		}
	})

	// Get profile / All users
	router.get('/profile', passport.authenticate('jwt', {session:false}), setLang(), async (_req: Request, res: Response, _next: NextFunction) => {
		const token = _req.get('Authorization').split(" ")[1];
		
		const loggedUser = await Users.findOne({where:{token:token}})
		if (loggedUser === null){
			return res.status(400).json({
				status: 400,
				message: _req.i18n.__("User not found!")
			})
		}

		const exercise = await Exercise.findAll({ paranoid: false, where:{userId:loggedUser.id}})
		var exerciseFiltered = Array();
		exercise.forEach(data => {
			if(data.deletedAt){
				exerciseFiltered.push({name:data.name, datetime:data.createdAt, difficulty:data.difficulty, duration: ((data.deletedAt - data.createdAt)/1000)	.toFixed(0)})
			}
		})

		return res.json({
			name: loggedUser.surname,
			age: loggedUser.age,
			nickName: loggedUser.nickName,
			message: _req.i18n.__('Details of user'),
			exercises: exerciseFiltered
		})
	})

	// Find User by ID / Admin only
	router.get('/:id', passport.authenticate('jwt', {session:false}), setLang(), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;

		await Users.findByPk(this_id)
		.then((user) => {
			if(user){
				return res.json({
					data: user,
					message: _req.i18n.__('Details of user')
				})
			}
			else{
				return res.status(400).send({
					message: _req.i18n.__('Cant find user with id ') + this_id
				})
			}
		})
		.catch(err => {
			console.error(err)
			return res.status(400).send({
				message: _req.i18n.__('Error')
			})
		})
	})

	// Update User / Admin only
	router.put('/:id', passport.authenticate('jwt', {session:false}), setLang(), checkIsInRole(USER_ROLE.ADMIN), async (_req: Request, res: Response, _next: NextFunction) => {
		const this_id = _req.params.id;
		const { name, surname, nickName, age, role } = _req.body;
		
		await Users.update({ name, surname, nickName, age, role }, {where: { id:this_id}})
		.then(num => {
			if (num == 1) {
			  res.send({
				message: _req.i18n.__("User was successfully updated!")
			  });
			} else {
			  res.send({
				message: _req.i18n.__("Cannot update user with id " +{this_id})
			  });
			}
		  })
		.catch(err => {
			console.error(err)
			return res.status(400).send({
				message: _req.i18n.__("Could not update user with id ") + this_id
			});
		});
	})

	// Login
	router.post('/login', setLang(), body('email').isEmail(), async (_req: Request, res: Response, _next: NextFunction) => {
		const { email, password } = _req.body;
		
		const errors = validationResult(_req)
		console.error(errors)
		if (!errors.isEmpty() && errors.errors[0].param === 'email') {
			return res.status(400).send('Invalid email address. Please try again.')
		}

        const userWithEmail = await UserModel.findOne({ where: {email} })
		.catch((err) => {
			console.error(err)
            res.status(400).send({
				message: _req.i18n.__('Cant find user with email ') + email
			})
        });

        if(!userWithEmail)
            return res.status(400).send({
				message: _req.i18n.__('Email or password doesnt match!')
			})

        if(userWithEmail.password !== password)
			return res.status(400).send({
				message: _req.i18n.__('Email or password doesnt match!')
			})
		try{
        const jwtToken = jwt.sign({ email: userWithEmail.email, password: userWithEmail.password }, 'test')
        res.json({ Message: _req.i18n.__("Welcome!"), token:jwtToken, role:userWithEmail.role});
        Users.update({token : jwtToken}, {where: { email:userWithEmail.email}})
		}
		catch(err){
			console.error(err)
		}
	})

	// Registration
	router.post('/registration', setLang(), body('email').isEmail(), body('password').isLength({min: 6}), async (_req: Request, res: Response, _next: NextFunction) => {
		const { name, surname, nickName, email, password, age, role } = _req.body;

		const errors = validationResult(_req)
		console.error(errors)
		if (!errors.isEmpty() && errors.errors[0].param === 'email') {
			return res.status(400).send('Invalid email address. Please try again.')
		}
		if (!errors.isEmpty() && errors.errors[0].param === 'password') {
			return res
			.status(400)
			.send('Password must be longer than 6 characters.')
		}

		if(role != USER_ROLE.ADMIN || role != USER_ROLE.USER){
			return res.status(400).send(
				"Invalid role. USER/ADMIN"
			)
		}

		const alreadyExists = await UserModel.findOne({ where: {email} });

		if (alreadyExists) return res.status(400).send({
			message: _req.i18n.__('User already exists!')
		})
		if (!email || !password) return res.status(400).send({
			message: _req.i18n.__('Email or password is needed for registration.')
		})

		const newUser = new UserModel({ name, surname, nickName, email, password, age, role })
		const savedUser = await newUser.save().catch((err) => {
			console.log("err", err);
			return res.status(500).send({
				message: _req.i18n.__('Cannot register at the moment!')
			})
		}); 

		if(savedUser) return res.json({message: 'Thanks for registering!' });
		else return res.status(500).send({
			message: _req.i18n.__('Cannot register at the moment!')
		});
	})

	return router
}