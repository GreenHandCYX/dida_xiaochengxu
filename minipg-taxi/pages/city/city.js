

var city = require('../../utils/citylist.js');
var app = getApp();
var nowCityList;
var lineHeight = 0;
var endWords = "";
var isNum;
Page({
  data: {
    "hidden": true,
    cityName: "", //获取选中的城市名
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var flag = options.flag;
    var region = options.nowCity;
    if(region.indexOf('市')>0){
     var region = region.slice(0,-1);
    }
    this.setData({
      flag:flag,
      region:region
    })
    // if(flag == 0){
      nowCityList = city.City[0];
    // }else{
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前起点只允许已开通城市',
    //     confirmColor: '#ff7500'
    //   })
    //   nowCityList = city.City[1];
    // }
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
    var cityChild = nowCityList
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        lineHeight = (res.windowHeight - 100) / 22;
        that.setData({
          city: cityChild,
          winHeight: res.windowHeight - 40,
          lineHeight: lineHeight
        })
      }
    })
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
  },
  //触发全部开始选择
  chStart: function () {
    this.setData({
      trans: ".3",
      hidden: false
    })
  },
  //触发结束选择
  chEnd: function () {
    console.log(this.endWords)
    this.setData({
      trans: "0",
      hidden: true,
      scrollTopId: this.endWords
    })
  },
  //获取文字信息
  getWords: function (e) {
    var id = e.target.id;
    this.endWords = id;
    isNum = id;
    this.setData({
      showwords: this.endWords == 're' ? '热' : this.endWords
    })
  },
  //设置文字信息
  setWords: function (e) {
    var id = e.target.id;
    this.setData({
      scrollTopId: id
    })
  },
  // 滑动选择城市
  chMove: function (e) {
    var y = e.touches[0].clientY;
    var offsettop = e.currentTarget.offsetTop;
    var height = 0;
    var that = this;
    ;
    var cityarr = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"]
    // 获取y轴最大值
    wx.getSystemInfo({
      success: function (res) {
        height = res.windowHeight - 10;
      }
    });
    //判断选择区域,只有在选择区才会生效
    if (y > offsettop && y < height) {
      // console.log((y-offsettop)/lineHeight)
      var num = parseInt((y - offsettop) / lineHeight);
      endWords = cityarr[num];
      // 这里 把endWords 绑定到this 上，是为了手指离开事件获取值
      that.endWords = endWords;
    };
    //去除重复，为了防止每次移动都赋值 ,这里限制值有变化后才会有赋值操作，
    //DOTO 这里暂时还有问题，还是比较卡，待优化
    if (isNum != num) {
      // console.log(isNum);
      isNum = num;
      that.setData({
        showwords: that.endWords
      })
    }
  },
  //选择城市，并让选中的值显示在文本框里
  bindCity: function (e) {
    var that = this
    var cityName = e.currentTarget.dataset.city;
   
    wx.redirectTo({
      url: `/pages/picker/picker?selectCity=${cityName}&flag=${that.data.flag}`,
    })
    // this.setData({ cityName: cityName })
  },
  getCurCity(){
    var that = this
    var cityName =this.data.region

    wx.redirectTo({
      url: `/pages/picker/picker?selectCity=${cityName}&flag=${that.data.flag}`,
    })
  }
})