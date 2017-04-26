const config = require('../../config.js');
const util = require('../../lib/util.js');
const request = require('../../lib/request.js');
const api = require('../../lib/api.js');

Page({
    data: {
        // 相册列表数据
        albumList: [],

        // 图片布局列表（二维数组，由`albumList`计算而得）
        layoutList: [],

        // 布局列数
        layoutColumnSize: 3,

        // 触发了长按
        triggerLongTap: false,

        // 是否显示toast
        showToast: false,

        // 提示消息
        toastMessage: '',

        // 是否显示动作命令
        showActionsSheet: false,

        // 当前操作的图片
        imageInAction: '',

        // 图片预览模式
        previewMode: false,

        // 当前预览索引
        previewIndex: 0,
    },

    // 隐藏toast消息
    hideToast() {
        this.setData({
            showToast: false,
            toastMessage: '',
        });
    },

    // 隐藏动作列表
    hideActionSheet() {
        this.setData({
            showActionsSheet: false,
            imageInAction: '',
        });
    },

    onLoad() {
        this.renderAlbumList();

        this.getAlbumList().then((resp) => {
            if (resp.code !== 0) {
                // 图片列表加载失败
                return;
            }

            this.setData({
                'albumList': this.data.albumList.concat(resp.data),
            });

            this.renderAlbumList();
        });
    },

    // 获取相册列表
    getAlbumList() {
        let promise = request({
            method: 'GET',
            url: api.getUrl('/list'),
        });
        return promise;
    },

    // 渲染相册列表
    renderAlbumList() {
        let layoutColumnSize = this.data.layoutColumnSize;
        let layoutList = [];

        if (this.data.albumList.length) {
            layoutList = util.listToMatrix([0].concat(this.data.albumList), layoutColumnSize);

            let lastRow = layoutList[layoutList.length - 1];
            if (lastRow.length < layoutColumnSize) {
                let supplement = Array(layoutColumnSize - lastRow.length).fill(0);
                lastRow.push(...supplement);
            }
        }

        this.setData({ layoutList });
    },

    // 从相册选择照片或拍摄照片
    chooseImage() {
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],

            success: (res) => {
               wx.showNavigationBarLoading();
               wx.setNavigationBarTitle({ title: '正在上传图片…' });

                console.log(api.getUrl('/upload'));
                wx.uploadFile({
                    url: api.getUrl('/upload'),
                    filePath: res.tempFilePaths[0],
                    name: 'image',

                    success: (res) => {
                        let response = JSON.parse(res.data);

                        if (response.code === 0) {
                            console.log(response);
                            let albumList = this.data.albumList;
                            albumList.unshift(response.data.imgUrl);

                            this.setData({ albumList });
                            this.renderAlbumList();

                            this.setData({
                                showToast: true,
                                toastMessage: '图片上传成功',
                            });
                        } else {
                            console.log(response);
                        }
                    },

                    fail: (res) => {
                        console.log('fail', res);
                    },

                    complete: () => {
                        wx.hideNavigationBarLoading();
                        wx.setNavigationBarTitle({ title: config.appTitle });
                    },
                });

            },
        });
    },

    // 进入预览模式
    enterPreviewMode(event) {
        if (this.data.triggerLongTap) {
            return;
        }

        let imageUrl = event.target.dataset.src;
        let previewIndex = this.data.albumList.indexOf(imageUrl);

        this.setData({
            previewMode: true,
            previewIndex: previewIndex,
        });
    },

    // 退出预览模式
    exitPreviewMode() {
        this.setData({
            previewMode: false,
            previewIndex: 0,
        });
    },

    // 显示可操作命令
    showActions(event) {
        this.data.triggerLongTap = true;
        setTimeout(() => {
            this.data.triggerLongTap = false;
        }, 1000);

        this.setData({
            showActionsSheet: true,
            imageInAction: event.target.dataset.src,
        });
    },

    // 下载图片
    downloadImage() {
        wx.downloadFile({
            url: this.data.imageInAction,
            type: 'image',
            success: (resp) => {
                wx.saveFile({
                    tempFilePath: resp.tempFilePath,
                    success: (resp) => {
                        this.setData({
                            showToast: true,
                            toastMessage: '图片保存成功',
                        });
                    },

                    fail: (resp) => {
                        console.log('fail', resp);
                    },

                    complete: (resp) => {
                        console.log('complete', resp);
                    },
                });
            },

            fail: (resp) => {
                console.log('fail', resp);
            },
        });

        this.setData({
            showActionsSheet: false,
            imageInAction: '',
        });
    },

    // 删除图片
    deleteImage() {
        let imageUrl = this.data.imageInAction;
        let filepath = '/' + imageUrl.split('/').slice(3).join('/');

        wx.showNavigationBarLoading();
        wx.setNavigationBarTitle({ title: '正在删除图片…' });

        this.setData({
            showActionsSheet: false,
            imageInAction: '',
        });

        request({
            method: 'POST',
            url: api.getUrl('/delete'),
            data: { filepath },
        })
        .then((resp) => {
            if (resp.code !== 0) {
                // 图片删除失败
                return;
            }

            // 从图片列表中移除
            let index = this.data.albumList.indexOf(imageUrl);
            if (~index) {
                let albumList = this.data.albumList;
                albumList.splice(index, 1);

                this.setData({ albumList });
                this.renderAlbumList();
            }

            this.setData({
                showToast: true,
                toastMessage: '图片删除成功',
            });
        })
        .catch(error => {
            console.log('failed', error);
        })
        .then(() => {
            wx.hideNavigationBarLoading();
            wx.setNavigationBarTitle({ title: config.appTitle });
        });
    },
});