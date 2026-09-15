import dotenv from 'dotenv'
dotenv.config()

import ruterBaza from './ruter/Ruter'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import fs from 'fs'
import { posaljiGresku } from './servisi/Poruke'

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

const ruter = express.Router()
ruter.use('/', ruterBaza)

app.use('/', ruter)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (err != null) {

        if (err.code == 'LIMIT_UNEXPECTED_FILE' || err.code == 'LIMIT_FILE_COUNT') {
            posaljiGresku(res, 400, 'LIMIT_FOTOGRAFIJA')
            return
        }

        if (err.code == 'LIMIT_FILE_SIZE') {
            posaljiGresku(res, 400, 'FOTOGRAFIJA_PREVELIKA')
            return
        }

        posaljiGresku(res, 400, 'GRESKA_OBRADA_ZAHTEVA_UPLOAD')
        return
    }

    next()
})

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGO_DB_NAME || 'luckytails_db'

mongoose.connect(`${mongoUri}/${dbName}`)

const connection = mongoose.connection

connection.once('open', () => {
    console.log(`Connected to MongoDB (${dbName}) on ${mongoUri}`)
})

const port = Number(process.env.PORT) || 4000

app.listen(port, () => {
    console.log(`Express running on port ${port}!`)
})
