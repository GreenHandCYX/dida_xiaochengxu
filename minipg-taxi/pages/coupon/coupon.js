//coupon.js
const util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    couponList:[],
    fromMyhome:false,
    fromPay:false,
    taxi_ride_money:'',
    taxi_ride_id:'',
    extra_fee:'',
    user_cid:'',
    nouseHide:false,
    noneCoupon:false
  }, 
  onShow:function(){
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },
  onLoad: function (options) {
    var that = this
    wx.showToast({
     title: '加载中',
     icon: 'loading'
    })
    that.setData({
      taxi_ride_id:options.taxi_ride_id,
      taxi_ride_money:options.single_price,
      extra_fee:options.extra_fee
    })
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getCouponList',
      data: {
        user_cid:app.globalData.user_cid,
        //user_cid:that.data.user_cid,
        taxi_ride_id:that.data.taxi_ride_id,
        taxi_ride_money: that.data.taxi_ride_money,
        page:1,
        page_size:20,
        type:1
      }
    }).then(success=>{
      setTimeout(() => {  
         wx.hideLoading();  
      }, 100)
          if(success.data.total_count == 0){
              that.setData({
                nouseHide:false,
                noneCoupon:true
              })
          }else{
            that.setData({
              nouseHide:true,
              couponList: success.data.list
            })  
            console.log('57行coupon的log='+that.data.couponList)
          }      
      },fail=>{
        //失败回调
      });
  },
  getPayInfo: function (e) {
    var that =  this;
    console.log('65行couponList='+that.data.couponList)
      if(e.currentTarget.dataset.enable == 0){
        wx.showToast({
         title: '此优惠券不可用',
         icon:'none'
        })
      }else{
        wx.setStorageSync('unitcost', e.currentTarget.dataset.unitcost)
        wx.setStorageSync('realunitprice', e.currentTarget.dataset.realunitprice)
        wx.setStorageSync('title', e.currentTarget.dataset.title)
        wx.setStorageSync('id', e.currentTarget.dataset.id)
            var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; 
    console.log(prevPage)
    prevPage.setData({
     noUse: 1
    })
        wx.navigateBack({
          delta: 1
        })
      } 
  },
  noUse:function(e){
    var that = this;
    wx.setStorageSync('unitcost', e.currentTarget.dataset.unitcost)
    wx.setStorageSync('realunitprice', e.currentTarget.dataset.realunitprice)
    wx.setStorageSync('title', e.currentTarget.dataset.title)
    wx.setStorageSync('id', e.currentTarget.dataset.id)
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; 
    console.log(prevPage)
    prevPage.setData({
     noUse: 0
    })
    wx.navigateBack({
      delta: 1
    });
    
  }
})