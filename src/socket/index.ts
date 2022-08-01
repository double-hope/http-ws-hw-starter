import { Server } from 'socket.io';
import {texts} from "../data";
import {MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME} from "./config";

let rooms: {name: string, numberOfUsers: number}[] = [];

type user = {
	username: string,
	ready: boolean,
	isCurrentUser: boolean,
}

let users: user[][] = [];

type progress = {
	username: string,
	progress: number,
}

let progresses: progress[][] = [];

export default (io: Server) => {
	io.on('connection', socket => {

		rooms = rooms.filter(room => (room.numberOfUsers < MAXIMUM_USERS_FOR_ONE_ROOM && room.numberOfUsers > 0));

		socket.emit('SETUP', SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME);

		socket.emit('UPDATE_ROOMS', rooms);

		socket.on('CREATE_ROOM', (room) => {
			rooms = rooms.concat(room);
			users.push([]);
			progresses.push([]);
			socket.emit('UPDATE_CREATED_ROOMS', room);
			socket.broadcast.emit('UPDATE_CREATED_ROOMS', room);
		});

		socket.on('JOIN_ROOM', (name: string, user) => {
			for(let i = 0; i < rooms.length; i++){
				if(rooms[i].name == name){
					rooms[i].numberOfUsers += 1;
					socket.emit('UPDATE_USERS', name, users[i]);
					users[i].push(user);
					progresses[i].push({username: user.username, progress: 0});
					socket.emit('FINISH_JOINING', name, user, rooms);
					socket.broadcast.emit('FINISH_JOINING', name, user, rooms);
					break;
				}
			}
		});

		socket.on('SET_USERS', (name, _users) =>{
			for(let i = 0; i < rooms.length; i++){
				if(rooms[i].name == name){
					users[i] = _users;
					break;
				}
			}
		});

		socket.on('UPDATE_USER_STATUS', (user) => {
			let room: number = 0;
			for(let i = 0; i < users.length; i++){
				for(let j = 0; j < users[i].length; j++){
					if (users[i][j].username === user.username){
						users[i][j].ready = user.ready;
						room = i;
					}
				}
			}
			socket.emit('SHOW_USER_STATUS', users[room]);
			socket.broadcast.emit('SHOW_USER_STATUS', users[room]);
		});

		socket.on('GET_USERS_STATUS', (roomName: string) => {
			for(let i = 0; i < rooms.length; i++)
				if(rooms[i].name === roomName){
					socket.emit('SEND_USERS_STATUS', users[i]);
					socket.broadcast.emit('SEND_USERS_STATUS', users[i]);
				}
		});

		socket.on('CHANGE_TIMER', (timer: number, timerName: String)=>{
			timer--;
			socket.emit('SET_TIMER', timer, timerName);
		});
		
		socket.on('CHOOSE_TEXT', ()=>{
			const random = Math.floor(Math.random() * texts.length);
			socket.emit('SET_TEXT', texts[random]);
			socket.broadcast.emit('SET_TEXT', texts[random]);
		});

		socket.on('CHANGE_PROGRESS', (username: string, progress: number) => {
			for (let i = 0; i < progresses.length; i++) {
				for(const userProgress of progresses[i]){
					if(userProgress.username === username) {
						userProgress.progress = progress;
						socket.emit('CONFIRM_CHANGE_PROGRESS', username, progress, progresses[i]);
						socket.broadcast.emit('CONFIRM_CHANGE_PROGRESS', username, progress, progresses[i]);
					}
				}
			}
		});
		socket.on('REMOVE_USER_ELEMENT', (roomName: string, username: string) => {
			let _room;
			for(const room of rooms){
				if(room.name === roomName){
					room.numberOfUsers -= 1;
					_room = room;
					if(room.numberOfUsers === 0){
						rooms.filter(r => r.name != room.name);
						socket.emit('FINISH_REMOVING_ROOM', room);
						socket.broadcast.emit('FINISH_REMOVING_ROOM', room);
						break;
					}
				}
			}
			socket.emit('FINISH_REMOVING_USER', username, _room);
			socket.broadcast.emit('FINISH_REMOVING_USER', username, _room);
		});

	});
};
