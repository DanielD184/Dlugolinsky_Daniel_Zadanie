//TODO: Return 3 values and compare User/Admin/Not Logged

import { models } from '../db'

const {
	Users
} = models

const checkIsInRole = (...roles) => async (req, res, next) => {
    const token = req.get('Authorization').split(" ")[1]

    if (!token) {
        return res.status(500).send({
            message: "Please log in"
        })
    }

    await Users.findOne({where:{token:token}})
    .then((loggedUser) => {
        if (loggedUser.role !== roles) {
            return res.status(500).send({
                message: "Your role is not a " + roles
            })
        }
    })
    
    return next()
}

export {checkIsInRole}