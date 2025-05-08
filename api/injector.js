// Add every api that needs to be provided here
const paths = [
    './auth.js',
    './race.js'
];

// Inject all api
async function inject(app){
    const resolvePaths = await Promise.all(paths.map(path => import(path)));
    resolvePaths.forEach(path => {
        if (path.default && typeof path.default === 'function'){
            app.use('/api', path.default);
        }else{
            console.warn('Invalid route', path);
        }
    });
}

export default inject;
