import {showInputModal} from './views/modal.mjs';
import {appendRoomElement} from './views/room.mjs';

let _rooms = [];

const username = sessionStorage.getItem('username');
const createRoom = document.getElementById('add-room-btn');
let _name = '';

const socket = io('', { query: { username } });

if (!username) {
	window.location.replace('/login');
}

createRoom.addEventListener('click', ()=>{
	showInputModal({title: 'Create room', onChange: roomName, onSubmit: submit})
});

const roomName = (name) =>{
	_name = name;
}

const submit = () =>{
	if(!_name){
		alert('Enter room name');
		return;
	}
	const room = {
		name: _name,
		numberOfUsers: 1,
	}
	socket.emit('CREATE_ROOM', room);
}

const updateRooms = rooms => {
	_rooms = rooms;
	_rooms.map(room => appendRoomElement({name: room.name, numberOfUsers: room.numberOfUsers}));
}

const updateCreated = room => {
	appendRoomElement({name: room.name, numberOfUsers: room.numberOfUsers});
}

socket.on('UPDATE_CREATED_ROOMS', updateCreated);
socket.on('UPDATE_ROOMS', updateRooms);