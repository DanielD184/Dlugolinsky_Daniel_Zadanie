import http from 'http'
import express from 'express'
import * as bodyParser from 'body-parser'

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import UsersRouter from './routes/users'
import Register from './routes/register'
import Login from './routes/login'
import './auth/passport'

import Payment from './routes/payment'

require('dotenv').config()
const app = express()


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())
app.use('/users', UsersRouter())
app.use('/register', Register())
app.use('/login', Login())


const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer
