//coupon.js
const util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
  }, 
  onLoad: function (options) {
    var that = this
    that.setData({
    })
  },
  onShow:function(){
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  }
})