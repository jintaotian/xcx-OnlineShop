App({
  onLaunch: function () {
    wx.clearStorage();
    this.wxLogFn();
  },
  wxLogFn: function () {
    var that = this;
    var util = require('utils/md5.js');
    wx.login({
      success: function (res) {
        var sign = util.hexMD5('code=' + res.code + '&companyId=' + 10000036 + that.key);
        if (res.code) {
          wx.request({
            url: that.http + 'xcx/v2/common/login',
            data: {
              code: res.code,
              companyId: 10000036,
              sign: sign
            },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              wx.setStorageSync('wxData',{
                "wxOpenid": res.data.data.wxOpenid,
                "clientId": res.data.data.clientId,
                "isOpenPay": res.data.data.isOpenPay,
                "companyId":10000036
              });
              wx.setStorageSync('shoppingcarData', []);
              var wxData = wx.getStorageSync('wxData')
            },
            fail:function(){
              console.log(4168468)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  http: "https://xcx.51zhongzi.com/farms-msi/",
  key: '&key=9da1ec1d11f0401968d52cab64df46d8'
})
