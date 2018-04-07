// pages/myHome/myHome.js
var app = getApp();
const util = require('../../utils/util.js')
Page({
  data: {
    moneyClicktag: 0,
    routeClicktag: 0,
    myCouponClicktag: 0,
    avatarUrl: wx.getStorageSync('avatarUrl') || null,
    userPhone: wx.getStorageSync('phone') || '',
    average_score: 0,//todo
    user_balance: 0,
    signoutText: '退出登录'
  },
  // 退出登录
  signout: function () {
    // wx.removeStorageSync('token')
    // wx.removeStorageSync('openId')
    // wx.removeStorageSync('user_cid')
    // wx.removeStorageSync('cid')
    // wx.removeStorageSync('phone')
    // wx.removeStorageSync('avatarUrl')
    // wx.removeStorageSync('realunitprice')
    // wx.removeStorageSync('unitcost')
    // wx.removeStorageSync('title')
    // wx.removeStorageSync('order_value_min')
    // wx.removeStorageSync('id')
    // wx.removeStorageSync('user_balance')
    util.dida_setStorageSync('region', wx.getStorageSync('region'), 1)
    util.dida_setStorageSync('hasPrice', wx.getStorageSync('hasPrice'), 1)
    util.dida_setStorageSync('curLoc', wx.getStorageSync('curLoc'), 1)
    util.dida_setStorageSync('visitedLocs', wx.getStorageSync('visitedLocs'), 1)
    util.dida_setStorageSync('single_price', wx.getStorageSync('single_price'), 1)
    util.dida_setStorageSync('showCallBtn', wx.getStorageSync('showCallBtn'), 1)
    util.dida_setStorageSync('nowStart', wx.getStorageSync('nowStart'), 1)
    util.dida_setStorageSync('startDetail', wx.getStorageSync('startDetail'), 1)
    util.dida_setStorageSync('nowEnd', wx.getStorageSync('nowEnd'), 1)
    util.dida_setStorageSync('endDetail', wx.getStorageSync('endDetail'), 1)
    util.dida_clearStorageSync()
    util.dida_removeStorageSync('session');
  
    app.globalData.token = ''
    app.globalData.cid = ''
    app.globalData.user_cid = ''
    app.globalData.session = ''
    wx.redirectTo({
      url: '../login/login'
    })
  },
  gotoMoney: function () {
    var that = this
    if (that.data.moneyClicktag === 0) {
      that.setData({
        moneyClicktag: 1
      })
      wx.navigateTo({
        url: '../money/money?user_balance=' + this.data.user_balance
      })
      setTimeout(function () {
        that.setData({
          moneyClicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
  },
  gotoRoute: function () {
    var that = this
    if (that.data.routeClicktag === 0) {
      that.setData({
        routeClicktag: 1
      })
      wx.navigateTo({
        url: '../route/route'
      })
      setTimeout(function () {
        that.setData({
          routeClicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
  },
  gotoCoupon: function () {
    var that = this
    if (that.data.myCouponClicktag === 0) {
      that.setData({
        myCouponClicktag: 1
      })
      wx.navigateTo({
        url: '../myCoupon/myCoupon'
      })
      setTimeout(function () {
        that.setData({
          myCouponClicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 获取用户余额和分数
  getUserInfo: function () {
    var that = this
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getUserInfo?',
      data: {
        user_cid: app.globalData.user_cid
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
      }
    }).then(success => {
      console.log(success)
      //成功回调
      var average_score = parseFloat(success.data.info.average_score).toFixed(1)
      that.setData({
        average_score:average_score,
        user_balance: success.data.info.user_balance
      })
      wx.setStorageSync('user_balance', success.data.info.user_balance)
    }, fail => {
      //失败回调
       // todo
    });
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
    this.setData({
      avatarUrl: wx.getStorageSync('avatarUrl') || '',
      userPhone: wx.getStorageSync('phone') || '',
    })
    this.getUserInfo()
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