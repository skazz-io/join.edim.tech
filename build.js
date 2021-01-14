const fs = require('fs');

const copyFileCallback = (err) => {
    if (err) { 
        if ( err.code == 'ENOENT') { 
            console.log('File does not exist (try npm install):' + err.path)
        } else {
            console.log(err);
        }
    }
}

fs.mkdir('src/modules', (err) => {
    if (err && err.code != 'EEXIST') throw err;

    fs.copyFile('./node_modules/particles.js/particles.js', 'src/modules/particles.js', copyFileCallback);
})
