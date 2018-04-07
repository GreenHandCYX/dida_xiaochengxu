// pages/trip/trip.js
var app = getApp();
var countDown1 = null
var countDown2=null
var remainingTimeStart = false
var cancelActivePayClick = false
const util = require('../../utils/util.js')
const { myEmitter } = require('../../utils/websocket.js')
const { CountDown,
  dateStrToDate,
  dateFmt,
  dateFmtPath } = require('../../utils/countdown.js')
// 常量们
const status = {
  NEW: 1,
  replied: 2,
  driver_arrived: 3,
  aboard: 4,
  arrived: 5,
  paid: 6,
  paid_offline: 7,
  cancelled: 8
}
Page({
  data: {
    //todo
    payOrderClicktag:0,
    diverSentPay: false,
    payWindowMap: false,
    taxi_ride_id: '',
    mapHeight: '100%',
    showClear:false,
    showdispatchAll: false,
    showdispatchBtn: false,
    showDispatch: false,
    showOrderAddress: false,
    showRouteTop: false,
    showCancleBtn: false,
    showDiverInfo: false,
    showPayinfo: false,
    showpayinfoAdd: false,
    showAboardTop: false,
    showpayTime: false,
    showarrivedTime: false,
    showActivePay: false,
    showPassivePay: false,
    hasCallStart: false,
    nowStart: "",
    nowEnd: "",
    diverName: '',
    diverCar: '',
    diverCompany: '',
    diverImg: '',
    diverSex: 0,
    payinfoBaseNum: 0,
    payinfoAdd: 0,
    tolls_price: 0,
    extra_fee: 0,
    extra_feeNum: wx.getStorageSync('extra_feeNum') || 0,
    payAll: 0,
    downTimeAll: 0,
    paytimeAll: "",
    arrivedtimeMin: 0,
    arrivedtimeSec: 0,
    remainingTime: 0,
    secNumText: '',
    orderAddress_top_secNumText:"",
    orderStatus_top_secNumText:"",
    countdownEnd: true,
    phoneNumber: '',
    selected: false,
    estimatedTime: {},
    status: 0,
    focus:false
  },
  //格式化时间
  formatDate(val) {
    var val = Number(val)
    var myDate = new Date();
    myDate.setMinutes(myDate.getMinutes() + val);
    var myDateHour = myDate.getHours()
    var myDateMinute = myDate.getMinutes();
    var myDateSecond = myDate.getSeconds()
    if (myDateMinute < 10) {
      myDateMinute = '0' + myDateMinute
    }
    if (myDateSecond < 10) {
      myDateSecond = '0' + myDateSecond
    }
    if (myDateHour < 10) {
      myDateHour = '0' + myDateHour
    }
    return {
      hour: myDateHour,
      min: myDateMinute
    }
  },
  // 长链接
  didaConnectSocket: function (taxi_ride_id) {
    var taxi_ride_id = taxi_ride_id
    var that = this
    myEmitter.emit('connectSocket')
    myEmitter.on('errorSocket', function (res) {

    })    
    myEmitter.on('closeSocket', function (res) {
     
    })
    myEmitter.on('orderPushStatus', function (dat) {
      if (dat.rid && dat.typ == 2) {
        if (taxi_ride_id == dat.rid) {
          that.getTaxiRideDetail(dat.rid)
        }
      }
    })
  },
  onLoad: function (options) {
    var that = this
    var taxi_ride_id = parseInt(options.taxi_ride_id)
    that.setData({
      taxi_ride_id: taxi_ride_id
    })
    // that.getTaxiRideDetail(taxi_ride_id)
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
    var taxi_ride_id = wx.getStorageSync('taxi_ride_id') || this.data.taxi_ride_id;
    if (taxi_ride_id){
      this.getTaxiRideDetail(taxi_ride_id)
      this.didaConnectSocket(taxi_ride_id)
      this.mapCtx = wx.createMapContext('map')
    }else{

      return false
    }

  },
  // 关闭调度费
  removedispatch: function () {
    this.setData({
      selected: true,
      extra_fee: 0
    })
  },
  // 打开调度费
  openDispatch: function () {
    // if (this.data.selected){   
    //   this.setData({
    //     showClear: true
    //   })
    // }else{
    //   this.setData({
    //     showClear: false
    //   })
    // }
    this.setData({
      showDispatch: true,
      showdispatchBtn: false,
      showCancleBtn: false
    })
  },
  // 选择调度费
  selectDispatch: function (e) {
    this.setData({
      selected: true,
      extra_fee: e.currentTarget.dataset.extra
    })
  },
  // 隐藏调度费按钮
  closedispatchBtn: function () {
    var that = this
    var extra_fee = parseInt(that.data.extra_fee)
 
    if (that.data.selected) {
      util.dida_wxrequest({
        url: app.globalData.domin + '/passengertaxi/updateTaxiRide',
        data: {
          user_cid: app.globalData.user_cid,
          taxi_ride_id: that.data.taxi_ride_id,
          extra_fee: extra_fee,
          joinable: 0,
          person_num: 1
        },
        response:1,
        method: 'POST',
      }).then(success => {
        console.log(success)
        if (success.data.code) {
          that.setData({
            showdispatchBtn: true,
            showDispatch: false,
            showCancleBtn: true
          })
          wx.showModal({
            title: '提示',
            showCancel: false,
            confirmText: '确认',
            confirmColor: '#ff7500',
            content: success.data.message
          })
        } else {
          that.setData({
            extra_feeNum: extra_fee,
            showdispatchBtn: true,
            showDispatch: false,
            selected: false,
            showCancleBtn: true
          })
          wx.setStorageSync('extra_feeNum', extra_fee)
          wx.showToast({
            title: '已调整调度费金额',
            icon: 'none',
            duration: 1000
          })
        }
        }, fail => {
          that.setData({
            showdispatchBtn: true,
            showDispatch: false,
            showCancleBtn: true
          })
          wx.showToast({
            title: success.data.message,
            icon: 'none',
            duration: 1000
          })
        })
    } else {
      that.setData({
        showdispatchBtn: true,
        showDispatch: false,
        selected: false,
        showCancleBtn: true
      })
    }
  },
  // 给司机打电话
  callToDriver: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber
    })
  },
  inpBlur:function(e){
//     var that = this;
//     var value = e.detail.value;
//     // e.detail.value = "111"
// setTimeout(function(){
//   if (cancelActivePayClick){
//     cancelActivePayClick = false
//     return false
//   }
//   console.log(e)
//   that.setData({
//     payinfoBaseNum: ''
//   })
//   return {
//     value: "111"
//   }
// },200)

  },
  // 关闭主动支付输入框
  cancelActivePayOrder: function () {
    this.setData({
      payWindowMap: false,
      // showCancleBtn: true,
      showActivePay: true,
      showDiverInfo: true
    })
  },
    // 打开主动支付输入框
  ActivePayOrder: function () {
    this.setData({
      focus: true,
      payWindowMap: true,
      showCancleBtn: false,
      showDiverInfo: false
    })
  },
  // 去支付跳转
  payOrder: function () {
    var that = this
    if (that.data.payOrderClicktag === 0) {
      console.log(2)
      cancelActivePayClick = true
      that.setData({
        payOrderClicktag: 1
      })
      util.dida_wxrequest({
        url: app.globalData.domin + '/passengertaxi/queryTaxiOrderStatus',
        data: {
          user_cid: app.globalData.user_cid,
          request_type: 1,
          taxi_ride_id: that.data.taxi_ride_id
        },
        method: 'GET',
      }).then(success => {
        console.log(success)
        // order_state
        if (success.data.order_state == 0) {
          if (parseFloat(this.data.payinfoBaseNum) < parseFloat(this.data.initiate_rate)) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              confirmText: '确认',
              confirmColor: '#ff7500',
              content: '请正确输入计价器显示的金额'
            })
          } else {
            wx.navigateTo({
              url: `/pages/pay/pay?single_price=${this.data.payinfoBaseNum}&extra_fee=${this.data.payinfoAdd}&taxi_ride_id=${this.data.taxi_ride_id}&remainingTime=${this.data.remainingTime}&status=${this.data.status}`
            })
          }
        } else if (success.data.order_state == -1) {
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          wx.redirectTo({
            url: '../cancelled/cancelled?taxi_ride_id=' + that.data.taxi_ride_id
          })
        } else if (success.data.order_state == -2) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            confirmText: '确认',
            confirmColor: '#ff7500',
            content: '支付超时',
            success: function () {
              wx.redirectTo({
                url: '../login/login'
              })
            }
          })
        }
      })
      setTimeout(function () {
        that.setData({
          payOrderClicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
  },
  // 关闭取消订单选择框
  closeCancelBox: function () {
    if (this.data.replied) {
      this.setData({
        showCancelBox: false,
        showDiverInfo: true,
        showCancleBtn: true
      })
    } else {
      this.setData({
        showCancelBox: false,
        showCancleBtn: true
      })
    }
  },
  // 判断该城市是否可以使用调度费
  getRideHomeFixed: function () {
    var that = this
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getRideHomeFixed',
      data: {
        user_cid: app.globalData.user_cid
      },
      method: 'GET',
    }).then(success => {
      console.log(success)
      if (success.data.code) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          confirmText: '确认',
          confirmColor: '#ff7500',
          content: success.data.message
        })
        that.setData({
          showCancleBtn: true
        })
      } else {
        if (success.data.info.taxi_tksfee_enable) {
          if (wx.getStorageSync('extra_feeNum')){
            that.setData({
              extra_feeNum: wx.getStorageSync('extra_feeNum')
            })
          }
          that.setData({
            showdispatchAll: true,
            showdispatchBtn: true,
            showCancleBtn: true
          })
        }

      }
    })
  },
  // 获取订单详情
  getTaxiRideDetail: function (rideId) {
    var that = this
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getTaxiRideDetail',
      data: {
        user_cid: app.globalData.user_cid,
        taxi_ride_id: rideId
      }
    }).then(success => {
      //成功回调
      // console.log(success)
      const { from_poi, to_poi } = success.data.taxi_ride;
      const tencentStart = util.baidu_coordinate_qq(from_poi.latitude, from_poi.longitude);
      const tencentEnd = util.baidu_coordinate_qq(to_poi.latitude, to_poi.longitude);
      var rideInfo = success.data.taxi_ride
  
      // todo
      that.setData({
        initiate_rate: rideInfo.initiate_rate,
        markers: [{
          iconPath: "/img/iconMapStart.png",
          id: 0,
          latitude: tencentStart.lat,
          longitude: tencentStart.lon,
          width: 30,
          height: 30
        },
        {
          iconPath: "/img/iconMapEnd.png",
          id: 1,
          latitude: tencentEnd.lat,
          longitude: tencentEnd.lon,
          width: 30,
          height: 30
        }]
      })
      var points = [];
      if (that.data.markers) {
        that.data.markers.forEach((ele) => {
          points.push({ latitude: ele.latitude, longitude: ele.longitude })
        })
      }

      // that.mapCtx.includePoints({
      //   padding: [250, 100, 100, 100],
      //   points: points
      // })
      that.setData({
        points:points
      })
      var rideInfo = success.data.taxi_ride

      switch (rideInfo.status) {
        //status todo
        case status.NEW:
          // new
          console.log('new')
          that.getRideHomeFixed()
          setTimeout(function () {
            that.setData({
              showDispatch: false,
              showdispatchAll: false,
              showCancelBox: false,
              nowStart: rideInfo.from_poi.short_address,
              nowEnd: rideInfo.to_poi.short_address,
              showOrderAddress: true,
              showRouteTop: true,
              hasCallStart: true,
              orderAddress_top_secNumText: '后若无应答，系统将为你优先叫车'
            })
         

          var leftTimeNum = typeof wx.getStorageSync('leftTime') === 'number' ? wx.getStorageSync('leftTime') : 60 * 1000;
          if (countDown1){
            countDown1.stop()
          }
          countDown1 = new CountDown({ leftTime: leftTimeNum, isCut: false }, function (leftTime, returnObj) {
            wx.setStorageSync('leftTime', leftTime)
            if (leftTime) {
              that.setData({
                downTimeAll: returnObj.fmt
              })
            } else {
              that.setData({
                countdownEnd: false,
                downTimeAll:'优先叫车中',
                orderAddress_top_secNumText: '，请耐心等待'
              })
            }
          }, 'ss.SS\'\'').start()
          }, 100)
          break;
        case status.replied:
          // replied
          setTimeout(function () {
          console.log('replied')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          that.setData({
            showDispatch:false,
            showdispatchAll:false,
            showCancelBox: false,
            showRouteTop:false,
            hasCallStart:false,
            showdispatchAll: false,
            showdispatchBtn: false,
            replied: true,
            showAboardTop: true,
            showOrderAddress: false,
            showDiverInfo: true,
            countdownEnd: false,
            showCancleBtn: true,
            diverName: rideInfo.driver_info.nick_name,
            diverSex: rideInfo.driver_info.gender,
            diverCar: rideInfo.driver_info.car_no,
            diverCompany: rideInfo.driver_info.company_name,
            diverImg: rideInfo.driver_info.avatar_url,
            orderStatus_top_secNumText: '司机正在接你的路上，请耐心等待…',
            phoneNumber: rideInfo.driver_info.phone_no
          })
          }, 100)
          break;
        case status.driver_arrived:
          // driver_arrived
          setTimeout(function () {
          console.log('driver_arrived')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          that.setData({
            showCancelBox: false,
            showdispatchAll: false,
            replied: true,
            showAboardTop: true,
            showOrderAddress: false,
            showDiverInfo: true,
            hasCallStart: false,
            countdownEnd: false,
            showCancleBtn: true,
            diverName: rideInfo.driver_info.nick_name,
            diverSex: rideInfo.driver_info.gender,
            diverCar: rideInfo.driver_info.car_no,
            diverCompany: rideInfo.driver_info.company_name,
            diverImg: rideInfo.driver_info.avatar_url,
            orderStatus_top_secNumText: '司机已到达起点，请尽快上车',
            phoneNumber: rideInfo.driver_info.phone_no
          })
          }, 100)
          break;
        case status.aboard:
          // aboard
          console.log('aboard')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          var distance = util.calcDistance(rideInfo.from_poi.longitude, rideInfo.from_poi.latitude, rideInfo.to_poi.longitude, rideInfo.to_poi.latitude);
          var estimatedTime = that.formatDate(parseInt(distance / 1000 * 2))
          that.setData({
            focus: false,
            showdispatchAll: false,
            estimatedTime: estimatedTime,
            showRouteTop: false,
            showCancleBtn: false,
            showCancelBox:false,
            showDiverInfo: true,
            hasCallStart: false,
            countdownEnd: false,
            showAboardTop: true,
            showarrivedTime: true,
            showActivePay: true,
            payWindowMap: false,
            arrivedtimeSec: '00',
            payinfoAdd: rideInfo.extra_fee,
            diverName: rideInfo.driver_info.nick_name,
            diverSex: rideInfo.driver_info.gender,
            diverCar: rideInfo.driver_info.car_no,
            diverCompany: rideInfo.driver_info.company_name,
            diverImg: rideInfo.driver_info.avatar_url,
            orderStatus_top_secNumText: '司机正开往目的地',
            phoneNumber: rideInfo.driver_info.phone_no,
            status: 'aboard'
          })
          break;
        case status.arrived:
          // arrived 
          setTimeout(function () {
          console.log('arrived ')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          if (rideInfo.single_price) {
            // console.log('有钱 ')
            var single_price = (parseFloat(rideInfo.single_price) + parseFloat(rideInfo.tolls_price)).toFixed(2)
            var payAll = (parseFloat(rideInfo.single_price) + parseFloat(rideInfo.extra_fee) + parseFloat(rideInfo.tolls_price)).toFixed(2)
            that.setData({
              focus: false,
              showdispatchAll: false,
              payWindowMap: false,
              showRouteTop: false,
              showCancleBtn: false,
              hasCallStart: false,
              countdownEnd: false,
              showPayinfo: true,
              showAboardTop: true,
              showpayTime: true,
              showarrivedTime: false,
              showPassivePay: true,
              showDiverInfo: true,
              payAll: payAll,
              diverSentPay:true,
              showActivePay: false,
              payinfoBaseNum: single_price,
              tolls_price: rideInfo.tolls_price,
              payinfoAdd: rideInfo.extra_fee,
              diverName: rideInfo.driver_info.nick_name,
              diverSex: rideInfo.driver_info.gender,
              diverCar: rideInfo.driver_info.car_no,
              diverCompany: rideInfo.driver_info.company_name,
              diverImg: rideInfo.driver_info.avatar_url,
              orderStatus_top_secNumText: '请在下车前支付订单',
              phoneNumber: rideInfo.driver_info.phone_no,
              status: 0
            })
          } else {
            that.setData({
              focus: true,
              payWindowMap: false,
              showdispatchAll: false,
              showRouteTop: false,
              showCancleBtn: false,
              // showDiverInfo: true,
              hasCallStart: false,
              countdownEnd: false,
              showPayinfo: true,
              showAboardTop: true,
              showpayTime: true,
              showarrivedTime: false,
              showPassivePay: true,
              payinfoAdd: rideInfo.extra_fee,
              diverName: rideInfo.driver_info.nick_name,
              diverSex: rideInfo.driver_info.gender,
              diverCar: rideInfo.driver_info.car_no,
              diverCompany: rideInfo.driver_info.company_name,
              diverImg: rideInfo.driver_info.avatar_url,
              orderStatus_top_secNumText: '请在下车前支付订单',
              phoneNumber: rideInfo.driver_info.phone_no,
              status: 0
            })
            that.ActivePayOrder()
          }
          that.setData({
            remainingTime: rideInfo.order_remaining_seconds
          })


          setTimeout(function(){
            // if (!remainingTimeStart) {
            //   remainingTimeStart = true
            if (countDown2){
              countDown2.stop()
              }
            
              countDown2 = new CountDown({ leftTime: rideInfo.order_remaining_seconds * 1000 }, function (leftTime, returnObj) {

                // console.log('remainingTimeStart[[[[[[[[[' + returnObj.fmt)
                if (returnObj.fmt) {
                  that.setData({
                    paytimeAll: returnObj.fmt
                  })
                } else {
                  remainingTimeStart = false
                  
                  that.setData({
                    paytimeAll: '0秒'
                  })
                }
              }, 'dd天hh小时mm分ss秒').start()
            // }
          },400)
          }, 100)
          break;
        case status.paid:
          // paid
          console.log('paid')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          myEmitter.emit('UserCloseSocket')
          if (countDown2) {
            countDown2.stop()
          }
          wx.redirectTo({
            url: '../evaluate/evaluate?taxi_ride_id=' + that.data.taxi_ride_id
          })
          break;
        case status.paid_offline:
          // paid_offline
          console.log('paid_offline')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          myEmitter.emit('UserCloseSocket')
          if (countDown2) {
            countDown2.stop()
          }
          wx.redirectTo({
            url: '../evaluate/evaluate?taxi_ride_id=' + that.data.taxi_ride_id
          })
          break;
        case status.cancelled:
          // cancelled
          console.log('cancelled')
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
          myEmitter.emit('UserCloseSocket')
          if (countDown2) {
            countDown2.stop()
          }
          wx.redirectTo({
            url: '../cancelled/cancelled?taxi_ride_id=' + that.data.taxi_ride_id
          })
          break;
      }
    }, fail => {
      //失败回调
      // todo
    });
  },
  bindHideKeyboard: function (e) {
    wx.hideKeyboard();
    // if (this.data.replied) {
    //   this.setData({
    //     showCancelBox: false,
    //     showDiverInfo: true,
    //     showCancleBtn: true
    //   })
    // } else {
    //   this.setData({
    //     showCancelBox: false,
    //     showCancleBtn: true
    //   })
    // }
  },
  moneyChange: function (e) {
    var value = e.detail.value;
    var single_price = 0;
    var payAll = 0; 
    value = value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符  
    value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  
    value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
    if (value) {
      if (value > 1000) {
        value = 1000
        single_price = parseFloat(value).toFixed(2)
        payAll = (parseFloat(value) + this.data.payinfoAdd).toFixed(2)
        this.setData({
          payAll: payAll,
          payinfoBaseNum: single_price
        })
        return {
          value: 1000
        }
      }
      var str = parseInt(value) === parseInt(value) ? '' + parseInt(value) : '0';
      if (value.indexOf('.') > -1) { str += value.slice(value.indexOf('.')) }
      single_price = parseFloat(str).toFixed(2)
      payAll = (parseFloat(str) + this.data.payinfoAdd).toFixed(2).replace(/^0(?!\.)/, '0.');
      this.setData({
        payAll: payAll,
        payinfoBaseNum: single_price
      })
      return {
        value: str
      }
    } else {
      this.setData({
        payAll: 0,
        payinfoBaseNum: 0
      })  
    }
  },
  //传入unix时间戳，得到倒计时
  Countdown: function (time, pay) {
    console.log(time)
    var that = this
    var year = time.substring(0, 4);
    var month = time.substring(4, 6) - 1;
    var date = time.substring(6, 8);
    var hrs = time.substring(8, 10);
    var min = time.substring(10, 12);
    var sec = time.substring(12, 14);

    var timer = setInterval(function () {
      var timeStamp = new Date(year, month, date, hrs, min, sec);
      var distancetime = parseFloat((timeStamp - new Date()));
      var msNum = Math.floor(distancetime % 1000 / 10);
      var secNum = Math.floor(distancetime / 1000 % 60);
      var minNum = Math.floor(distancetime / 1000 / 60 % 60);

      if (distancetime > 0) {
        that.setData({
          msNum: msNum,
          secNum: secNum
        })
      } else {
        clearInterval(timer);
        that.setData({
          countdownEnd: false,
          orderAddress_top_secNumText: '正在为你优先叫车'
        })
      }
    }, 10);
  },
  popcancelBox: function () {
    this.setData({
      showCancelBox: true,
      showCancleBtn: false,
      showDiverInfo: false
    })
  },
  cancelTaxiRide: function () {
    var that = this
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/cancelTaxiRide',
      data: {
        user_cid: app.globalData.user_cid,
        taxi_ride_id: that.data.taxi_ride_id
      },
      method: 'POST',
    }).then(res => {
        console.log(res)
      wx.removeStorageSync('leftTime')
      wx.removeStorageSync('extra_feeNum')
      if (countDown1){
        countDown1.stop()
      }
      myEmitter.emit('UserCloseSocket')
      if (that.data.replied) {
        wx.reLaunch({
          url: '../reason/reason?taxi_ride_id=' + that.data.taxi_ride_id
        })
      } else {
        wx.reLaunch({
          url: '../index/index'
        })
      }
    }, res =>{


    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
