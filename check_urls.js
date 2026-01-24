const https = require('https');

const urls = [
    'https://distortiondivina.vercel.app/images/distortion_logo.png',
    'https://distortiondivina.vercel.app/images/crukz4f.png',
    'https://distortiondivina.vercel.app/images/EurbXn1.png' // Check expected failure
];

urls.forEach(url => {
    https.get(url, (res) => {
        console.log(`${url}: ${res.statusCode}`);
    }).on('error', (e) => {
        console.error(`${url}: Error ${e.message}`);
    });
});
