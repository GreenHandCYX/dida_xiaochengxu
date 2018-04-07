var CusBase64 = require('base64.js');
// var app = getApp();
function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + '+' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function accAdd(arg1, arg2) {
  var r1, r2, m;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}
//给Number类型增加一个add方法，调用起来更加方便。 
Number.prototype.add = function (arg) {
  return accAdd(arg, this);
}
//减法函数，用来得到精确的减法结果 
//说明：javascript的减法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的减法结果。 
//调用：accSubtr(arg1,arg2) 
//返回值：arg1减去arg2的精确结果 
function accSubtr(arg1, arg2) {
  var r1, r2, m, n;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2));
  //动态控制精度长度
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
//给Number类型增加一个subtr 方法，调用起来更加方便。 
Number.prototype.subtr = function (arg) {
  return accSubtr(arg, this);
}

//返回曼哈顿距离，单位是m  
function calcDistance(lon1, lat1, lon2, lat2) {

  //check一下，lon，lat是否格式正确
  if (isNaN(lon1) || isNaN(lon2) || isNaN(lat1) || isNaN(lat2)) {
    return -1;
  }
  var R = 6378.138;
  var dx = Math.abs(accSubtr(lon1, lon2)) * Math.PI / 180 * R;
  var dy = Math.abs(accSubtr(lat1, lat2)) * Math.PI / 180 * R;
  return Math.floor((accAdd(dx, dy)) * 1000);
}

function qq_coordinate_baidu(gcjLat, gcjLon) {
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = gcjLon, y = gcjLat;
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  var bdLon = z * Math.cos(theta) + 0.0065;
  var bdLat = z * Math.sin(theta) + 0.006;
  return { 'lat': bdLat, 'lon': bdLon };
}
//经纬度转换 百度 to 腾讯 
function baidu_coordinate_qq(bdLat, bdLon) {
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = bdLon - 0.0065, y = bdLat - 0.006;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var gcjLon = z * Math.cos(theta);
  var gcjLat = z * Math.sin(theta);
  return { 'lat': gcjLat, 'lon': gcjLon };
}

function joinJson(jsonbject1, jsonbject2) {
  var resultJsonObject = {};
  for (var attr in jsonbject1) {
    resultJsonObject[attr] = jsonbject1[attr];
  }
  for (var attr in jsonbject2) {
    resultJsonObject[attr] = jsonbject2[attr];
  }
  return resultJsonObject;
}

function dida_setStorageSync(key, value, ifNeedClear) {  //
  if (ifNeedClear == 1) {
    var new_value = wx.getStorageSync("needClear");
    // console.log(new_value);
    if (!new_value || new_value.length == 0) {
      new_value = {};
    }
    /*var new_key_value = '{"' + key + '":"' + value + '"}';
    new_key_value = JSON.parse(new_key_value);*/
    var new_key_value = {};
    var mykey = key;
    new_key_value[mykey] = value;
    new_value = joinJson(new_value, new_key_value)
    wx.setStorageSync("needClear", new_value);
  }
  wx.setStorageSync(key, value);
  //console.log("add_after:"+JSON.stringify(wx.getStorageSync("needClear")));
}

function dida_removeStorageSync(key) {  //
  // console.log("remove_before:" + wx.getStorageSync(key));
  wx.removeStorageSync(key);
  // console.log("remove:" + wx.getStorageSync(key));
  var new_value = wx.getStorageSync("needClear");
  delete new_value[key];
  wx.setStorageSync("needClear", new_value);
  //console.log("remove_after:"+ JSON.stringify(wx.getStorageSync("needClear")));
}
function dida_clearStorageSync() {  //
  var keys = wx.getStorageInfoSync().keys;
  // console.log("before_clear:" + keys);
  var needClear = wx.getStorageSync("needClear");
  // console.log("needClear:"+needClear);
  if (keys){
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] != "needClear") {
        wx.removeStorageSync(keys[i]);
      }
    }
  }
  // console.log("after_clear:"+wx.getStorageInfoSync().keys);
  if(needClear) {
    for (var item in needClear) {
      wx.setStorageSync(item, needClear[item]);
    }
  }
  // console.log("set_clear:"+wx.getStorageInfoSync().keys);
}
/*function getNetworkType() {
  wx.getNetworkType({
    success: function (res) {
      var networkType = {
        "net":res.networkType;
      }
      if(ddc) {
        ddc = joinJson(ddc,systemInfo);
      } else {
        ddc = networkType;
      }
    }
  })
}*/
/*function getSystemInfoSync(ddc) {
  wx.getSystemInfo({
    success: function (res) {
      var systemInfo = {
        "screen": res.screenWidth + '*' + res.screenHeight;
        "os": res.system;
        "model":res.brand;
      }
      if(ddc) {
        ddc = joinJson(ddc,systemInfo);
      } else {
        ddc = systemInfo;
      }
    }
  })
}*/
function getLocation(obj, app, success, fail) {
  //定位获取不到
  wx.getLocation({
    type: 'gcj02',
    success: function (res) {
      var getLocation = {
        "latitude": res.latitude,
        "longitude": res.longitude
      }
      setHttpInfo(getLocation, obj, app, success, fail);
    }
  })
}
function setHttpInfo(location, obj, app, success, fail) {
  //处理http的header，data，url等信息
  var time = formatTime(new Date());
  var ddc = joinJson(app.globalData.deviceInfo, location);
  ddc = joinJson(ddc, { "location_time": time, "mobiletype": "mini", "version": "7.0.5.minipg_taxi" });
  // mobiletype todo
  ddc = JSON.stringify(ddc);
  ddc = CusBase64.CusBASE64.encoder(ddc);
  var header = { "ddcinfo": ddc, "Content-Type": "application/x-www-form-urlencoded" };
  if (obj.header) {
    header = joinJson(obj.header, header);
  }
  var data, url;
  var method = "get";
  if (obj.method) {
    method = obj.method;
  }
  if (method.toUpperCase() == "POST" || method.toUpperCase() == "PUT") {
    if (obj.url.indexOf("?") == -1) {
      url = obj.url + "?";
    } else {
      url = obj.url + "&";
    }
    url = url + "token=" + encodeURIComponent(app.globalData.token) + "&cid=" + app.globalData.cid;
    data = obj.data;
  } else if (method.toUpperCase() == "DELETE" || method.toUpperCase() == "GET") {
    data = { "token": app.globalData.token, "cid": app.globalData.cid };
    if (obj.data) {
      data = joinJson(obj.data, data);
    }
    url = obj.url;
  }
  var response = 0;
  if (obj.response) {
    response = obj.response;
  }
  var httpInfo = { "header": header, "method": method, "data": data, "url": url, "response": response };
  dida_req(httpInfo, success, fail);
}
function dida_req(httpInfo, success, fail) {
  wx.request({
    url: httpInfo.url,
    data: httpInfo.data,
    header: httpInfo.header,
    method: httpInfo.method,
    success: function (res) {
      if (res.code == 401 || res.data.code == 401) {
        // todo,code
        // app.globalData.token = ''
        // app.globalData.cid = ''
        // app.globalData.user_cid = ''
        dida_clearStorageSync();
        wx.redirectTo({
          url: '../login/login'
        })
      } else if (res.code == 0 || res.data.code == 0 || res.status == 0 || res.data.status == 0) {
        // console.log(success);
        success(res)
      } else {
        if (httpInfo.response == 1) {
          fail(res);
        } else {
          var message = res.message || res.data.message;
          wx.showToast({
            title: message,
            icon: 'none',
            duration: 3000
          })
        }

      }
      if (res.code == 401 || res.data.code == 401) {
        var app = getApp()
        dida_clearStorageSync();
        if (app.globalData.firstLoad) {
          app.globalData.firstLoad = false
        } else {
          dida_removeStorageSync('session');
        }
        wx.redirectTo({
          url: '../login/login'
        })
      } 
    },
    fail: function (res) {
      wx.showToast({
        title: "网络有点慢，稍后再试一下吧",
        icon: 'none',
        duration: 3000
      })
    }
  })
}
/*
  调用嘀嗒接口封装方法，传入了header信息，data里传入了token，cid，并对鉴权失败做了处理
    dida_wxrequest({
      url:,  //必须
      data:,  //非必须，不用传token，cid
      header:,  //非必须，Content-Type已统一处理，不用传
      method:,   //非必须，默认get
      thisObj: //非必须，that
      response: // 非必须，默认0，只传success，1：success，fail
   
    }).then(success=>{
      //成功回调,http为200，code==0
    },fail=>{
      //失败回调，http为200，code！=0
    });
*/

function dida_wxrequest(obj) {
  return new Promise((success, fail) => {
    var app = getApp() || obj.thisObj;
    getLocation(obj, app, success, fail);
  })
}
module.exports = {
  formatTime: formatTime,
  qq_coordinate_baidu: qq_coordinate_baidu,
  baidu_coordinate_qq: baidu_coordinate_qq,
  dida_wxrequest: dida_wxrequest,
  calcDistance: calcDistance,
  dida_setStorageSync: dida_setStorageSync,
  dida_removeStorageSync: dida_removeStorageSync,
  dida_clearStorageSync: dida_clearStorageSync
}
