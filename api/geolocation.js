let id;

let response = {};

const options = {
    enableHighAccuracy: true,
    timeout: 3000,
    maximumAge: 500,
}

function registerLocation(){
    if(navigator.geolocation){
        id = navigator.geolocation.watchPosition(success, error, options);
    }else{
        response['error'] = "Geolocation is not supported";
    }
    return response;
}

function error(){
    response['error'] = "Error talking to your gps";
}

function success(position){
    response['cur_lat_long'] = {lat: position.coords.latitude, long: position.coords.longitude};
}

function unregisterLocation(){
    navigator.geolocation.clearWatch(id);
}

export default {
    registerLocation, unregisterLocation
}
