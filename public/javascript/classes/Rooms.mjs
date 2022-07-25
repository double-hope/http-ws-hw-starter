class Rooms {

    constructor(rooms) {
        this.rooms = rooms;
    }

    getRooms(){
        return this.rooms;
    }

    setRooms(rooms){
        this.rooms = rooms;
    }
    updateRooms(room){
        this.rooms.push(room);
        return this.rooms;
    }

    getRoomByName(name){
        for (const room of this.rooms) {
            if(room.name === name)
                return room;
        }
    }

}

export { Rooms };