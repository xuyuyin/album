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
        const params = {
            Bucket : config.cosFileBucket,
            Region : 'cn-east'
        }

        cos.getBucket(params,(err,res)=> {
            if (err) {
                this.res.json({ code: -1, msg: 'failed', data: {} });
                return;
            }

            let tmp_data = _.map(res.Contents).filter(item=> {
                return ['.jpg','.png'].includes(path.extname(item.Key))
            })

            let _data = _.map(tmp_data,value=> {
                let params = {
                    Bucket : config.cosFileBucket,
                    Region : 'cn-east',
                    Key: value.Key,
                    Output: 'http://album-1253543070.cn-east.myqcloud.com'
                }

                cos.getObject(params,(err,res)=> {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                    }
                })
            })

            this.res.json({
                code: 0,
                msg: 'ok',
                data: _.map(res.Contents).filter(item => {
                    console.log(item.Key);
                    // 只返回`jpg/png`后缀图片
                    return ['.jpg', '.png'].includes(path.extname(item.Key));
                }),
            });
        })
    }
}

module.exports = ListImages.makeRouteHandler();