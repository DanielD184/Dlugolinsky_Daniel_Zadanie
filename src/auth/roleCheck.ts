//TODO: Return 3 values and compare User/Admin/Not Logged

import { models } from '../db'

const {
	Users
} = models

const checkIsInRole = (...roles) => async (req, res, next) => {
    const token = req.get('Authorization').split(" ")[1]

    if (!token) {
        return res.send({
            message: "Please log in"
        })
    }

    const loggedUser = await Users.findOne({where:{token:token}})
    
    if (loggedUser.role !== roles) {
        return res.send({
            message: "Your role is not a " + roles
        })
    }
    
    return next()
}

export {checkIsInRole}