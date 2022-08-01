import {appendRoomElement} from "./views/room.mjs";
import {joinRoom, _rooms, _users} from "./game.mjs";

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

export { updateRooms, updateCreated };