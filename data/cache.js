
const { LocalStorage } = require('node-localstorage');
const {createNewRace} = require("./queries");
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

const userEmail = 'user_email'

function setLogIn(email){
    localStorage.setItem(userEmail, email);
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

module.exports = {
    setLogIn, getLogIn, setLogOut, clear
}
