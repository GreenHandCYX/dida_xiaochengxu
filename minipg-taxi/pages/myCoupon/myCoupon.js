//coupon.js
const util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    couponList:[],
    coupon_type:'',
    discount:'',
    taxi_ride_money:'',
    taxi_ride_id:'',
    noneCoupon:false,
    user_cid:''
  }, 
  onShow:function(){
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },
  onLoad: function (options) {
    var that = this
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getCouponList',
      data: {
        user_cid:app.globalData.user_cid,
        //user_cid:that.data.user_cid,
        taxi_ride_id:that.data.taxi_ride_id,
        taxi_ride_money: that.data.taxi_ride_money,
        page:1,
        page_size:100,
        type:0
      }
    }).then(success=>{
        if(success.data.total_count == 0){
            that.setData({
              noneCoupon:true
            })
        }else{
          that.setData({
            couponList: success.data.list
          }) 
          console.log(that.data.couponList)
        }         
      },fail=>{
        //失败回调
      });
  },
  getPayInfo: function (e) {
      wx.redirectTo({
        url: '../index/index'
      })
  }
})