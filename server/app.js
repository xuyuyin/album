require('./globals');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const cos = require('qcloud_Cos_v5/sdk/cos');

const app = express();

app.set('query parser', 'simple');
app.set('case sensitive routing', true);
app.set('jsonp callback name', 'callback');
app.set('strict routing', true);
app.set('trust proxy', true);

app.disable('x-powered-by');

// 记录请求日志
app.use(morgan('tiny'));

// parse `application/x-www-form-urlencoded`
app.use(bodyParser.urlencoded({ extended: true }));

// parse `application/json`
app.use(bodyParser.json());

app.use(require('./middlewares/route_dispatcher'));

// 打印异常日志
process.on('uncaughtException', error => {
    console.log(error);
    console.log("异常日志");
});

// 启动server
http.createServer(app).listen(config.port, () => {
    console.log('Express server listening on port: %s', config.port);
});


// const params = {
//     Bucket : 'album/photos',    /* 必须 */
//     Region : 'cn-east',    /* 必须 */
// };
// cos.putBucket(params,(err,data)=> {
// 	if(err) {
//         console.log(err);
//     } else {
//         console.log(data);
//     }
// })

// const _params = {
//     Bucket : 'album',
//     Region : 'cn-east',
//     Key : 'kobe002.jpg'
// };

// cos.putObject(_params, function(err, data) {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log(data);
//     }
// });
