var app = getApp();
var utils = require('../../utils/util.js')

// pages/reason/reason.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectReason: '',
    showExtraInp: false,
    textVal: '',
    radioVal: ''
  },
  showExtra() {
    this.setData({
      showExtraInp: true
    })
  },
  inputVal(e) {

    this.setData({
      textVal: e.detail.value,
      radioVal: ''
    })
  },
  radiochange(e) {
    this.setData({
      showExtraInp: false,
      radioVal: e.detail.value,
      textVal: ''
    })
  },
  submitReason() {
    var that = this
    console.log(this.data.textVal)
    var data = {
      user_cid: app.globalData.user_cid,
      taxi_ride_id: that.data.taxi_ride_id,
      reason: this.data.textVal || this.data.radioVal
    }
    if (!this.data.textVal && !this.data.radioVal) {
      wx.showModal({
        title: '提示',
        content: '请选择取消原因',
        confirmColor: '#ff7500'
      })
      return false
    }

    console.log(data)
    utils.dida_wxrequest({ url: app.globalData.domin + '/passengertaxi/setCancelReason', method: 'POST', data: data }).then((res) => {

      if (res.data.code) {
        wx.showModal({
          title: '提示',
          content: res.data.message,
          confirmColor: '#ff7500'
        })
      } else {

        wx.redirectTo({
          url: `/pages/cancelled/cancelled?taxi_ride_id=${that.data.taxi_ride_id}`
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taxi_ride_id: options.taxi_ride_id
    })
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