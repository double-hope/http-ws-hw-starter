import { showInputModal } from './views/modal.mjs';
import {appendRoomElement, updateNumberOfUsersInRoom} from './views/room.mjs';
import { checkExists } from './helpers/checkHelper.mjs';
import {appendUserElement, changeReadyStatus} from "./views/user.mjs";
import {setReady, toggleReady} from "./helpers/usersHelper.mjs";
import { Rooms, Users } from './classes/classes.mjs';
import {addRemoveClass} from "./helpers/addRemoveClassHelper.mjs";
import {addClass, removeClass} from "./helpers/domHelper.mjs";


let _rooms = new Rooms([]);
let _users = new Users([]);
let _timer = 5;
let usersStatus = [];

const username = sessionStorage.getItem('username');
const CREATE_ROOM = document.getElementById('add-room-btn');
const ROOMS_PAGE = document.getElementById('rooms-page');
const GAME_PAGE = document.getElementById('game-page');
const ROOM_NAME = document.getElementById('room-name');
const BACK_TO_ROOMS = document.getElementById('quit-room-btn');
let READY = document.getElementById('ready-btn');

let _name = '';
let currentRoomName = '';

const socket = io('', { query: { username } });

if (!username) {
	window.location.replace('/login');
}

CREATE_ROOM.addEventListener('click', ()=>{
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

	if(checkExists(_rooms.getRooms(), _name))
		return;

	const room = {
		name: _name,
		numberOfUsers: 0,
	}

	socket.emit('CREATE_ROOM', room);
	joinRoom(room.name)
}

const updateRooms = rooms => {
	_rooms.setRooms(rooms);
	_rooms.getRooms().map(room => appendRoomElement(
		{name: room.name,
			numberOfUsers: room.numberOfUsers,
			onJoin: joinRoom}));
}

const updateCreated = room => {
	_rooms.updateRooms(room);
	appendRoomElement(
		{name: room.name,
			numberOfUsers: room.numberOfUsers,
			onJoin: joinRoom});
}

const joinRoom = (name = '') => {

	addRemoveClass(document.getElementById('timer'), READY, 'display-none'); // DELETE LATER

	const user ={
		username: username,
		ready: false,
	}

	if(event.currentTarget.hasAttribute('data-room-name'))
		name = event.currentTarget.getAttribute('data-room-name');

	ROOM_NAME.innerText = name;
	currentRoomName = name;
	socket.emit('JOIN_ROOM', name, user);

	addRemoveClass(ROOMS_PAGE, GAME_PAGE, 'display-none');

	BACK_TO_ROOMS.addEventListener('click', ()=>{
		addRemoveClass(GAME_PAGE, ROOMS_PAGE, 'display-none');
		_users.getUsers().map(user => {
			if(user.username === username){
				setReady(_users.getUsers(), username, false);
				_users.setUserProperty(user, 'ready', user.ready);
			}
		})
		const filteredUsers = _users.getUsers().filter(user => user.username !== username);
		socket.emit('SET_USERS', name, filteredUsers);
	});
}


const finishJoining = (name, user) => {
	READY = document.getElementById('ready-btn');
	_users.updateUsers(user);
	_rooms.getRoomByName(name)
	updateNumberOfUsersInRoom({name: name, numberOfUsers: _rooms.getRoomByName(name).numberOfUsers});
	(user.username === username)
		? appendUserElement({username: user.username, ready: user.ready, isCurrentUser: true})
		: appendUserElement({username: user.username, ready: user.ready, isCurrentUser: false})
}

const updateUsers = (name, users) => {
	const usersWrapper = document.getElementById('users-wrapper');
	usersWrapper.innerHTML = '';
	_users.setUsers(users);
	_users.getUsers().map(user => appendUserElement({username: user.username, ready: user.ready, isCurrentUser: false}));
}

READY.addEventListener('click', ()=>{

	for (const user of _users.getUsers()) {
		if(user.username === username){

			toggleReady(_users.getUsers(), username, user.ready);
			_users.setUserProperty(user, 'ready', user.ready);
			(user.ready)
				? READY.innerText = 'NOT READY'
				: READY.innerText = 'READY'

			socket.emit('UPDATE_USER_STATUS', user);
		}
	}
	socket.emit('GET_USERS_STATUS', currentRoomName);

});

const updateStatus = (usersInRoom) => {
	for (const user of usersInRoom) {
		changeReadyStatus({username: user.username, ready: user.ready});
	}
}

const setUsersStatus = (status) => {
	usersStatus = status;
	for (const user of usersStatus){
		if(!user.ready){
			addRemoveClass(document.getElementById('timer'), READY, 'display-none');
			return;
		}
	}
	addRemoveClass(READY, document.getElementById('timer'), 'display-none');

	_timer = 5;

	let timerId = setInterval(() => {
		_timer--;
		socket.emit('CHANGE_TIMER', _timer)
	}, 1000);

	setTimeout(() => { clearInterval(timerId); }, 5000);

}

const setTimer = (time) =>{
	_timer = time;
	const timer = document.getElementById('timer');
	timer.innerText = time;
}


socket.on('SET_TIMER', setTimer);
socket.on('SEND_USERS_STATUS', setUsersStatus);
socket.on('SHOW_USER_STATUS', updateStatus);
socket.on('UPDATE_USERS', updateUsers);
socket.on('UPDATE_ROOMS', updateRooms);
socket.on('UPDATE_CREATED_ROOMS', updateCreated);
socket.on('FINISH_JOINING', finishJoining);