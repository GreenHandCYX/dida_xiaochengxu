const util = require('../../utils/util.js')
const { myEmitter } = require('../../utils/websocket.js')
var app = getApp();
var cont = 0;
var timer, order_state, pay_state;
const { CountDown,
  dateStrToDate,
  dateFmt,
  dateFmtPath } = require('../../utils/countdown.js')
Page({
  data: {
    noUse: 1,
    availableCoupons_count: '',
    suggest_price: '',
    total_balance: '',
    total_balance1: '',
    realunitprice: wx.getStorageSync('realunitprice') || null,
    title: wx.getStorageSync('title') || null,
    unitcost: wx.getStorageSync('unitcost') || null,
    id: wx.getStorageSync('id') || null,
    finalPrice: '',
    hide: true,
    payhome: true,
    payfail: false,
    paysuccess: false,
    hideTime: true,
    code: '',
    extra_fee: '',
    single_price: '',
    taxi_ride_id: '',
    user_cid: '',
    paytimeAll: '',
    remainingTime: ''
  },
  onLoad: function (options) {
    var that = this
      wx.removeStorageSync('realunitprice')
      wx.removeStorageSync('title')
      wx.removeStorageSync('unitcost')
      wx.removeStorageSync('id')
    that.setData({
      realunitprice: wx.getStorageSync('realunitprice'),
      title: wx.getStorageSync('title'),
      unitcost: wx.getStorageSync('unitcost'),
      id: wx.getStorageSync('id'),
      taxi_ride_id: options.taxi_ride_id,
      single_price: options.single_price,
      extra_fee: options.extra_fee,
      status: options.status
    })
    //乘客自己输入车费去支付>剩余时间不显示的>状态
    console.log('存入show券=' + wx.getStorageSync('realunitprice'))
    console.log('44行status=' + that.data.status)
    if (that.data.status == 'aboard') {
      console.log('状态4时single_price=' + that.data.single_price)
      that.setData({
        hideTime: false
      })
    }
    //剩余时间
    //console.log(parseInt(options.remainingTime))
    let countDown = new CountDown({ leftTime: parseInt(options.remainingTime) * 1000 }, function (leftTime, returnObj) {
      if (returnObj.fmt) {
        that.setData({
          paytimeAll: returnObj.fmt
        })
      } else {
        that.setData({
          paytimeAll: '0秒'
        })
      }
    }, 'dd天hh小时mm分ss秒').start();
    //获取价格信息
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/queryTaxiOrderPayInfo',
      data: {
        user_cid: app.globalData.user_cid,
        taxi_ride_id: that.data.taxi_ride_id,
        single_price: that.data.single_price,
        tolls_fee: '0'
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(success => {
      that.setData({
        availableCoupons_count: success.data.payInfo.availableCoupons_count,
        total_balance: success.data.payInfo.payaccount_info.total_balance
      })
      //优惠券选择的判断>默认的>手动选>既没有默认券也没有选券
      if (that.data.realunitprice) {
        that.setData({
          noUse: 1,
          realunitprice: that.data.realunitprice,
          unitcost: that.data.unitcost,
          title: that.data.title,
          id: that.data.id
        })
        console.log('手动选券id=' + that.data.id)
      } else if (that.data.noUse == 0) {
        that.setData({
          title: '不使用',
          realunitprice: 0,
          id: 0,
          coupon_credit: 0,
          unitcost: 0
        })
        console.log('不使用的id=' + that.data.id)
      } else {
        if (success.data.selected_coupon) {
          that.setData({
            realunitprice: success.data.selected_coupon.real_unit_price,
            unitcost: success.data.selected_coupon.coupon_set_info.unit_cost,
            title: success.data.selected_coupon.coupon_set_info.title,
            order_value_min: success.data.selected_coupon.coupon_set_info.order_value_min,
            id: success.data.selected_coupon.id
          })
          console.log('默认的id=' + that.data.id)
        }
        else {
          console.log('既没有默认券也没有选券')
          that.setData({
            realunitprice: 0,
            id: 0,
            coupon_credit: 0,
            unitcost: 0
          })
          console.log('既没有默认券也没有选券的id=' + that.data.id)
        }
      }
      console.log()
      wx.setStorageSync('realunitprice', that.data.realunitprice)
      wx.setStorageSync('unitcost', that.data.unitcost)
      wx.setStorageSync('title', that.data.title)
      wx.setStorageSync('order_value_min', that.data.order_value_min)
      wx.setStorageSync('id', that.data.id)
      console.log('券=' + that.data.realunitprice)
      console.log('券id=' + that.data.id)
      console.log('抵扣余额=' + that.data.total_balance1)
      console.log('车费=' + that.data.single_price)
      console.log('调度=' + that.data.extra_fee)
      console.log('存入show券=' + wx.getStorageSync('realunitprice'))
      that.sum();
      //余额为0时不显示
      if (that.data.total_balance == 0) {
        that.setData({
          hide: false
        })
      }
      //最终价格为0时不显示
      if (that.data.finalPrice == 0) {
        that.setData({
          hidePrice: false
        })
      } else {
        that.setData({
          hidePrice: true
        })
      }

    }, fail => {

    })
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
    var that = this;
    console.log('show=' + 111)
    console.log('show券id=' + that.data.id)
    that.didaConnectSocket(that.data.taxi_ride_id)
    if (wx.getStorageSync('id')) {
      that.setData({
        realunitprice: wx.getStorageSync('realunitprice'),
        title: wx.getStorageSync('title'),
        unitcost: wx.getStorageSync('unitcost'),
        id: wx.getStorageSync('id')
      })
    }
    else if (that.data.noUse == 0) {
      console.log('noUse=' + that.data.noUse)
      wx.removeStorageSync('realunitprice')
      wx.removeStorageSync('title')
      wx.removeStorageSync('unitcost')
      wx.removeStorageSync('id')
      that.setData({
        title: '不使用',
        realunitprice: 0,
        id: 0,
        coupon_credit: 0,
        unitcost: 0
      })
    }
    else {
      wx.removeStorageSync('realunitprice')
      wx.removeStorageSync('title')
      wx.removeStorageSync('unitcost')
      wx.removeStorageSync('id')
      that.setData({
        realunitprice: 0,
        id: 0,
        coupon_credit: 0,
        unitcost: 0
      })
    }
    console.log('存入show券=' + wx.getStorageSync('realunitprice'))
    if (that.data.single_price) {
      that.sum();
      console.log('206:'+that.data.finalPrice)
    }
  },
  //计算价格函数
  sum: function () {
    var that = this;
    var price = parseFloat(that.data.single_price) + parseFloat(that.data.extra_fee) - that.data.realunitprice + that.data.unitcost;
    var price1 = parseFloat(that.data.extra_fee) + that.data.unitcost;
    if (parseFloat(that.data.single_price) >= that.data.realunitprice) {
      if (parseFloat(price) >= parseFloat(that.data.total_balance)) {
        that.setData({
          total_balance1: parseFloat(that.data.total_balance).toFixed(2),
          finalPrice: Math.abs(price - parseFloat(that.data.total_balance)).toFixed(2)
        })
      } else {
        that.setData({
          total_balance1: parseFloat(price).toFixed(2),
          finalPrice: 0
        })
      }
    } else {
      if (parseFloat(price1) >= parseFloat(that.data.total_balance)) {
        that.setData({
          total_balance1: parseFloat(that.data.total_balance).toFixed(2),
          finalPrice: Math.abs(price1 - parseFloat(that.data.total_balance)).toFixed(2)
        })
      } else {
        that.setData({
          total_balance1: parseFloat(price1).toFixed(2),
          finalPrice: 0
        })
      }
    }
  },
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
          wx.redirectTo({
            url: `/pages/trip/trip?taxi_ride_id=${taxi_ride_id}`
          })
        }
      }
    })
  },
  getCouponList: function () {
    var that = this;
    wx.navigateTo({
      url: `../coupon/coupon?single_price=${that.data.single_price}&extra_fee=${that.data.extra_fee}&taxi_ride_id=${that.data.taxi_ride_id}`
    })
  },
  generateOrder: function (options) {
    var that = this
    //统一支付

    console.log('点击微信支付open-id=' + app.globalData.openId)
    console.log('realunitprice=' + that.data.realunitprice)
    console.log('id=' + that.data.id)
    console.log('total_balance1=' + that.data.total_balance1)
    console.log('single_price=' + that.data.single_price)
    console.log('extra_fee=' + that.data.extra_fee)
    console.log('unitcost=' + that.data.unitcost)

    util.dida_wxrequest({
      url: app.globalData.domin + '/payment/doPayTaxi/weChat',
      method: 'POST',
      data: {
        user_cid: app.globalData.user_cid,
        taxi_ride_id: that.data.taxi_ride_id,
        sum: that.data.single_price,
        extra_fee: that.data.extra_fee,
        coupon_id: that.data.id,
        coupon_credit: that.data.realunitprice,
        balance_credit: that.data.total_balance1,
        money: that.data.finalPrice,
        open_id: app.globalData.openId,
        appid_type: 'minipg_chuxing'
      },

    }).then(success => {
      if (that.data.finalPrice == 0) {
        console.log(that.data.code)
        if (that.data.code == 0) {
          that.setData({
            paysuccess: true,
            payhome: false
          })
        }
      } else {
        wx.requestPayment({
          'timeStamp': success.data.timeStamp,
          'nonceStr': success.data.nonceStr,
          'package': success.data.package,
          'signType': 'MD5',
          'paySign': success.data.paySign,
          'success': function (res) {
            that.times();
          },
          'fail': function (res) {
            console.log('fail:' + JSON.stringify(res));
            console.log('微信请求失败支付open-id=' + app.globalData.openId)
          }
        })
      }
    }, fail => {
      console.log('回调失败微信支付open-id=' + app.globalData.openId)

      //失败回调
      console.log('回调失败open-id='+app.globalData.openId)
    })
  },
  //刷新支付结果
  times: function () {
    var that = this;
    wx.showToast({
      title: '检查支付状态',
      icon: 'loading'
    })
    timer = setInterval(function () {
      cont++;
      that.common();
    }, 1000);
  },
  //点击支付按钮>>检查支付状态
  common: function () {
    var that = this;
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/queryTaxiOrderStatus',
      data: {
        user_cid: app.globalData.user_cid,
        //user_cid: that.data.user_cid,
        taxi_ride_id: that.data.taxi_ride_id,
        request_type: 2
      },
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(success => {
      order_state = success.data.order_state;
      pay_state = success.data.pay_state;
      if (order_state == 0) {
        if (pay_state == 0) {
          clearInterval(timer);
          setTimeout(() => {
            wx.hideLoading();
          }, 100)
          that.setData({
            paysuccess: true,
            payhome: false
          })
        }
      } else {
        if (pay_state == 0) {
          clearInterval(timer);
          setTimeout(() => {
            wx.hideLoading();
          }, 100)
          that.setData({
            paysuccess: true,
            payhome: false
          })
        }
      }
      if (cont >= 5) {
        clearInterval(timer);
        setTimeout(() => {
          wx.hideLoading();
        }, 100)
        that.setData({
          payfail: true,
          payhome: false
        })
      }
    }, fail => {
      //失败回调
    })
  },
  //未收到支付结果去刷新
  nopay: function () {
    var that = this;
    that.common();
  },
  //重新支付>形成列表页
  backpay: function () {
    wx.redirectTo({
      url: '../trip/trip'
    })
  },
  //支付成功去评价
  toEvaluate: function () {
    var that = this;
    wx.redirectTo({
      url: '../evaluate/evaluate?taxi_ride_id=' + that.data.taxi_ride_id
    })
  },
  //回到首页
  backindex: function () {
    wx.redirectTo({
      url: '../index/index'
    })
  }
}) 