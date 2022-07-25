import { Server } from 'socket.io';
import * as config from './config';

let rooms: {name: string, numberOfUsers: number}[] = [];

type user = {
	username: string,
	ready: boolean,
	isCurrentUser: boolean,
}

let users: user[][] = [];

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;

		socket.emit('UPDATE_ROOMS', rooms);

		socket.on('CREATE_ROOM', (room) => {
			rooms = rooms.concat(room);
			users.push([]);
			socket.emit('UPDATE_CREATED_ROOMS', room);
			socket.broadcast.emit('UPDATE_CREATED_ROOMS', room);
		});

		socket.on('JOIN_ROOM', (name: string, user) => {
			for(let i = 0; i < rooms.length; i++){
				if(rooms[i].name == name){
					socket.emit('UPDATE_USERS', name, users[i]);
					users[i].push(user);
					socket.emit('FINISH_JOINING', name, user);
					socket.broadcast.emit('FINISH_JOINING', name, user);
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

		socket.on('CHANGE_TIMER', (timer: number)=>{
			socket.emit('SET_TIMER', timer);
			socket.broadcast.emit('SET_TIMER', timer);
		});

	});
};
