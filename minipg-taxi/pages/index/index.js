//index.js
var app = getApp();
const utils = require('../../utils/util.js');
const { dateStrToDate, dateFmt } = require('../../utils/countdown.js');
const endDefault = '想要去哪儿？'
const startDefault = '当前位置'
var controlsStart = {}
Page({
  data: {
    // isAndroid: app.globalData.deviceInfo.mobileType,
    clicktag:0,
    aboarding: false,
    showOrderAddress: true,
    showRouteTop: true,
    lat: 0,
    lng: 0,
    nowStart: wx.getStorageSync('nowStart') || startDefault,//todo
    nowEnd: wx.getStorageSync('nowEnd') || endDefault,//todo
    hasPrice: false,
    deduct_price: '',
    single_price: '',
    coupon_price: '',
    showCallBtn: false,
    showMyHomeBtn: true,
    markers: [],
    taxi_ride_id: 0,
    estimatedTime: '',
    scale: 18,
    tooltip: null,
    circles: [],
    changeShow: false,
    hastip:false
  },
  getBoardingRide: function () {
    var that = this
    utils.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getBoardingRide',
      data: {
        user_cid: app.globalData.user_cid
      },
      method: 'GET',
    }).then(resolve => {
      // console.log(resolve)
      if (resolve.data.code) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          confirmText: '确认',
          confirmColor: '#ff7500',
          content: resolve.data.message
        })
      } else {
        if (resolve.data.id) {
          wx.showModal({
            title: '提示',
            content: '您有一个订单正在进行',
            cancelText: '不进入',
            confirmText: '进入',
            confirmColor: '#ff7500',
            success: function (res) {
              if (res.confirm) {
                wx.setStorageSync('taxi_ride_id', resolve.data.id)
                wx.navigateTo({
                  url: `/pages/trip/trip?taxi_ride_id=${resolve.data.id}&estimatedTime=${wx.getStorageSync('estimatedTime')}&nowStart=${wx.getStorageSync('nowStart')}&nowEnd=${wx.getStorageSync('nowEnd')}`
                })
              } else if (res.cancel) {
                that.setData({
                  tooltip: null,
                  changeShow: false,
                  scale: 18,
                  hastip:false,
                  circles: []
                })
                that.resetLoc(2)
              }
            }
          })
        }else{
          wx.removeStorageSync('leftTime')
          wx.removeStorageSync('extra_feeNum')
        }
      }
    })
  },
  gotoMyHome: function () {
    var that = this
    if (that.data.clicktag === 0) {
      utils.dida_setStorageSync('region', wx.getStorageSync('region'), 1)
      utils.dida_setStorageSync('hasPrice', wx.getStorageSync('hasPrice'), 1)
      utils.dida_setStorageSync('curLoc', wx.getStorageSync('curLoc'), 1)
      utils.dida_setStorageSync('visitedLocs', wx.getStorageSync('visitedLocs'), 1)
      utils.dida_setStorageSync('single_price', wx.getStorageSync('single_price'), 1)
      utils.dida_setStorageSync('showCallBtn', wx.getStorageSync('showCallBtn'), 1)
      utils.dida_setStorageSync('nowStart', wx.getStorageSync('nowStart'), 1)
      utils.dida_setStorageSync('startDetail', wx.getStorageSync('startDetail'), 1)
      utils.dida_setStorageSync('nowEnd', wx.getStorageSync('nowEnd'), 1)
      utils.dida_setStorageSync('endDetail', wx.getStorageSync('endDetail'), 1)

      that.setData({
        clicktag:1
      })
      wx.navigateTo({
        url: '../myHome/myHome'
      })
      setTimeout(function () {
        that.setData({
          clicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
  },
  //获取中心位置
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        return res
      }
    })
  },
  //时间差
  DateCha(time) {
    var d1 = new Date()
    var d2 = dateStrToDate(time);

    var d3 = d2.getTime() - d1.getTime();
    var leave1 = d3 % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)
    return { hours, minutes }
  },
  //格式化时间
  formatDate(date, flag) {
    var myDate = new Date(date);

    if (!flag) {
      myDate = new Date(myDate.getTime() + 16 * 60 * 1000)
    }
    return dateFmt(myDate, "yyyyMMddhhmmss")
  },
  //呼叫出租车
  callDidaTaxi() {
    this.setData({
      changeShow: false,
      hastip:false,
      tooltip:null
    })
    var that = this;
    var startDetail = wx.getStorageSync('startDetail').split(',');
    var endDetail = wx.getStorageSync('endDetail').split(',');
    var startLong = startDetail[0];
    var startShort = this.data.nowStart;
    var baiduLocStart = utils.qq_coordinate_baidu(startDetail[1], startDetail[2])
    var startLat = baiduLocStart.lat;
    var startLng = baiduLocStart.lon;
    var endLong = endDetail[0];
    var endShort = this.data.nowEnd;
    var baiduLocEnd = utils.qq_coordinate_baidu(endDetail[1], endDetail[2])
    var endLat = baiduLocEnd.lat;
    var endLng = baiduLocEnd.lon;

    var single_price = this.data.single_price;
    var data = {
      user_cid: app.globalData.user_cid,
      start_lon: startLng,
      start_lat: startLat,
      start_long_addr: startLong,
      start_short_addr: startShort,
      end_lon: endLng,
      end_lat: endLat,
      end_long_addr: endLong,
      end_short_addr: endShort,
      plan_start_time: that.formatDate(new Date(), 1),
      single_price: single_price,
    
      source_cid: 'minipg_taxi'
    }

    var url = app.globalData.domin + '/passengertaxi/submitTaxiRide';
    utils.dida_wxrequest({ url: url, method: 'POST', data: data, response: 1 }).then(res => {
      if (res.data.code === 0) {
        var distance = utils.calcDistance(startLng, startLat, endLng, endLat);
        var estimatedTime = parseInt(distance / 1000 * 2)
        wx.setStorageSync('estimatedTime', estimatedTime)

        that.setData({
          tooltip:null,
          circles: [],
          estimatedTime: estimatedTime,
          showCallBtn: false,
          hasPrice: false,
          taxi_ride_id: res.data.taxi_ride_id
        })
        wx.removeStorageSync('flag')
        wx.removeStorageSync('region')
        wx.removeStorageSync('hasPrice')
        wx.removeStorageSync('single_price')
        wx.removeStorageSync('nowStart')
        wx.removeStorageSync('startVisited')
        wx.removeStorageSync('coupon_price')
        wx.removeStorageSync('showCallBtn')
        wx.removeStorageSync('nowEnd')
        wx.removeStorageSync('endDetail')
        wx.removeStorageSync('startDetail')
        wx.setStorageSync('taxi_ride_id', res.data.taxi_ride_id)
       
        that.setData({
          circles: [],
          markers: [],
          controls: [],
          lat: 0,
          lng: 0,
          nowStart: '',
          nowEnd: endDefault,
          hasPrice: false,
          single_price: 0,
          showCallBtn: false,
          controlsList: [],
          markersList: [],
          tooltip: null
        })
        wx.navigateTo({
          url: `/pages/trip/trip?taxi_ride_id=${res.data.taxi_ride_id}&estimatedTime=${estimatedTime}&nowStart=${startShort}&nowEnd=${endShort}`,
        })
      }
    }, fail => {

      if (fail.data.code === 401) {
        console.log(401)
        utils.dida_setStorageSync('hasPrice', wx.getStorageSync('hasPrice'),1)
        utils.dida_setStorageSync('curLoc', wx.getStorageSync('curLoc'), 1)
        utils.dida_setStorageSync('region', wx.getStorageSync('region'), 1)
        utils.dida_setStorageSync('visitedLocs', wx.getStorageSync('visitedLocs'), 1)
        utils.dida_setStorageSync('single_price', wx.getStorageSync('single_price'), 1)
        utils.dida_setStorageSync('showCallBtn', wx.getStorageSync('showCallBtn'), 1)
        utils.dida_setStorageSync('nowStart', wx.getStorageSync('nowStart'), 1)
        utils.dida_setStorageSync('startDetail', wx.getStorageSync('startDetail'), 1)
        utils.dida_setStorageSync('nowEnd', wx.getStorageSync('nowEnd'), 1)
        utils.dida_setStorageSync('endDetail', wx.getStorageSync('endDetail'), 1)
        utils.dida_clearStorageSync()
        wx.redirectTo({
          url: '../login/login?from=index'
        })
      } else if (fail.data.code === 2003) {
        wx.showModal({
          title: '提示',
          showCancel: true,
          confirmText: '关闭',
          confirmColor: '#ff7500',
          content: fail.data.message
        })
      } else {
        wx.showModal({
          title: '错误',
          showCancel: true,
          confirmText: '关闭',
          confirmColor: '#ff7500',
          content: fail.data.message
        })
        that.resetLoc(2)
        that.setData({
          scale:18
        })
      }
    }
    )

  },
  //重新选址
  resetLoc(key) {
    var that = this
    if (key == 2) {
      wx.removeStorageSync('nowStart')
      wx.removeStorageSync('startDetail')
      wx.removeStorageSync('nowEnd')
      wx.removeStorageSync('endDetail')
      this.data.controlsList.push({
        id: 2,
        iconPath: '/img/iconMapStart.png',
        position: {
          left: that.data.screenWidth / 2 - 13,
          top: that.data.screenHeight / 2 - 60,
          width: 30,
          height: 30
        }
      })
      this.setData({
        circles: [],
        hasPrice: false,
        nowStart: startDefault,
        nowEnd: endDefault,
        showCallBtn: false,
        markersList: [],
        markers: [],
        tooltip: null,
        hastip: false,
        controlsList: that.data.controlsList,
        controls: that.data.controlsList
      })
    } else if (key == 0) {
      if (that.data.markersList) {
        var del = that.data.markersList.filter(ele => {
          if (ele.id != 1) {
            return true
          }
        })
      }
      // wx.removeStorageSync('nowEnd')
      // wx.removeStorageSync('endDetail')
      this.setData({
        hasPrice: false,
        // nowEnd: endDefault,
        showCallBtn: false,
        markersList: del,
        markers: del,
        tooltip: null,
        circles: []
      })
      this.setMarkers()
    } else if (key == 1) {
      if (that.data.markersList) {
        var del = that.data.markersList.filter(ele => {
          if (ele.id != 0) {

            return true
          }
        })
      }


      // wx.removeStorageSync('nowStart')
      // wx.removeStorageSync('startDetail')
      this.data.controlsList.push({
        id: 2,
        iconPath: '/img/iconMapStart.png',
        position: {
          left: that.data.screenWidth / 2 - 13,
          top: that.data.screenHeight / 2 - 60,
          width: 30,
          height: 30
        },
        clickable: true
      })
      this.setData({
        tooltip: null,
        hasPrice: false,
        // nowStart: startDefault,
        showCallBtn: false,
        markersList: del,
        markers: del,
        circles: []
        // controls: that.data.controlsList
      })
      this.setMarkers()
    }
    this.initLoc();
  },
  //设置marker
  setMarkers() {
    var that = this
    that.setData({
      tooltip: null,
      circles: [],
      markers: that.data.markersList
    })
    console.log(that.data.markersList)
    var points = [];
    if (that.data.markersList) {
      that.data.markersList.forEach((ele) => {
        points.push({ latitude: ele.latitude, longitude: ele.longitude })
      })
    }
    // that.setData({
    //   showAllPoints:points
    // })
    that.mapCtx.includePoints({

      padding: [250, 100, 100, 100],

      points: points
    })



  },
  //获取预期价格
  getPriceInfo(data) {
    console.log(this.data.hasPrice)

    var that = this;
   
    var url = app.globalData.domin + '/passengertaxi/getPriceInfo'
    utils.dida_wxrequest({ url: url, method: 'GET', data: data,response: 1}).then(res => {
     
      if (res.data.code == 0) {
        // console.log(that.data.coupon_price)

        if (that.data.markersList && that.data.markersList.length > 1) {
          that.data.markersList.pop()
        }

        //设置终止点图标
        var markersList = that.data.markersList
        var tecent = utils.baidu_coordinate_qq(data.end_lat, data.end_lon)
        markersList.push({
          iconPath: "/img/iconMapEnd.png",
          id: 1,
          latitude: tecent.lat,
          longitude: tecent.lon,
          width: 30,
          height: 30
        })
        that.data.controlsList = [{
          id: 1,
          iconPath: '/img/location.png',
          position: {
            left: app.globalData.deviceInfo.screenWidth - 60,
            top: app.globalData.deviceInfo.screenHeight * 3.8 / 6,
            width: 50,
            height: 50
          },
          clickable: true
        }]
        

        that.setData({
          circles: [],
          markersList: markersList,
          controlsList: that.data.controlsList,
          controls: that.data.controlsList,
          tooltip: null,
          changeShow: true,
          hasPrice: true,
          hastip: false,
          tooltip: null,
          deduct_price: res.data.single_total_price,
          single_price: res.data.single_price,
          coupon_price: res.data.single_coupon_price  || 0,
          showCallBtn: true
        })
        wx.setStorageSync('hasPrice', true);
        wx.setStorageSync('single_price', res.data.single_price)
        wx.setStorageSync('coupon_price', res.data.single_coupon_price)
        wx.setStorageSync('showCallBtn', true)
        that.setMarkers()
      } 
    }, fail => {
      wx.showModal({
        title: '提示',
        showCancel: true,
        confirmText: '关闭',
        confirmColor: '#ff7500',
        content: fail.data.message
      })
      that.resetLoc(2)
    })
  },


  //通过经纬度查地址
  getLocName(lat, lng, callback) {
    //转化为百度的经纬度
    // console.log(lat,lng)
    // var baiduLoc = utils.qq_coordinate_baidu(lat, lng);
    // console.log(baiduLoc)
    var url = `https://api.map.baidu.com/geocoder/v2/?location=${lat},${lng}&output=json&pois=1&radius=200&coordtype=gcj02ll&ak=${app.globalData.apk}`
    this.fetch(url, 'GET').then(res => {
      res.lat = lat;
      res.lng = lng;
      callback(res);
    })
  },

  //获取当前地址
  getLocation(callback) {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function (res) {

        if (callback && typeof (callback) == 'function') {
          return that.getLocName(res.latitude, res.longitude, callback)
        }
        that.setData({
          circles: [],
          lat: wx.getStorageSync('startDetail').split(',')[1] || res.latitude,
          lng: wx.getStorageSync('startDetail').split(',')[2] || res.longitude,
        })
        // return res
      },
      fail: function (res) {
        wx.showModal({
          title: '获取不到您的定位',
          content: '允许“嘀嗒出行”使用您的定位，以获取准确的订单起点',
          confirmText: "开启定位",
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  that.getLocation()
                  // if (!res.authSetting["scope.userLocation"]) {
                  //   that.getLocation()
                  // } else {
                  //   that.getLocation()
                  // }
                }
              })
            } else if (res.cancel) {
              that.getLocation()
            }
          }
        })
      },
      complete: function (res) { },
    })
  },

  //查看是否起始与终止信息都有
  checkAll() {
    var that = this
    const { nowStart, nowEnd } = this.data;
  
    if (this.data.nowStart && this.data.nowEnd !== endDefault) {
      var startDetail = wx.getStorageSync('startDetail').split(',');
      var endDetail = wx.getStorageSync('endDetail').split(',');
      var startLong = startDetail[0];
      var startShort = this.data.nowStart;
      var baiduLocStart = utils.qq_coordinate_baidu(startDetail[1], startDetail[2])
      var startLat = baiduLocStart.lat;
      var startLng = baiduLocStart.lon;
      var endLong = endDetail[0];
      var endShort = this.data.nowEnd;
      var baiduLocEnd = utils.qq_coordinate_baidu(endDetail[1], endDetail[2])
      var endLat = baiduLocEnd.lat;
      var endLng = baiduLocEnd.lon;

      that.setData({
        hastip: false,
        tooltip:null
      })

      this.getPriceInfo({
        user_cid: app.globalData.user_cid,
        start_lon: startLng,
        start_lat: startLat,
        start_long_addr: startLong,
        start_short_addr: startShort,
        end_lon: endLng,
        end_lat: endLat,
        end_long_addr: endLong,
        end_short_addr: endShort,
        plan_start_time: that.formatDate(new Date()),
        token: app.globalData.token,
        cid: app.globalData.cid
      })
    }
  },
  //获取系统信息
  getSystemInfo() {
    return new Promise((reolve, reject) => {
      wx.getSystemInfo({
        success: function (res) {
          reolve(res)

        },
        fail: function (res) { },
        complete: function (res) { },
      })
    })

  },
  initLoc() {
    var that = this;
    return new Promise(resolve => {
      if (!wx.getStorageSync('nowStart')) {
        that.getLocation((res) => {
          //不存在则定位
          var name = res.data.result.pois[0].name + '附近';
          var tencentLoc = {
            lat:res.lat,
            lon:res.lng
          }
          wx.setStorageSync('curLoc', {
            lat: tencentLoc.lat,
            lng: tencentLoc.lon,
          })
          that.setData({

            circles: [],
            nowStart: name,
            lat: tencentLoc.lat,
            lng: tencentLoc.lon,
            tooltip: null,
            hastip: false
          })
          wx.setStorageSync("region", res.data.result.addressComponent.city)
          wx.setStorageSync("nowStart", name)
          var details = res.data.result.addressComponent.city + res.data.result.addressComponent.district + ',' + tencentLoc.lat + ',' + tencentLoc.lon
          wx.setStorageSync("startDetail", details)
          if (that.data.nowEnd == endDefault) {
            that.getNearByDrivers(res.data.result.location.lat, res.data.result.location.lng).then(resolve => {
              var timeCha = that.DateCha(resolve.data.driver_eta)

              that.setData({
                circles: [],
                tooltip: { text: resolve.data.display_text, hours: timeCha.hours, minutes: timeCha.minutes },
                hastip:true
              })
            })
          }

        })
      } else {
        const lat = wx.getStorageSync('startDetail').split(',')[1];
        const lon = wx.getStorageSync('startDetail').split(',')[2];
        const baiduLoc = utils.qq_coordinate_baidu(lat, lon);
        that.setData({
          circles: [],
          lat: lat,
          lng: lon,
          tooltip: null,
          nowStart: wx.getStorageSync('nowStart'),
          nowEnd: wx.getStorageSync('nowEnd') || endDefault
        })
        that.getNearByDrivers(baiduLoc.lat, baiduLoc.lon).then(resolve => {
          var timeCha = that.DateCha(resolve.data.driver_eta)
          if (!that.data.markersList || that.data.nowEnd != endDefault) {
            that.setData({
              circles: [],
              tooltip: { text: resolve.data.display_text, hours: timeCha.hours, minutes: timeCha.minutes },
              hastip:true
            })
          }

          var s = '最近司机约' + (timeCha.hours > 0 ? timeCha.hours + '小时' : '') + (timeCha.minutes > 0 ? timeCha.minutes + '分钟到达' : '1分钟内到达');
          that.setData({
            circles: [],
            markersList: [{
              iconPath: "/img/iconMapStart.png",
              id: 0,
              latitude: lat,
              longitude: lon,
              width: 30,
              height: 30,
              callout: {
                content: resolve.data.display_text || s,
                color: '#ffffff',
                fontSize: 13,
                borderRadius: 30,
                bgColor: '#333333',
                padding: 4,
                textAlign: 'center',
                display: 'ALWAYS'
              }
            }],
          })
        })


      }
      resolve()
    })
  },
  onLoad(options) {
    // console.log(options.from)
    if (!options.from){
      if (app.globalData.token) {
        this.getBoardingRide();
      }
    }
    // this.getCityDistrictList()
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
    var that = this;
    // if (app.globalData.token) {
    //   that.getBoardingRide();
    // }
    //设置controls

    const screenHeight = app.globalData.deviceInfo.screenHeight;
    const screenWidth = app.globalData.deviceInfo.screenWidth;
    that.setData({ screenWidth, screenHeight })
    that.setData({
      circles: [],
      controlsList: [{
        id: 1,
        iconPath: '/img/location.png',
        position: {
          left: screenWidth - 60,
          top: screenHeight *4/5,
          width: 50,
          height: 50
        },
        clickable: true
      }, {
        id: 2,
        iconPath: '/img/iconMapStart.png',
        position: {
          left: screenWidth / 2 - 13,
          top: screenHeight / 2 - 60,
          width: 30,
          height: 30
        },
        clickable: true
      }]
    })
    if (that.data.nowEnd == endDefault) {
      that.setData({
        circles: [],
        controls: that.data.controlsList
      })
    }



    //获取地图对象
    this.mapCtx = wx.createMapContext('map')

    //设置初始值
    this.initLoc().then(res => {
      //查看起始与终止是否有值
      that.checkAll()
    })
    wx.setStorageSync('flag', false)
  },

  //选择起始点
  bindKeyInputStart(e) {
    if (this.data.nowEnd != endDefault) {
      this.setData({
        hastip: false,
        tooltip:null
      })
    }
    wx.setStorageSync('flag', false)
    var query = wx.getStorageSync('nowStart');
    var region = wx.getStorageSync('region')
    if (!region) {
      return
    }
    var loc = {
      lat: wx.getStorageSync('startDetail').split(',')[1],
      lng: wx.getStorageSync('startDetail').split(',')[2]
    }
    var that = this

    wx.navigateTo({
      url: `/pages/picker/picker?query=${query}&region=${region}&flag=1&loc=${JSON.stringify(loc)}`,
      success: function () {
        // that.resetLoc(1)
      }
    })


  },
  //选择终止点
  bindKeyInputEnd(e) {
    
    wx.setStorageSync('flag', false)
    var query = wx.getStorageSync('nowEnd');
    var region = wx.getStorageSync('region');
    if(!region){
      return
    }
    var that = this;
    wx.navigateTo({
      url: `/pages/picker/picker?query=${query}&region=${region}&flag=0`,
      success: function () {
        // that.resetLoc(0)
      }
    })

  },
  //区域移动事件
  regionchange(e) {
    var that = this
    if (this.data.hasPrice) {
      this.setData({
             tooltip: null,
        hastip: false
      })
    }
    that.setData({
      circles: [],
      tooltip: null,
      hastip: false
    })

    setTimeout(function () {
      wx.setStorageSync(
        'flag', true)
    }, 1000)
  
    if (this.data.nowStart && this.data.nowEnd !== endDefault || e.type !== 'end' || !wx.getStorageSync('flag') || this.data.nowEnd != endDefault) {
      return
    }
    var that = this
    var latitude, longitude, name;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        latitude = res.latitude;
        longitude = res.longitude;

        that.getNearByDrivers(latitude, longitude).then(resolve => {
          var timeCha = that.DateCha(resolve.data.driver_eta)

          setTimeout(function () {
            that.setData({
              circles: [],
              tooltip: { text: resolve.data.display_text, hours: timeCha.hours, minutes: timeCha.minutes },
              hastip: true
            })
          }, 100)
        })
        that.getLocName(latitude, longitude, (res) => {
          // name = that.data.hasOpt || res.data.result.sematic_description
          name = res.data.result.pois[0].name + '附近';
          that.setData({
            circles: [],
            nowStart: name
          })
          wx.setStorageSync("region", res.data.result.addressComponent.city)
          wx.setStorageSync("nowStart", name)
          var details = res.data.result.addressComponent.city + res.data.result.addressComponent.district + ',' + res.lat + ',' + res.lng
          wx.setStorageSync("startDetail", details)

          that.checkAll()
        })

      }
    })
  },
  //定位按钮
  controltap(e) {
    var that = this
    if (that.data.clicktag === 0) {
      that.setData({
        clicktag: 1
      })
      if (e.controlId == 1) {
        var curLoc = wx.getStorageSync('curLoc')
        that.setData({
          tooltip: null,
          lat: curLoc.lat,
          lng: curLoc.lng
        })
        that.mapCtx.moveToLocation();
      
        this.regionchange(e)
        if (this.data.nowEnd == endDefault) {

          this.setData({
            tooltip: null,
            circles: [],
            scale: 18
          })
        }
      }
      setTimeout(function () {
        that.setData({
          clicktag: 0
        })
      }, 1500)
    } else {
      return false
    }
   
  },
  //附近出租车车主距离和时间
  getNearByDrivers(lat, lon) {
    var url = app.globalData.domin + '/passengertaxi/getNearByDrivers';
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: { lat, lon },
        method: 'GET',
        dataType: "json",
        success: function (res) {
          resolve(res)
        },
        fail: reject,
      })
    })

  },
  //请求方法
  fetch(url, type, data, header) {
    //返回一个promise对象处理异步逻辑
    if (!header) {
      header = {
        "Content-Type": 'json'
      }
    }

    return new Promise((success, fail) => {
      wx.request({
        url: url,
        data: data,
        header: header,
        method: type,
        dataType: "json",
        success: success,
        fail: fail,
      })
    })
  },
  changeEvent() {
  
   this.data.controlsList.forEach(ele=>{
     if(ele.id==1){
       ele.position.top = app.globalData.deviceInfo.screenHeight * 4.8 / 6
     }
   })
    this.setData({
      tooltip: null,
      hastip:false,
      changeShow: false,
      scale: 18,
      circles: []
    })
    this.resetLoc(2)
  }

  //已开通城市列表
  //  getCityDistrictList(){
  //    if(!wx.getStorageSync("havenCityList")){
  //      wx.request({
  //        url: app.globalData.domin + '/passengertaxi/getCityDistrictList',
  //        data:{
  //          user_cid:'42c5ee34-cff7-11e3-89a8-782bcb4cf8d8'
  //        },
  //        success:function(res){
  //           var cityList = res.data.list.map(ele => {
  //            return ele.province_name
  //          })
  //           cityList = Array.from(new Set(cityList))

  //           var arr = cityList.map(ele => {
  //             return {
  //               "name": ele,
  //               "key": "已开通城市"
  //             }
  //           })
  //           wx.setStorageSync("havenCityList",JSON.stringify(arr))
  //        }
  //      })
  //    }
  //  }
})