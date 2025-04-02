const {showToast} = require('./toast')

const form = document.getElementById('createUserForm')
const toastView = document.getElementById('toast');


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userType = document.querySelector('input[name=userType]:checked');

    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        user_type: userType.value,
    }
    fetch('/api/create_user', {
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
                // showToast('User added successfully',
                //     'success '+ data.redirectUrl);
               // window.location.href =data.redirectUrl;
                form.reset();
            }
        })
        .catch(err =>{
            showToast('An unexpected error occurred!', 'error');
        });
});
