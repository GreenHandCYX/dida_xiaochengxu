// pages/money/money.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_balance: 0
  },
  getUserBalance: function () {
    var money = wx.getStorageSync('user_balance').toFixed(2)
    if (money.indexOf('.') === -1) {
      money = money + '.00';
    } else if (money.split('.')[1].length === 1) {
      money = money + '0';
    }
    this.setData({
      user_balance: money
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserBalance()
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
    this.getUserBalance()
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