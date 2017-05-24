// pages/center/center.js
Page({
  data: {},
  onShow: function () {
    // 页面显示
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          avatarUrl : res.userInfo.avatarUrl
        })
      }
    })
  },
  myAddrListFn: function (e) {
    var that=this;
    wx.navigateTo({
      url: '../addrOpt/addrOpt?management='+ true
    })
  },
  myOrderListFn: function () {
    wx.navigateTo({
      url: '../orderList/orderList',
      success:function(res){
         console.log(123)
       }
    })
  }
})