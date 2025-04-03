// Add every api that needs to be provided here
const paths = [
    require('./index'),
    require('./onboard'),
    require('./users'),
    require('./race'),
];

// Inject all api screens
function inject(app){
    paths.forEach(path => {
        if (typeof path === 'function'){
            app.use('/', path);
        }else{
            console.warn('Invalid route', path);
        }
    });
}


module.exports = {inject};
