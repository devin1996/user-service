"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
//importing amqlib 
var amqp = require("amqplib/callback_api");
(0, typeorm_1.createConnection)().then(function (db) {
    amqp.connect('amqps://wmqmekbr:RCf9DHx6XLA0lpx7gk1T8OOT1x7Ax0eo@bonobo.rmq.cloudamqp.com/wmqmekbr', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            //listening to testing 123 event
            channel.assertQueue('testing123', { durable: false });
            var app = express();
            app.use(cors({
                origin: ["http://localhost:3000"]
            }));
            app.use(express.json());
            channel.consume('testing123', function (msg) {
                //converting buffer msg into string
                console.log(msg.content.toString());
            });
            console.log('Listening to post 8001');
            app.listen(8001);
        });
    });
});
