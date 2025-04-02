
function showToast(message, type){
    toast.textContent = message;
    if(type === 'success'){
        toast.style.backgroundColor = 'green';
    }else{
        toast.style.backgroundColor = 'red';
    }
    toast.className = 'toast show';

    setTimeout((event) => {
        toast.className = 'toast';
    }, 3000);
}

module.exports = {showToast }
