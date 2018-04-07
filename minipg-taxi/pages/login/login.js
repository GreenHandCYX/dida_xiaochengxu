// pages/login/login.js
var app = getApp()
Page({
  data: {
comefrom:''
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
  gotoPhoneLogin: function() {
    wx.navigateTo({
      url: '../phoneLogin/phoneLogin'
    })
  },
  // 微信直接登录
  loginByPhone: function (e) {
    let that = this
    let iv = e.detail.iv
    let enData = e.detail.encryptedData

    if (e.detail.errMsg === 'getPhoneNumber:ok'){
      console.log(wx.getStorageSync('session'))
      wx.checkSession({
        success: function () {
          console.log('session 未过期')
          //session 未过期，并且在本生命周期一直有效
          if (wx.getStorageSync('session')){
          wx.request({
            url: app.globalData.domin + '/user/login/minipg?',
            data: {
              encryptData: enData,
              iv: iv,
              trd_session: wx.getStorageSync('session'),
              source_cid: app.globalData.source_cid
            },
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function (res) {
              console.log(res)
              if (res.data.code) {
                if (res.data.code === 109) {
                  wx.setStorageSync('regetSession', true)
                  app.userLogin()//重新登录
                  return false
                }
                wx.showModal({
                  title: res.data.code + '',
                  showCancel: false,
                  confirmText: '关闭',
                  confirmColor: '#ff7500',
                  content: res.data.message
                })
              } else if (res.data.code === 0) {
                console.log(res)
                app.globalData.token = res.data.access_token
                app.globalData.user_cid = res.data.user_cid
                app.globalData.cid = res.data.user_cid
                app.globalData.phone = res.data.phone
                app.globalData.avatarUrl = res.data.logourl
                wx.setStorageSync('token', res.data.access_token)
                wx.setStorageSync('user_cid', res.data.user_cid)
                wx.setStorageSync('cid', res.data.user_cid)
                wx.setStorageSync('phone', res.data.phone)
                wx.setStorageSync('avatarUrl', res.data.logourl)
                wx.reLaunch({
                  url: '/pages/index/index',
                })
                // wx.navigateBack({
                //   delta: 1
                // })
              }

            }
          })
          }else{
            // 账号被顶
            console.log(' 账号被顶重新登录')
            app.userLogin()//重新登录
          }
        },
        fail: function () {
          //登录态过期
          console.log(' 登录态过期')
          app.userLogin()//重新登录
        }
      })
    }else{
      console.log(e.detail.errMsg)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var pages = getCurrentPages();
    // var prevPage = pages[pages.length - 2];
    // console.log(pages)
    // console.log(prevPage)
    // this.setData({
    //   comefrom: options.from
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})