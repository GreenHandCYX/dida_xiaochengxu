
//封装请求
module.exports = (url,type,data,header) => {
  //返回一个promise对象处理异步逻辑
  if(!header){
    header = {
      "Content-Type": 'json'
    }
  }

  return new Promise((success,fail)=>{
    wx.request({
      url: url,
      data: data,
      header:header,
      method: type,
      dataType: "json",
      success: success,
      fail: fail,
    })
  })
}