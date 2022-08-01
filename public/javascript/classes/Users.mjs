class Users{
    constructor(users) {
        this.users = users;
    }

    getUsers(){
        return this.users;
    }

    setUsers(users){
        this.users = users;
    }

    updateUsers(user){
        this.users.push(user);
    }

    setUser(user){
        for (const userElement of this.users) {
            if(userElement.username === user.username)
                Object.keys(userElement).forEach((key) => {
                    userElement[key] = user[key];
                });
        }
    }

    setUserProperty(user, property, value){
        Object.keys(user).forEach((key) => {
            if(key === property) user[key] = value;
        });
        this.setUser(user);
    }
}

export { Users };