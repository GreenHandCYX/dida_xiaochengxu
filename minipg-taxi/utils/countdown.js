/**
 * '20180127172709'日期字符串转Date对象
 * @param DateStr  '20180127172709'日期字符串
 * @returns Date对象
 */
function dateStrToDate (DateStr) {
  if (!DateStr || DateStr.length !== 14) {
    return null;
  }
  let fmtStr = `${DateStr.slice(0, 4)}/${DateStr.slice(4, 6)}/${DateStr.slice(6, 8)} ${DateStr.slice(8, 10)}:${DateStr.slice(10, 12)}:${DateStr.slice(12, 14)}`;
  return new Date(fmtStr)
}

/**
 * 倒计时类
 * @param endDate
 * @param cb 每次更新时间回调
 * @param fmt 时间格式
 * @constructor
 */
class CountDown {
  constructor (op = {}, cb, fmt) {
    this.timer = null;
    if (op.endDate !== undefined) {
      this.endDate = new Date(op.endDate);
      this.leftTime = this.endDate - Date.now();
    } else if (op.leftTime !== undefined) {
      this.leftTime = op.leftTime;
      this.endDate = new Date(this.leftTime + Date.now());
    }
    this.cb = cb;
    this.fmt = fmt || 'mm分ss秒';
    this.isCut = op.isCut;
  }

  /**
   * 开始
   * @returns {CountDown}
   */
  start () {
    if (this.leftTime <= 0) {
      clearInterval(this.timer);
      this.leftTime = 0;
      typeof this.cb === 'function' && this.cb(this.leftTime, dateFmt(this.leftTime, this.fmt, true, true, true,this.isCut));
      return;
    }
    clearInterval(this.timer);
    typeof this.cb === 'function' && this.cb(this.leftTime, dateFmt(this.leftTime, this.fmt, true, true, true, this.isCut));
    this.timer = setInterval(() => {
      this.leftTime = this.endDate - Date.now();
      if (this.leftTime <= 0) {
        clearInterval(this.timer);
        this.leftTime = 0;
      }
      typeof this.cb === 'function' && this.cb(this.leftTime, dateFmt(this.leftTime, this.fmt, true, true, true, this.isCut));
    }, 100)
    return this;
  }

  /**
   * 停止
   * @returns {CountDown}
   */
  stop () {
    clearInterval(this.timer)
    return this;
  }
}

/**
 * 格式化时间
 * @param date
 * @param fmt 'yyyyMMdd hh:mm:ss:SS'
 * @param isUTC
 * @param isReturnObj
 * @param isLeftTime
 * @returns String
 */
function dateFmt (date, fmt, isUTC, isReturnObj, isLeftTime,isCut = true) {
  if (date === null || date === undefined || date === "") {
    return "";
  }
  let DateObj = new Date(date);

  var MONTH = isUTC ? DateObj.getUTCMonth() : DateObj.getMonth();
  if (MONTH !== MONTH) {
    return "";
  }
  var o = {
    "M": MONTH + 1,                                                              //月份
    "d": isUTC ? DateObj.getUTCDate() : DateObj.getDate(),                       //日
    "h": isUTC ? DateObj.getUTCHours() : DateObj.getHours(),                     //小时
    "m": isUTC ? DateObj.getUTCMinutes() : DateObj.getMinutes(),                 //分
    "s": isUTC ? DateObj.getUTCSeconds() : DateObj.getSeconds(),                 //秒
    "q": isUTC ? Math.floor((DateObj.getUTCMonth() + 3) / 3) : Math.floor((DateObj.getMonth() + 3) / 3), //季度
    "S": ~~(DateObj.getMilliseconds() / 10)                                      //毫秒
  };
  var FullYear = isUTC ? DateObj.getUTCFullYear() : DateObj.getFullYear();

  if (isLeftTime) {
    o.M--;
    o.d--;
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (FullYear + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + "+)").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, function ($0, $1) {
        return ($1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length))
      });
    }
  }
  if (isReturnObj) {
    if (isLeftTime && isCut ) {
      let mindex = fmt.match(/[1-9]/)
      if(mindex){
        mindex = mindex.index
        fmt = fmt.substr(mindex)        
      } else {
        fmt = ''
      }
    }
    return {
      fmt,
      o,
    }
  }
  return fmt;
}

/**
 * 格式化时间(今天,明天,昨天,年月)
 * @param dateStr
 */
function dateFmtPath (dateStr) {
  let date = dateStrToDate(dateStr);
  if (date === null || date === undefined || date === "") {
    return "";
  }
  let DateObj = date;

  var MONTH = DateObj.getMonth();
  if (MONTH !== MONTH) {
    return "";
  }
  const weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var o = {
    'y+': DateObj.getFullYear(),  //年
    "M+": MONTH + 1,              //月
    "d+": DateObj.getDate(),   //日
    "h+": DateObj.getHours(),     //小时
    "m+": DateObj.getMinutes(),   //分
    "w+": weekArr[DateObj.getDay()],     //星期
  };
  // 获取当前日期
  var fmt = 'MM月dd日(ww) hh:mm';
  var fmtObj = {
    '-1': '昨天(ww) hh:mm',
    '0': '今天(ww) hh:mm',
    '1': '明天(ww) hh:mm'
  }
  var nowDate = new Date();
  var dayDis = 999;
  if (DateObj.getFullYear() === nowDate.getFullYear() && DateObj.getMonth() === nowDate.getMonth()) {
    dayDis = DateObj.getDate() - nowDate.getDate()
    if (fmtObj[dayDis]) {
      fmt = fmtObj[dayDis]
    }
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, function ($0, $1) {
        if (("" + o[k]).length < 2) {
          return (("00" + o[k]).substr(("" + o[k]).length))
        }
        return o[k]
      });
    }
  }
  return fmt;
}


// let countDown = new CountDown(dateStrToDate("20180227172709"), function (leftTime, str) {
//   console.log(leftTime, str)
// },'hh小时mm分ss秒SS毫秒').start()

// let countDown = new CountDown({ leftTime: 24*60 * 60 * 1000 }, function (leftTime, returnObj) {
//   console.log(returnObj.fmt)
//   // console.log(leftTime, returnObj)
// }, 'dd天hh小时mm分ss秒SS毫秒').start()

module.exports = {
  CountDown,
  dateStrToDate,
  dateFmt,
  dateFmtPath,
}
