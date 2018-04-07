
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    taxi_ride_id:"",
    type:"",
    time:"",
    showDiverInfo:true,
    diverName:"",
    diverCar:"",
    diverCompany:"",
    diverImg:"",
    driverPhone:""
  },
   callToDriver:function() {
    wx.makePhoneCall({
      phoneNumber: this.data.driverPhone
    })
  },
  back:function() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  onShow:function(){
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },
  onLoad: function (options) {
    var that = this
    this.setData({
      taxi_ride_id: options.taxi_ride_id
    })
    util.dida_wxrequest({
          url: app.globalData.domin + '/passengertaxi/getTaxiRideDetail',
          data: {
            user_cid:app.globalData.user_cid,
            taxi_ride_id:that.data.taxi_ride_id
          }
        }).then(success=>{
            //成功回调
            if(success.data.taxi_ride.cancel_type) {
              var cancel_time = success.data.taxi_ride.cancel_time;
              //todo
              cancel_time = cancel_time.substring(4,6)+"月"+cancel_time.substring(6,8)+"日"+" "+cancel_time.substring(8,10)+":"+cancel_time.substring(10,12);
              that.setData({
                  time: cancel_time,
                })
              if(success.data.taxi_ride.cancel_type == 1) {
                that.setData({
                  type: "主动取消",
                })
              } else if(success.data.taxi_ride.cancel_type == 2) {
                that.setData({
                  type: "自主取消",
                })
              } else if(success.data.taxi_ride.cancel_type == 3) {
                //todo:
                that.setData({
                  type: "车主取消",
                })
              }
            }
            if(success.data.taxi_ride.driver_info) {
              that.setData({
                diverName: success.data.taxi_ride.driver_info.nick_name,
                diverCar:success.data.taxi_ride.driver_info.car_no,
                diverCompany:success.data.taxi_ride.driver_info.company_name,
                diverImg:success.data.taxi_ride.driver_info.avatar_url,
                driverPhone:success.data.taxi_ride.driver_info.phone_no
              })
            } else {
              that.setData({
                showDiverInfo:false
              })
            }
            
          },fail=>{
            //失败回调
          });

  }
})