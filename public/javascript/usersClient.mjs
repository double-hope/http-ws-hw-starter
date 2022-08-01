import { updateNumberOfUsersInRoom } from "./views/room.mjs";
import { appendUserElement } from "./views/user.mjs";
import { _rooms, _users, username } from "./game.mjs";
import {USERS_WRAPPER} from "./constants.mjs";

const finishJoining = (name, user) => {
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

export { finishJoining, updateUsers };