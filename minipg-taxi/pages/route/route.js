// pages/route/route.js
var app = getApp();
const util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIscroll:true,
    showNoList:false,
    statusIng: false,
    TaxiRideList: [],
    statusText: "已完成",
    pageStart:1,
    pageSize:5,
    hasMoreData:true,
    ifLoding:true,
    lowerbusy:false
  },
  checkRouteDetail: function (e) {
    let status = e.currentTarget.dataset.status
    let rideId = e.currentTarget.dataset.rideid
    // console.log(e)
    // todo
    switch (status) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        wx.setStorageSync('taxi_ride_id', rideId)
        wx.navigateTo({
          url: '/pages/trip/trip?taxi_ride_id=' + rideId
        })
        break;
      case 6:
      case 7:
        wx.navigateTo({
          url: '/pages/evaluate/evaluate?taxi_ride_id=' + rideId
        })
        break;
      case 8:
        wx.navigateTo({
          url: '/pages/cancelled/cancelled?taxi_ride_id=' + rideId
        })
        break;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getAllList()
  },
  getAllList: function () {
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    var url = app.globalData.domin + '/passengertaxi/getAllList';
    var data = {
      user_cid: app.globalData.user_cid,
      page: that.data.pageStart,
      page_size: that.data.pageSize
    }
    util.dida_wxrequest({ url, data, method: 'GET' }).then(res => {

      // console.log(res.data.list)
      wx.hideLoading()
      if (res.data.code == 0) {
        if (res.data.list.length == 0 && that.data.pageStart ==1){
          that.setData({
            showNoList: true,
            TaxiRideList:[]
          })
          return false
        }
        if (that.data.pageStart == 1) {
          that.data.TaxiRideList = []
        }
        var TaxiRideList = res.data.list
        var TaxiRideListLength = TaxiRideList.length
        var monthlyList = that.data.TaxiRideList

        if (TaxiRideListLength < that.data.pageSize) {
          that.setData({
            hasMoreData: false,
          })

        } else {
          that.setData({
            hasMoreData: true,
            pageStart: that.data.pageStart + 1,
          })
        }
        that.setData({
          TaxiRideList: monthlyList.concat(TaxiRideList),
          lowerbusy:false,
          ifLoding: true
        })
        //     console.log(TaxiRideList)
        // console.log(that.data.TaxiRideList)
      }else{
        wx.showModal({
          title: '提示',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#ff7500',
          content: res.data.message
        })
      }
    })
  },
  //scroll-view定义的下拉至底部触发事件,lowerbusy标志位是为了解决多次触发该事件导致的问题
  loadMore: function () {
    var that = this;
    if (this.data.lowerbusy) {
      wx.hideLoading()
      return;
    } else {
      that.setData({
        lowerbusy: true
      })
      if (this.data.hasMoreData) {
        wx.showLoading({
          title: '加载更多数据',
        })
        this.getAllList()
      } else {
        wx.hideLoading()
        setTimeout(function () {
          wx.showToast({
            title: '没有更多数据',
          })
        }, 1000)
      }
    }
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
     TaxiRideList : [],
     pageStart:1
    })
    this.getAllList()
    // if (this.data.hasMoreData == true) {
    //   this.getAllList()
    // }
   
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