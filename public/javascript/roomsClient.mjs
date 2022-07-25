import {appendRoomElement} from "./views/room.mjs";
import {Rooms} from "./classes/classes.mjs";
import {joinRoom} from "./game.mjs";

const _rooms = new Rooms([])

const updateCreated = room => {
    _rooms.updateRooms(room);
    appendRoomElement(
        {name: room.name,
            numberOfUsers: room.numberOfUsers,
            onJoin: joinRoom});
}

export { updateCreated };