function post(url, data) {
    return  fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
    })
}

function get(url) {
    return  fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

module.exports = {post, get};
