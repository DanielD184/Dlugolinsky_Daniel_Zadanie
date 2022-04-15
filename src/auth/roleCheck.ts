//TODO: Return 3 values and compare User/Admin/Not Logged

import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { USER_ROLE } from '../utils/enums';


const {
	Users
} = models

const checkIsInRole = (roles) => async (req, res, next) => {
    const token = req.get('Authorization').split(" ")[1]

    if (!token) {
        return res.send({
            message: "Please log in"
        })
    }

    const loggedUser = await Users.findOne({where:{token:token}})
    
    if (loggedUser.role !== roles) {
        return res.send({
            message: "Your role is not an" + roles
        })
    }
    
    return next()
}

export {checkIsInRole}