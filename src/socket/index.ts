import { Server } from 'socket.io';
import * as config from './config';

let rooms = [];

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;

		socket.emit('UPDATE_ROOMS', rooms);

		socket.on('CREATE_ROOM', room => {
			rooms = rooms.concat(room);
			socket.emit('UPDATE_CREATED_ROOMS', room);
			socket.broadcast.emit('UPDATE_CREATED_ROOMS', room);
		})
	});
};
