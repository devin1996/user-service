"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var user_1 = require("./entity/user");
//importing amqlib 
var amqp = require("amqplib/callback_api");
var axios_1 = require("axios");
(0, typeorm_1.createConnection)().then(function (db) {
    //const studentRepository = db.getMongoRepository(User)
    var studentRepository = db.getRepository(user_1.User);
    amqp.connect('amqps://wmqmekbr:RCf9DHx6XLA0lpx7gk1T8OOT1x7Ax0eo@bonobo.rmq.cloudamqp.com/wmqmekbr', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            //listening to testing 123 event
            //channel.assertQueue('testing123', { durable: false })
            channel.assertQueue('student_added', { durable: false });
            channel.assertQueue('student_updated', { durable: false });
            channel.assertQueue('student_deleted', { durable: false });
            var app = express();
            app.use(cors({
                origin: ["http://localhost:3000"]
            }));
            app.use(express.json());
            // channel.consume('testing123', (msg) => {
            //     //converting buffer msg into string
            //     console.log(msg.content.toString())
            // })
            channel.consume('student_added', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                var eventUser, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventUser = JSON.parse(msg.content.toString());
                            user = new user_1.User();
                            //user.admin_id = parseInt(eventUser.id)
                            user.admin_id = eventUser.id;
                            user.name = eventUser.name;
                            user.grade = eventUser.grade;
                            user.batchno = eventUser.batchno;
                            user.indexNo = eventUser.indexNo;
                            user.email = eventUser.email;
                            user.image = eventUser.image;
                            user.isDisabled = eventUser.isDisabled;
                            return [4 /*yield*/, studentRepository.save(user)];
                        case 1:
                            _a.sent();
                            console.log('New Student added');
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume('student_updated', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                var eventUser, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventUser = JSON.parse(msg.content.toString());
                            return [4 /*yield*/, studentRepository.findOneOrFail({ admin_id: 
                                    //parseInt(eventUser.id)
                                    eventUser.id
                                })];
                        case 1:
                            user = _a.sent();
                            studentRepository.merge(user, {
                                name: eventUser.name,
                                grade: eventUser.grade,
                                batchno: eventUser.batchno,
                                indexNo: eventUser.indexNo,
                                email: eventUser.email,
                                image: eventUser.image,
                                isDisabled: eventUser.isDisabled
                            });
                            return [4 /*yield*/, studentRepository.save(user)];
                        case 2:
                            _a.sent();
                            console.log('Student updated');
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume('student_deleted', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                var admin_id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            admin_id = parseInt(msg.content.toString());
                            return [4 /*yield*/, studentRepository.delete({ admin_id: admin_id })];
                        case 1:
                            _a.sent();
                            console.log('student deleted');
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            app.get('/api/users', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var users;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, studentRepository.find()];
                        case 1:
                            users = _a.sent();
                            return [2 /*return*/, res.send(users)];
                    }
                });
            }); });
            app.post('/api/users/:id/disable', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, studentRepository.findOne(req.params.id)];
                        case 1:
                            user = _a.sent();
                            return [4 /*yield*/, axios_1.default.post('http://localhost:8000/api/students/${user.admin_id}/disable', {})];
                        case 2:
                            _a.sent();
                            if (user.isDisabled == true) {
                                user.isDisabled = false;
                            }
                            else {
                                user.isDisabled = true;
                            }
                            return [4 /*yield*/, studentRepository.save(user)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, res.send(user)];
                    }
                });
            }); });
            console.log('Listening to post 8001');
            app.listen(8001);
            //Closing the rabbitmq connection
            process.on('beforeExit', function () {
                console.log('closing');
                connection.close();
            });
        });
    });
});
