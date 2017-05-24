var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data:{isError: true},
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  nameFn:function(event){
    var that=this;
    that.setData({
      name:event.detail.value
    })
  },
  telFn:function(event){
    var that=this;
    that.setData({
      tel:event.detail.value
    })
  },
  priceFn:function(event){
    var that=this;
    that.setData({
      price:event.detail.value
    })
  },
  acreageFn:function(event){
    var that=this;
    that.setData({
      acreage:event.detail.value
    })
  },
  planFn:function(event){
    var that=this;
    that.setData({
      plan:event.detail.value
    })
  },
 //点击时可以请求接口和判断数据是否符合规定的要求
  commitFn: function (event) {
      var that = this;
      var sellData=wx.getStorageSync('sellData')
      if (that.data.name == '' || that.data.name == null) {
          that.setData({
            errorMsg: '请填写姓名',
            isError: ''
          })
        } else if (that.data.tel == '' || !(/^1[34578]\d{9}$/.test(that.data.tel))) {
          that.setData({
            errorMsg: '手机号格式错误',
            isError: ''
          })
        } else if (that.data.acreage == '' || that.data.acreage == null) {
          that.setData({
            errorMsg: '请填写正确的种植面积',
            isError: ''
          })
      }  else if (that.data.price == '' || that.data.price == null) {
          that.setData({
            errorMsg: '请填写正确的价格',
            isError: ''
          })
      } else if (that.data.plan == '' || that.data.plan == null) {
          that.setData({
            errorMsg: '请填写正确的采购量',
            isError: ''
          })
      }else{
            wx.request({
              url:gConfig.http + 'xcx/compitem/kanjia',
              data:{
                area:that.data.acreage,
                companyId:sellData.companyId,
                mob:that.data.tel,
                name:that.data.name,
                price:that.data.price,
                qty:that.data.plan,
              },
               header: {
                  'content-type': 'application/json'
                },
                success:function(res){
                  console.log(res)
                  wx.showToast({
                    title: '侃价成功',
                    icon: 'success',
                    duration: 2000,
                    success:function(){
                      wx.navigateBack({
                              delta: 1,
                      })
                    }
                  })
          }
      })
    }
  }
})