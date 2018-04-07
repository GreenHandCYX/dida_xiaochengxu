
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    animationData: "",
    showModalStatus: false,
    taxi_ride_id:"",
    evainfo:false,
    evainfo1:false,
    evainfo2:false,
    text1:false,
    text2:false,
    evalist:[],
    showDiverInfo:true,
    diverName:"",
    diverCar:"",
    diverCompany:"",
    diverImg:"",
    driverPhone:"",
    price:"",
    status:"",
    user_cid:app.globalData.user_cid,
    answerList:[{
        title:"车内是否有异味",
        optionOne:"无异味",
        optionTwo: "有异味",
        falg:0
      },
        {
          title: "座套是否清洁干净",
          optionOne: "干净",
          optionTwo: "不干净",
          falg:0
        }
      ]
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
            user_cid: app.globalData.user_cid,
            taxi_ride_id: that.data.taxi_ride_id
          }
        }).then(success=>{
          console.log(success);
            if(success.data.taxi_ride.review_closed==1) {
              if(success.data.taxi_ride.review_as_author) {
                this.setData({
                  evalist: success.data.taxi_ride.review_as_author.tags,
                  evainfo1:true
                })
              } else {
                this.setData({
                  evainfo2:true
                })
              }             
            } else {
              this.setData({
                evainfo:true
              })
              this.showModal();
            }
            this.setData({
              diverName: success.data.taxi_ride.driver_info.nick_name,
              diverCar:success.data.taxi_ride.driver_info.car_no,
              diverCompany:success.data.taxi_ride.driver_info.company_name,
              diverImg:success.data.taxi_ride.driver_info.avatar_url,
              driverPhone:success.data.taxi_ride.driver_info.phone_no,
              price:success.data.taxi_ride.price,
              status:success.data.taxi_ride.status
            })
            if(this.data.status == 7) {
              this.setData({
                text2:true
              })
            } else {
              this.setData({
                text1:true
              })
            }
          },fail=>{
            //失败回调
          });
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/getReviewTagsContent',
      data: {
        user_cid: app.globalData.user_cid
      }
    }).then(success=>{
        //成功回调
      if(success.data.List && success.data.List.length>0) {
          this.setData({
            answerList:success.data.List
          });
      }
    },fail=>{
      //失败回调
    });
  },
  callToDriver:function() {
    wx.makePhoneCall({
      phoneNumber: this.data.driverPhone
    })
  },
  back:function() {
    wx.removeStorageSync('aboarding')
    wx.reLaunch({
      url: '../index/index'
    })
  },
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(400).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(400).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
    var answerList_length = this.data.answerList.length;
    for (var i = 0; i < answerList_length; i++) {
      this.data.answerList[i].falg = 0;
    }
    this.setData({ answerList: this.data.answerList})
    console.log(this.data.answerList)
  },
  highligt:function(e){
    var index = e.currentTarget.dataset.index;
    if(e.currentTarget.dataset.select=='a') {
      this.data.answerList[index].falg = 1;
    } else if(e.currentTarget.dataset.select=='b') {
      this.data.answerList[index].falg = 2;
    }    
    this.setData({ answerList: this.data.answerList})
  },
  submit:function(){
    var that = this
    console.log(this.data.answerList);
    var answerList = this.data.answerList;
    var tag = '{';
    for (var i = 0; i < answerList.length; i++) {
      if(answerList[i].falg == 0) {
        wx.showToast({
          title: '请完成每一项评价再提交哦',
          icon: 'none',
          duration: 2000
        })
        return;
      } else {
        tag = tag + '"'+(i+1)+'":'+answerList[i].falg+',';
      }
    }
    tag = tag.substring(0,tag.length-1);
    tag = tag +'}';
    console.log(tag);
    util.dida_wxrequest({
      url: app.globalData.domin + '/passengertaxi/reviewTaxiRide',
      data: {
        user_cid: app.globalData.user_cid,
        // taxi_ride_id:326725,
        taxi_ride_id:this.data.taxi_ride_id,
        tag_json:tag,
        score:0,
        content:0,
        tags:0
      },
      method: 'post'
    }).then(success=>{
        //成功回调
        var that = this;
        that.setData({
            evainfo: false,
            evainfo1:true
          })
        this.hideModal();
        util.dida_wxrequest({
          url: app.globalData.domin + '/passengertaxi/getTaxiRideDetail',
          data: {
            user_cid: app.globalData.user_cid,
            taxi_ride_id: that.data.taxi_ride_id
            // user_cid:'1d5213c9-0c24-4edc-92df-c162d961a3b3',
            // taxi_ride_id:326725,
          }
        }).then(success=>{
            //成功回调
            that.setData({
              evalist: success.data.taxi_ride.review_as_author.tags
            }) 
          },fail=>{
            //失败回调
          });        
      },fail=>{
        //失败回调
      });
  },
  cxrule:function(){
    wx.navigateTo({
      url: '../rule/rule'
    })
  }
})