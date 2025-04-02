// Add every api that needs to be provided here
const paths = [
    require('./auth')
];

// Inject all api screens
function inject(app){
    paths.forEach(path => {
        if (typeof path === 'function'){
            app.use('/api', path);
        }else{
            console.warn('Invalid route', path);
        }
    });
}

module.exports = {inject};
