const _ = require('lodash');
const http = require('http');
const path = require('path');
const RouterBase = require('../../../common/routerbase');
const config = require('../../../config');
// const cos = require('../../../services/cos');
const cos = require('qcloud_Cos_v5/sdk/cos');
// const crypto = require('crypto');
// const qcloud = require('qcloud_cos');

class ListImages extends RouterBase {
    handle() {
        const bucket = config.cosFileBucket;
        const listPath = '/photos/';
        const listNum = 100;
        const pattern = 'eListFileOnly';
        const order = 1;
        const context = '';

        // cos.list(bucket, listPath, listNum, pattern, order, context, (res) => {
        //     console.log(res);
        //     if (res.code !== 0) {
        //         this.res.json({ code: -1, msg: 'failed', data: {} });
        //         return;
        //     }

        //     this.res.json({
        //         code: 0,
        //         msg: 'ok',
        //         data: _.map(res.data.infos, 'access_url').filter(item => {
        //             // 只返回`jpg/png`后缀图片
        //             return ['.jpg', '.png'].includes(path.extname(item));
        //         }),
        //     });
        // });

        const params = {
            Bucket : config.cosFileBucket,
            Region : 'sh',
            Appid : config.cosAppid,
            SecretId : config.cosSecretId,
            SecretKey : config.cosSecretKey
        }

        cos.getService(params,(err,data)=> {
            if (err) {
                console.log(err)
            } else {
                console.log(data);
            }
        })

        // cos.getBucket(params,(err,data)=> {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(data);
        //         // if (res.code !== 0) {
        //         //     this.res.json({ code: -1, msg: 'failed', data: {} });
        //         //     return;
        //         // }

        //         // this.res.json({
        //         //     code: 0,
        //         //     msg: 'ok',
        //         //     data: _.map(res.data.infos, 'access_url').filter(item => {
        //         //         // 只返回`jpg/png`后缀图片
        //         //         return ['.jpg', '.png'].includes(path.extname(item));
        //         //     }),
        //         // });
        //     }
        // },(res)=> {
        //     console.log(res);
        // },'xiangce','photos')
    }
}

module.exports = ListImages.makeRouteHandler();