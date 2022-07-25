const checkExists = (rooms, name) =>{
    if(rooms.length){
        for (const room of rooms) {
            if(room.name === name){
                alert('Room with this name is already exists');
                return true;
            }
        }
    }
}

export { checkExists };