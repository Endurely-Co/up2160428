import {LocalStorage} from 'node-localstorage';
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

const userEmail = 'user_email';
const userType = 'user_type';

function setLogIn(email){
    localStorage.setItem(userEmail, email);
}

function setUserType(type){
    localStorage.setItem(userType, type);
}

function getUserType(){
    return localStorage.getItem(userType);
}

function getLogIn(){
    return localStorage.getItem(userEmail);
}

function setLogOut(){
    localStorage.removeItem(userEmail);
}

function clear(){
    localStorage.clear();
}

export default { setLogIn, getLogIn,
    setLogOut, getUserType, setUserType, clear };
