const {showToast} = require('./toast');

const form = document.getElementById('createSignInForm');
const signupBtn = document.getElementById('signupBtn');
const toast = document.getElementById('toast');
const status = "<%= status%>";

function checkLogin(){
    fetch('/api/check-login', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json())
        .then((data) => {
            if(data.error){
                showToast("", "error");
            }else{
                const curPath = window.location.pathname;
                if(data.redirect_url !== curPath){
                    window.location.href = data.redirect_url;
                }
            }
        }).catch((err) => {
        console.log('User not logged in', 'error');
    });
}


document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
});

signupBtn.addEventListener('click', () => {
    window.location.href = '/signup';
});

if(status === 'success'){
    showToast('Successfully signed up.', status);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            return response.json()
        })
        .then(data =>{
            if(data.error){
                showToast(data.error, 'error');
            }else{
                window.location.href =data.redirectUrl;
                form.reset();
            }
        })
        .catch(err =>{
            showToast('An unexpected error occurred!', 'error');
        });
});
