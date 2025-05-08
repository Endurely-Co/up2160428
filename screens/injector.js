// Add every api that needs to be provided here
const paths = [
    './index.js',
    './onboard.js',
    './users.js',
    './race.js'
];

// Inject all screens
async function inject(app){
    const resolvePaths = await Promise.all(paths.map(path => import(path)));
    resolvePaths.forEach(path => {
        if (path.default && typeof path.default === 'function'){
            app.use('/', path.default);
        }else{
            console.warn('Invalid route', path);
        }
    });
}


export default inject;
