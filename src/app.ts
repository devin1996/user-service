import * as express from 'express'
import { Request, Response } from 'express'
import * as cors from 'cors'
import { createConnection } from 'typeorm'
//importing amqlib 
import * as amqp from 'amqplib/callback_api'

createConnection().then(db => {

    amqp.connect('amqps://wmqmekbr:RCf9DHx6XLA0lpx7gk1T8OOT1x7Ax0eo@bonobo.rmq.cloudamqp.com/wmqmekbr', (error0, connection) => {
        if (error0) {
            throw error0
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1
            }

            //listening to testing 123 event
            channel.assertQueue('testing123',{durable:false})


            const app = express()

            app.use(cors({
                origin: ["http://localhost:3000"]
            }))

            app.use(express.json())

            channel.consume('testing123', (msg)=>{
                //converting buffer msg into string
                console.log(msg.content.toString())
            })
            
            console.log('Listening to post 8001')
            app.listen(8001)
        })
    })



})