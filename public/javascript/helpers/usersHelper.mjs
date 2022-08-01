import { changeReadyStatus } from "../views/user.mjs";


const setReady = (users, username, ready) => {
    for (const user of users) {
        if(user.username === username){
            user.ready = ready;
        }
        changeReadyStatus({username: user.username, ready: user.ready});
    }
    return users;
}

const toggleReady = (users, username, ready) => {
    for (const user of users) {
        if(user.username === username){
            user.ready = !ready;
        }
        changeReadyStatus({username: user.username, ready: user.ready});
    }
    return users;
}

export { setReady, toggleReady };