import {showInputModal, showResultsModal} from './views/modal.mjs';
import { checkExists, addRemoveClass, removeClass, setReady, toggleReady } from './helpers/helpers.mjs';
import {changeReadyStatus, removeUserElement, setProgress} from './views/user.mjs';
import { Rooms, Users, Progress } from './classes/classes.mjs';
import { updateRooms, updateCreated } from './roomsClient.mjs';
import { finishJoining, updateUsers } from './usersClient.mjs';
import {
	CREATE_ROOM,
	ROOM_NAME,
	GAME_PAGE,
	ROOMS_PAGE,
	BACK_TO_ROOMS,
	READY,
	TIMER,
	GAME_TIMER,
	TEXT
} from './constants.mjs';

export let _rooms = new Rooms([]);
export let _users = new Users([]);
export let _progress = new Progress([]);

let _timer = 5;
let usersStatus = [];
let thisText = '';
let rightLetters = 0;

export const username = sessionStorage.getItem('username');
let isGame = false;

let _name = '';
let currentRoomName = '';

export const socket = io('', { query: { username } });

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

export const joinRoom = (name = '') => {

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
		socket.emit('REMOVE_USER_ELEMENT', username);
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
			addRemoveClass(TIMER, READY, 'display-none');
			return;
		}
	}
	addRemoveClass(READY, TIMER, 'display-none');
	startGame({prepareTime: 5, gameTime: 40});
	socket.emit('CHOOSE_TEXT');
}

const startGame = ({prepareTime, gameTime}) => {

	_timer = prepareTime;

	new Promise((resolve, reject)=> {
		setTimeout(() => {
			clearInterval(timerTimer);
			const textContainer = document.getElementById('text-container');
			addRemoveClass(TIMER, textContainer, 'display-none');
			removeClass(GAME_TIMER, 'display-none');
			resolve();
		}, prepareTime * 1000);
	}).then(()=>{
		_timer = gameTime + 1;
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				clearInterval(timerGame);
				resolve();
			}, gameTime * 1000);
		}).then(() => {
			const progress = [];
			_progress.filterProgress().map(p => progress.push(p.username));
			showResultsModal({usersSortedArray: progress});
		})
	})

	let timerTimer = setInterval(() => {
		socket.emit('CHANGE_TIMER', _timer, 'timer')
	}, 1000);

	let timerGame = setInterval(() => {
		socket.emit('CHANGE_TIMER', _timer, 'game-timer-seconds')
	}, 1000);

}

const setTimer = (time, timerName) =>{
	_timer = time;
	const timer = document.getElementById(timerName);
	timer.innerText = time;
}

const setText = (text) => {
	TEXT.innerText = text;
	isGame = true;
	thisText = text;
}

document.addEventListener('keydown', (event) => {
	if(isGame){
		let textArray = thisText.split('');
		if(textArray[rightLetters] === event.key){
			rightLetters++;
			const progress = (rightLetters * 100) / thisText.length;
			TEXT.innerHTML ='<span class="highlighting">' + thisText.substring(0, rightLetters) + '</span>' + thisText.substring(rightLetters, thisText.length);
			socket.emit('CHANGE_PROGRESS', username, progress);
		}
	}
});

const setUserProgress = (user, progress, progresses) => {
	_progress.setProgress(progresses);
	setProgress({username: user, progress: progress});
};

const removeUser = (username) => {
	removeUserElement(username);
}


socket.on('SET_TIMER', setTimer);
socket.on('SEND_USERS_STATUS', setUsersStatus);
socket.on('SHOW_USER_STATUS', updateStatus);
socket.on('UPDATE_USERS', updateUsers);
socket.on('UPDATE_ROOMS', updateRooms);
socket.on('UPDATE_CREATED_ROOMS', updateCreated);
socket.on('FINISH_JOINING', finishJoining);
socket.on('SET_TEXT', setText);
socket.on('CONFIRM_CHANGE_PROGRESS', setUserProgress);
socket.on('FINISH_REMOVING_USER', removeUser);