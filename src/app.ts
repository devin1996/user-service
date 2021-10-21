import * as express from 'express'
import { Request, Response } from 'express'
import * as cors from 'cors'
import { createConnection } from 'typeorm'
import {User} from "./entity/user"
import {Time} from "./entity/time"
//importing amqlib 
import * as amqp from 'amqplib/callback_api';
import axios from 'axios';


createConnection().then(db => {

    //const studentRepository = db.getMongoRepository(User)
    const studentRepository = db.getRepository(User)
    const timeRepository = db.getRepository(Time)
    
    amqp.connect('amqps://wmqmekbr:RCf9DHx6XLA0lpx7gk1T8OOT1x7Ax0eo@bonobo.rmq.cloudamqp.com/wmqmekbr', (error0, connection) => {
        if (error0) {
            throw error0
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1
            }

            //listening to testing 123 event
            //channel.assertQueue('testing123', { durable: false })

            channel.assertQueue('student_added', { durable: false })
            channel.assertQueue('student_updated', { durable: false })
            channel.assertQueue('student_deleted', { durable: false })

            const app = express()

            app.use(cors({
                origin: ["http://localhost:3000"]
            }))

            app.use(express.json())

            // channel.consume('testing123', (msg) => {
            //     //converting buffer msg into string
            //     console.log(msg.content.toString())
            // })

            channel.consume('student_added', async (msg) => {
                const eventUser: User = JSON.parse(msg.content.toString())
                const user = new User()
                //user.admin_id = parseInt(eventUser.id)
                user.admin_id = eventUser.id
                user.name = eventUser.name
                user.grade = eventUser.grade
                user.batchno = eventUser.batchno
                user.indexNo = eventUser.indexNo
                user.email = eventUser.email
                user.image = eventUser.image
                user.isDisabled = eventUser.isDisabled
                
                await studentRepository.save(user)
                console.log('New Student added')
            }, {noAck: true})

            channel.consume('student_updated', async (msg) => {
                const eventUser: User = JSON.parse(msg.content.toString())
                const user = await studentRepository.findOneOrFail({admin_id: 
                    //parseInt(eventUser.id)
                    eventUser.id
                });
                studentRepository.merge(user, {
                    name : eventUser.name,
                    grade : eventUser.grade,
                    batchno : eventUser.batchno,
                    indexNo : eventUser.indexNo,
                    email : eventUser.email,
                    image : eventUser.image,
                    isDisabled : eventUser.isDisabled
                })
                await studentRepository.save(user)
                console.log('Student updated')
            }, {noAck: true})




            channel.consume('student_deleted', async (msg) => {
                const admin_id = parseInt(msg.content.toString())
                await studentRepository.delete({admin_id})
                console.log('Student deleted')
            })


            app.get('/api/users', async (req: Request, res: Response) => {
                const users = await studentRepository.find()
                return res.send(users)
            })

            app.post('/api/users/:id/disable', async (req: Request, res: Response) => {
                const user = await studentRepository.findOne(req.params.id)
                await axios.post('http://localhost:8000/api/students/${user.admin_id}/disable', {})
                if(user.isDisabled == true){
                    user.isDisabled = false
                }else{
                    user.isDisabled = true
                }
                await studentRepository.save(user)
                return res.send(user)
            });


            app.post('/api/time', async (req: Request, res: Response) => {
                const newTime = await timeRepository.create(req.body);
                const result = await timeRepository.save(newTime)

                //channel.sendToQueue('student_added', Buffer.from(JSON.stringify(result)))

                return res.send(result)

            })


            console.log('Listening to post 8001')
            app.listen(8001)

            //Closing the rabbitmq connection
            process.on('beforeExit', () => {
                console.log('closing')
                connection.close()
            })
        })
    })



})