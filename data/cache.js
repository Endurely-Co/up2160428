import {LocalStorage} from 'node-localstorage';
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

const userEmail = 'user_email';
const userType = 'user_type';

function setLogIn(email){
    // const userEmail = getLogIn();
    // if(userEmail !== email){
    //     localStorage.removeItem(userEmail);
    // }
    localStorage.setItem(userEmail, email);
}

function setUserType(type){
    // const userType = getUserType(type);
    // if(userType !== type){
    //     localStorage.removeItem(userType);
    // }
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
