/* eslint import/no-cycle: 0 */

import {
	Sequelize,
	DataTypes,
	Model
} from 'sequelize'
import { DatabaseModel } from '../types/db'

import { USER_ROLE } from '../utils/enums'

export class UserModel extends DatabaseModel {
	name: String
    surname: String
    nickName: String
    email: String
    age: number
    role: USER_ROLE
}

export default (sequelize: Sequelize) => {
	UserModel.init({
		name: {
			type: DataTypes.STRING(100)
		},
        surname: {
			type: DataTypes.STRING(100)
		},
        nickName: {
			type: DataTypes.STRING(100)
		},
        email: {
			type: DataTypes.STRING(100)
		},
		password: {
			type: DataTypes.STRING(100)
		},
        age: {
			type: DataTypes.INTEGER()
		},
		role: {
			type: DataTypes.ENUM(...Object.values(USER_ROLE))
		}
	}, {
		paranoid: true,
		timestamps: true,
		sequelize,
		modelName: 'user'
	})

	return UserModel
}
