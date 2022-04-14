//TODO: Return 3 values and compare User/Admin/Not Logged

import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { USER_ROLE } from '../utils/enums';


const {
	Users
} = models

export default async (req,res,next) => {
    const token = req.get('Authorization').split(" ")[1]
	const loggedUser = await Users.findOne({where:{token:token}})
	if (!loggedUser){
		res.json({
			message: 'You are not logged in!'
		})
	}
	else if (loggedUser.role !== USER_ROLE.ADMIN){
		res.json({
			message: 'You dont have access!'
		})
	}
    next()
}