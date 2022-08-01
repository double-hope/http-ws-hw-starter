import { updateNumberOfUsersInRoom } from "./views/room.mjs";
import {appendUserElement, changeReadyStatus} from "./views/user.mjs";
import {_rooms, _users, socket, startGame, username, usersStatus, setUsersStatusInArray, SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME} from "./game.mjs";
import {READY, TIMER, USERS_WRAPPER} from "./constants.mjs";
import {addRemoveClass} from "./helpers/addRemoveClassHelper.mjs";

const finishJoining = (name, user, rooms) => {
    _rooms.setRooms(rooms);
    _users.updateUsers(user);
    _rooms.getRoomByName(name)
    updateNumberOfUsersInRoom({name: name, numberOfUsers: _rooms.getRoomByName(name).numberOfUsers});
    (user.username === username)
        ? appendUserElement({username: user.username, ready: user.ready, isCurrentUser: true})
        : appendUserElement({username: user.username, ready: user.ready, isCurrentUser: false})
}

const updateUsers = (name, users) => {
    USERS_WRAPPER.innerHTML = '';
    _users.setUsers(users);
    _users.getUsers().map(user => appendUserElement({username: user.username, ready: user.ready, isCurrentUser: false}));
}

const setUsersStatus = (status) => {
    setUsersStatusInArray(status);
    for (const user of usersStatus){
        if(!user.ready){
            addRemoveClass(TIMER, READY, 'display-none');
            return;
        }
    }
    addRemoveClass(READY, TIMER, 'display-none');
    startGame({prepareTime: SECONDS_TIMER_BEFORE_START_GAME, gameTime: SECONDS_FOR_GAME});
    socket.emit('CHOOSE_TEXT');
}

const updateStatus = (usersInRoom) => {
    for (const user of usersInRoom) {
        changeReadyStatus({username: user.username, ready: user.ready});
    }
}

export { finishJoining, updateUsers, setUsersStatus, updateStatus };