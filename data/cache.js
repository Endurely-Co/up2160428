
const { LocalStorage } = require('node-localstorage');
const {createNewRace} = require("./queries");
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

const userEmail = 'user_email'

function setLogIn(email){
    localStorage.setItem(userEmail, email);
}

function getLogIn() : String{
    return localStorage.getItem(userEmail);
}

function setLogOut(){
    localStorage.removeItem(userEmail);
}

module.exports = {
    setLogIn, getLogIn, setLogOut
}
