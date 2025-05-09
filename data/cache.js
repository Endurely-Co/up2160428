import {LocalStorage} from 'node-localstorage';
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

const userEmail = 'user_email';
const userType = 'user_type';

let storage = {
    email : null,
    userType : null
}

function setLogIn(email){
    storage.email = email;
    //localStorage.setItem(userEmail, email);
}

function setUserType(type){
    //localStorage.setItem(userType, type);
    storage.userType = type;
}

function getUserType(){
    //return localStorage.getItem(userType);
    return storage.userType;
}

function getLogIn(){
    //return localStorage.getItem(userEmail);
    return storage.email;
}

function setLogOut(){
    clear();
}

function clear(){
    storage.email = null;
    storage.userType = null;
}

export default { setLogIn, getLogIn,
    setLogOut, getUserType, setUserType, clear };
