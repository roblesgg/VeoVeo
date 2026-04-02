const https = require('https');

const url = 'https://api.expo.dev/v2/artifacts/eas/jY6Y9yLz1uV8p77vX6v6iW';

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Location:', res.headers.location);
}).on('error', (err) => {
    console.error('Error:', err.message);
});
