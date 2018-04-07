var app = getApp();
const EventEmitter = require('./events');
const { CusBASE64 } = require('./base64');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

myEmitter.setMaxListeners(300)
var socketIsOpen = 0
var UserCloseSocket = false 
var failNum = 0
var reConnect = 0
var sentPingTime = null
var Unauthorized = false


// WebSocket建立连接～～
myEmitter.on('connectSocket', function () {
  const token = encodeURIComponent(app.globalData.token);
  console.log(token)
  if (socketIsOpen) {
    console.log('socketIsOpen')
    return false
  } else {
    // wx.closeSocket()
    console.log('请求长连接')
    wx.connectSocket({
      url: `${app.globalData.WsDomin}?cid=${app.globalData.cid}&token=${token}`,
      method: "GET"
    })
  }
})

myEmitter.on('UserCloseSocket', function () {
  UserCloseSocket = true
  wx.closeSocket()
  clearTimeout(sentPingTime)
})



// WebSocket连接关闭～～
wx.onSocketClose(function () {
  socketIsOpen=0
    if (UserCloseSocket){
      console.log('客户端关闭WebSocket连接～～')
      return false
    }else{
      console.log('服务器关闭WebSocket连接～～')
      if (Unauthorized) {
        // 服务器端关闭链接(登录账号被踢掉)
        return false
      }
      // 其他原因导致的关闭就重新请求
      setTimeout(function () {
        myEmitter.emit('connectSocket')
      }, 5000)
    }
  // myEmitter.on('closeSocket')
})


// WebSocket连接打开失败，请检查！
wx.onSocketError(function () {
  console.log('WebSocket连接打开失败，请检查！')
  setTimeout(function () {
    myEmitter.emit('connectSocket')
  }, 5000)
  // myEmitter.emit('errorSocket');
})

// WebSocket连接打开成功！！！！
wx.onSocketOpen(function (res) {
  console.log('WebSocket连接打开成功！！！！')
  socketIsOpen = 1
  Unauthorized = false
  failNum = 0
  clearTimeout(sentPingTime)
  sentPingTime = setTimeout(sentPing, 55000);
})


function sentPing() {
  failNum++
  // ws - 发送ping
  console.log('ws-发送ping')
  wx.sendSocketMessage({
    data: ''
  })
  if (failNum < 4) {
    sentPingTime = setTimeout(sentPing, 55000)
  } else {
    // 服务器端3次未回复pong心跳应答包，则客户端断开连接
    myEmitter.emit('UserCloseSocket')
  }
}
// WebSocket连接成功接收到消息
wx.onSocketMessage(function (res) {
  // 返回pong,failnum清空为0
  if (res == 0) {
    failNum = 0
    // ws-返回pong
    console.log('ws-返回pong')
    clearTimeout(sentPingTime)
    sentPingTime = setTimeout(sentPing, 55000);
    return false
  }
  var data = JSON.parse(res.data);
  if (data.dat == 1) {
    // 服务器端关闭链接
    Unauthorized = true
    return false
  }
  if (data.dat == 2) {
    // 服务器端无法处理消息
    return false
  }


  if (data.req) {
    var reqStr = JSON.stringify({ ack: data.req })
    wx.sendSocketMessage({
      data: reqStr
    })
  }
  failNum = 0
  if (data.typ == 1) {
    // 订单发送push消息
    var dat = JSON.parse(data.dat)
    myEmitter.emit('orderPushStatus', dat);
  }
  // if (dat.typ == 1){
  //   myEmitter.emit('orderStatus1', dat);
  // }
  // if (dat.typ == 2){
  //   myEmitter.emit('orderStatus2', dat);
  // }

})


module.exports = {
  myEmitter
}