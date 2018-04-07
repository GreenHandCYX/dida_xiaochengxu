
var fetch = require('../../utils/fetch.js')
var app = getApp()
var utils = require('../../utils/util.js')

Page({
  data: {
    sugList: [],
    isShowCityPicker: false,
    hasStorage: false,
    canSelect: false,
    tip: ''
  },
  onShow() {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },
  onLoad(option) {
    // 新建百度地图对象 

    var that = this;

    let { query, flag, region, selectCity,loc } = option;
    var reg = /[\-'附近']/g
    region = region ||wx.getStorageSync('region')
    var reg2 = /[\'市']/g
    region = region.replace(reg2, '')
    selectCity = selectCity || ''
    loc = loc || '{}'
    query = query || ''
    query = query.replace(reg, '')
    // query = query.slice(0,i)
    // console.log(query)
    this.setData({ query, flag, region })

    that.setData({
      selectedCity: selectCity || region
    })

    //获取设备高度
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight
    })
    //查询起点是否有历史记录
    // var startVisited = JSON.parse(wx.getStorageSync('startVisited') || '[]');
    // if (startVisited.length > 0 && flag == 1) {
    //   return this.setData({
    //     hasStorage: true,
    //     query: '',
    //     sugStorageList: startVisited
    //   })
    //   // this.setData({
    //   //   hasStorage: true,
    //   //   sugStorageList: startVisited
    //   // })
    //   //  this.sugSearch(query, region).then((res) => {
    //   //   that.setData({
    //   //     sugList: res.data.results
    //   //   })
    //   // })
    // } else {
    //   //对当前位置进行模糊查询
    //   this.sugSearch(query, region).then((res) => {
    //     that.setData({
    //       sugList: res.data.results
    //     })
    //   })
    // }
    //查询终点是否有历史记录
    var visitedLocs = JSON.parse(wx.getStorageSync('visitedLocs') || '[]');

    if (visitedLocs.length > 0 && flag == 0) {
      return this.setData({
        hasStorage: true,
        query: '',
        sugStorageList: visitedLocs,
        initList: visitedLocs || []
      })
    } else if(flag == 1){
      loc = JSON.parse(loc)
      let baiduLat = utils.qq_coordinate_baidu(loc.lat,loc.lng).lat;
      let baiduLng = utils.qq_coordinate_baidu(loc.lat, loc.lng).lon;
      let url = 'https://api.map.baidu.com/place/v2/search'
      let data = {
        query:'地铁站',
        tag:'地铁站',
        location: baiduLat + ',' + baiduLng,
        radius:500,
        output:'json',
        page_size:20,
        ak: app.globalData.apk
      }
      that.fetch(url,'GET',data).then(res=>{
        that.setData({
          sugList: res.data.results,
          initList: res.data.results
        })
      })
    }
    else{
      //对当前位置进行模糊查询
      this.sugSearch(query, region).then((res) => {

        that.setData({
          sugList: res.data.results,
          initList: res.data.results
        })
      })
    }

  },
  //调出城市选择器
  showCityPicker() {
    var that = this

    wx.redirectTo({
      url: `/pages/city/city?flag=${that.data.flag}&nowCity=${that.data.region}`
    })
  }
  ,
  //推荐地址即模糊查询
  sugSearch(query, region) {
    var that = this

    return new Promise((success, rej) => {
      if (!query) return;
      var data = {
        query: query,
        region: region,
        output: 'json',
        city_limit: true,
        page_size: 20,
        ak: app.globalData.apk
      }

      that.fetch('https://api.map.baidu.com/place/v2/search', 'GET', data).then(res => {
        success(res)

      })

    })
  },

  //判断起始点与终止点确定城市列表
  getCityList(flag) {
    var cityList = [];
    return new Promise(success => {
      if (flag == 1) {
        cityList = this.getHavenCity()
      } else if (flag == 0) {
        //设置所有城市
        cityList = this.getAllCity();
      }
      return success(cityList)
    })

  }
  ,
  // 绑定input输入 
  bindKeyInput: function (e) {
    var that = this;
    if (e.detail.value.length<=0){
      return that.setData({
        sugList: that.data.initList || [],
        tip:''
      })
    }
    // 发起suggestion检索请求 
    this.setData({
      hasStorage: false,
      query: '',
      tip: ''
    })

    this.sugSearch(e.detail.value, that.data.selectedCity).then((res) => {
      
      that.setData({
        sugList: res.data.results
      })
      if (that.data.sugList.length <= 0) {

        that.setData({
          tip: '抱歉,未找到匹配信息'
        })
      }
    })

  }
  ,


  //点击选中
  selectLoc(e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var flag = that.data.flag;
    var item = e.currentTarget.dataset.item
    var tencentLoc = utils.baidu_coordinate_qq(item.split(',')[item.split(',').length - 2], item.split(',')[item.split(',').length - 1]);
    var details = [e.currentTarget.dataset.item.split(',')[0], tencentLoc.lat, tencentLoc.lon].join(',')

    if (flag == 1) {
      wx.setStorageSync("nowStart", name)
      wx.setStorageSync('startDetail', details)
      // var startVisited = JSON.parse(wx.getStorageSync('startVisited') || '[]');
      // var startVisitedStr = wx.getStorageSync('startVisited');
      // if (startVisited.length < 10 && startVisitedStr.indexOf(name) < 0) {
      //   startVisited.push({
      //     "name": name,
      //     "location": {
      //       "lat": e.currentTarget.dataset.item.split(',')[1],
      //       "lng": e.currentTarget.dataset.item.split(',')[2]
      //     },
      //     "long_address": details.split(',')[0]
      //   })
      //   wx.setStorageSync('startVisited', JSON.stringify(startVisited))

      // }
    } else if (flag == 0) {
      wx.setStorageSync("nowEnd", name)
      wx.setStorageSync('endDetail', details)

      var visitedLocs = JSON.parse(wx.getStorageSync('visitedLocs') || '[]');
      var visitedLocsStr = wx.getStorageSync('visitedLocs');
      var item = e.currentTarget.dataset.item
      if (visitedLocs.length < 10 && visitedLocsStr.indexOf(name) < 0) {
        visitedLocs.unshift({
          "name": name,
          "location": {
            "lat": item.split(',')[item.split(',').length-2],
            "lng": item.split(',')[item.split(',').length - 1]
          },
          "long_address": details.split(',')[0]
        })
        wx.setStorageSync('visitedLocs', JSON.stringify(visitedLocs))

      } else if (visitedLocs.length >=10){
        visitedLocs.pop();
        visitedLocs.unshift({
          "name": name,
          "location": {
            "lat": item.split(',')[item.split(',').length - 2],
            "lng": item.split(',')[item.split(',').length - 1]
          },
          "long_address": details.split(',')[0]
        })
        wx.setStorageSync('visitedLocs', JSON.stringify(visitedLocs))
      }
    }
    wx.reLaunch({
      url: `/pages/index/index?loc=${e.currentTarget.dataset.name}&from=picker`,
    })
  },
  //清空历史城市记录
  clearStorage() {
    if (this.data.flag == 0) {
      wx.removeStorageSync('visitedLocs')

    } else {
      // wx.removeStorageSync('startVisited')
    }

    this.setData({
      hasStorage: false,
      sugList: []
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
  }
})



