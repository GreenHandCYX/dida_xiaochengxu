//app.js
var util = require('utils/util.js');
var { activeEnvConfig } = require('./app.env.js');
var activeEnv = {
  config: {
    evnTitle: '嘀嗒出行(测试)',
    envApiDomin: 'https://api-test.didapinche.com',
    envWwwDomin: 'https://www-test.didapinche.com',
    envWsDomin: 'wss://ws-test.didapinche.com'
  }
}
// 部署环境
switch (activeEnvConfig.activeEnv) {
  case 'dev':
    activeEnv = require('./app.env.dev.js');
  break;
  case 'beta':
    activeEnv = require('./app.env.beta.js');
    break;
  case 'online':
    activeEnv = require('./app.env.online.js');
    break;
  }
App({
  onLaunch: function (options) {
    let that = this
    let token = wx.getStorageSync('token') || null 
    let user_cid = wx.getStorageSync('user_cid') || null
    let cid = wx.getStorageSync('cid') || null
    let openId = wx.getStorageSync('openId') || null
    if (token && openId) {
      //调用API从本地缓存中获取数据 
      that.globalData.token = token
      that.globalData.openId = openId
      that.globalData.user_cid = user_cid
      that.globalData.cid = cid
    } else {
      //没有缓存重新请求
      that.userLogin()
    }
    // that.getHomeBaseInfo()
    wx.getSystemInfo({
      success: function (res) {
        var isAndroid = res.system.indexOf('Android') > -1 || res.system.indexOf('Adr') > -1;
        if(isAndroid) {
          isAndroid = 2;
        } else {
          isAndroid = 1;
        }
        that.globalData.deviceInfo = {
          "screen": res.screenWidth + '*' + res.screenHeight,
          "os": res.system,
          "model":res.brand,
          "screenWidth": res.screenWidth,
          "screenHeight": res.screenHeight,
          "mobileType":isAndroid
        }
      }
    })
  },
  onShow: function (options) {
    wx.setNavigationBarTitle({
      title: activeEnv.config.evnTitle
    })
    let that = this
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        that.globalData.openId = wx.getStorageSync('openId')
        that.globalData.session = wx.getStorageSync('session')
      },
      fail: function () {
        //登录态过期
        that.userLogin()//重新登录
      }
    })
  },
  userLogin: function () {
    let that = this
    wx.login({
      success: function (res) {
        var code = res.code;
        if (code) {
          wx.request({
            url: that.globalData.domin+'/user/login/weixin/code2session',
            data: {
              code: code,
              source_cid: that.globalData.source_cid
            },
            method:'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' 
            },
            success: function (res) {
              if(res.data.code){
                wx.showModal({
                  title: '提示',
                  showCancel: false,
                  confirmText: '确认',
                  confirmColor: '#ff7500',
                  content: res.data.message
                })
              }else{
                that.globalData.openId = res.data.openid
                that.globalData.session = res.data.trd_session
                /*wx.setStorageSync('openId', res.data.openid) */
                util.dida_setStorageSync('openId', res.data.openid, 1)
                wx.setStorageSync('session', res.data.trd_session) 
              }
                // if ( res.data.code === 1741){
                //   console.log(res)
                //   wx.showModal({
                //     title: '提示',
                //     showCancel: false,
                //     confirmText: '确认',
                //     content: res.data.message,
                //     success: function (res) {
                //       // that.userLogin()
                //     }
                //   })
                //   return false
                // }
            },
            fail:function(res){
              wx.showModal({
                title: '提示',
                showCancel: false,
                confirmText: '确认',
                confirmColor: '#ff7500',
                content: res.data,
                success: function (res) {
                  // that.userLogin()
                }
              })
            }
          })
        } else {
          // console.log('获取用户登录态失败：' + res.errMsg);
        }
      },
      fail: function (res) {
        // console.log('获取用户登录态失败：' + res.errMsg);
      }
    })
  },  
  getHomeBaseInfo() {
    var that = this;
    var url = this.globalData.domin + '/passengertaxi/getHomeBaseInfo'
  
    util.dida_wxrequest({ url: url,thisObj:that}).then(res => {
      if(res.data.info.taxi_enable==0){
        wx.redirectTo({
          url: '/pages/notyetcity/notyetcity?url=' + res.data.info.taxi_will_open_url,
        })
      }
    },rej=>{
     return 123;
    })
  },
  globalData: {
    phone:null,
    source_cid:'minipg_chuxing',
    baseUrl:'',
    apk:'GOv9Zcv2e8nGkveoRojGeKwUkIKTTVy0',
    session: '',
    token: '',
    iv: null,
    nickName: null,
    avatarUrl: null,
    openId: null,
    cid: '',
    user_cid:'',
    isAndroid: null,
    title: activeEnv.config.evnTitle,
    domin: activeEnv.config.envApiDomin,
    WwwDomin: activeEnv.config.envWwwDomin,
    WsDomin: activeEnv.config.envWsDomin,
    deviceInfo:''
  }
})
