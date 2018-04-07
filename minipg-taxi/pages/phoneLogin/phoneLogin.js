var app = getApp();
const util = require('../../utils/util.js')
Page({
  data: {
    phone: '',
    codeNum: '',
    codeTime: '获取验证码',
    sentable: false
  },
  // 手机号验证登录
  signIn: function () {
    let that = this
    if (that.checkPhone()) {
      if (that.data.codeNum) {
        wx.request({
          url: app.globalData.domin + '/user/signIn?',
          data: {
            mpno: that.data.phone,
            code: that.data.codeNum,
            source_cid: app.globalData.source_cid
          },
          method: 'POST',
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function (res) {
            // console.log(res)
            if (res.data.code) {
              wx.showModal({
                title: '提示',
                showCancel: false,
                confirmText: '重试',
                confirmColor: '#ff7500',
                content: res.data.message
              })
            } else {
              // todo
              var phone = res.data.phone
              console.log(phone)
              phone = phone.substring(0, 3) + '****' + phone.substring(7, 11)
        
              app.globalData.token = res.data.access_token
              app.globalData.user_cid = res.data.cid
              app.globalData.cid = res.data.cid
              app.globalData.phone = phone
              app.globalData.avatarUrl = res.data.logourl
              wx.setStorageSync('token', res.data.access_token)
              wx.setStorageSync('user_cid', res.data.cid)
              wx.setStorageSync('cid', res.data.cid)
              wx.setStorageSync('phone', phone)
              wx.setStorageSync('avatarUrl', res.data.logourl)
              // wx.navigateBack({
              //   delta: 1
              // })
              wx.reLaunch({
                url: '../index/index'
              })
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#ff7500',
          content: '请输入验证码'
        })
      }
    }
  },
  // 获取验证码（60倒计时）
  getCode: function () {
    let that = this
    if (this.checkPhone()) {
      wx.request({
        url: app.globalData.domin + '/user/sendCode?',
        data: {
          mpno: that.data.phone
        },
        method: 'POST',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          console.log(res)
          if (res.data.code) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              confirmText: '重试',
              confirmColor: '#ff7500',
              content: res.data.message + '，获取验证码失败'
            })
          } else {
            var time = 60;
            that.setData({
              codeTime: '60秒',
              sentable: true
            })
            var timer = setInterval(function () {
              time = time - 1;
              that.setData({
                codeTime: time + "秒"
              })
              if (time <= 0) {
                clearInterval(timer);
                that.setData({
                  codeTime: '获取验证码',
                  sentable: false
                })
              }
            }, 1000);
          }

        }
      })
    }
  },
  // 验证手机号
  checkPhone: function () {
    // todo
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
    if (this.data.phone) {
      if (!(myreg.test(this.data.phone))) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          confirmText: '重新输入',
          confirmColor: '#ff7500',
          content: '手机号码输入有误,请重新输入'
        })
        return false;
      } else {
        return true;
      }
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#ff7500',
        content: '请输入手机号'
      })
      return false;
    }
  },
  toAgreement: function () {
    wx.navigateTo({
      url: '../agreement/agreement'
    })
  },
  toTreaty: function () {
    wx.navigateTo({
      url: '../treaty/treaty'
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindCodeInput: function (e) {
    this.setData({
      codeNum: e.detail.value
    })
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  onShow:function(){
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  }
})
