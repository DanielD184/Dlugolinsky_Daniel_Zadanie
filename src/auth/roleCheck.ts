import { models } from '../db'
import {
	Request,
	Response,
	NextFunction
} from 'express'

const {
	Users
} = models

const checkIsInRole = (roles) => async (req:Request, res: Response, next: NextFunction) => {
    const token = req.get('Authorization').split(" ")[1]
    try{
        const loggedUser = await Users.findOne({where:{token:token}})
        if (loggedUser === null){
            return res.status(400).json({
                status: 400,
                message: req.i18n.__("User not found!")
            })
        }
        if (loggedUser.role !== roles) {
            return res.status(400).json({
                status: 400,
                message: req.i18n.__("Your role is not an ") + roles
            })
        }
    }
    catch(err){
        console.error(err)
        return res.status(400).json({
            status: 400,
            message: "Oops something went wrong"
        })
    }   
    
    return next()
}

export {checkIsInRole}