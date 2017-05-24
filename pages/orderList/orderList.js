// pages/orderList/orderList.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    ispaid: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var isOpenPay = wxData.isOpenPay
    // var isOpenPay = 0;
    if (isOpenPay == 1) {
      that.setData({
        isDisplay: true
      })
    } else {
      that.setData({
        isDisplay: false
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    let that = this;
    if (that.data.isDisplay) {
      that.unPaidListFn();
    } else {
      that.saveorderFn();
    }

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //未支付
  unPaidListFn: function () {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&sdate=0&status=1' + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/order/list',
      data: {
        clientId: wxData.clientId,
        sdate: 0,
        status: 1,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        var listData = res.data.data;
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount == 0) {
            that.setData({
              isMoney: true
            })
          } else {
            isMoney: false
          }
        }
        that.setData({
          listData: listData,
          ispaid: true
        })
      }
    })
  },
  //已支付
  paidListFn: function () {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&sdate=0&status=2' + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/order/list',
      data: {
        clientId: wxData.clientId,
        sdate: 0,
        status: 2,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var listData = res.data.data;
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount == 0) {
            that.setData({
              isMoney: true
            })
          } else {
            isMoney: false
          }
        }
        that.setData({
          unListData: listData,
          ispaid: ''
        })
      }
    })
  },
  //未支付订单点击跳转订单详情页面
  orderDetailFn: function (event) {
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId + '&ispaid=' + that.data.ispaid
    })
  },
  //取消订单
  cancleFn: function (event) {
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    var orderList = that.data.listData;
    var index = {};
    var sign = util.hexMD5('id=' + orderId + gConfig.key);
    for (let i = 0; i < orderList.length; i++) {
      orderList[i].index = i;//闭包
      if (orderList[i].id == orderId) {
        wx.showModal({
          title: '取消提示',
          content: '您确定要取消该订单吗？',
          success: function (res) {
            if (res.confirm) {
              orderList.splice(orderList[i].index, 1);/*从当前列表删除*/
              /*--重新渲染--*/
              wx.request({
                url: gConfig.http + 'xcx/order/del',
                data: { id: orderId, sign: sign },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  that.setData({
                    listData: orderList
                  })
                }
              })
            }
          }
        })
      }
    }
  },
  placeOrderFn: function (event) {
    // 下单方法
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('orderId=' + orderId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/wx/prepardId',
      data: {
        orderId: orderId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function (res) {
          },
          'fail': function (res) {
            console.log('fail')
          }
        })
        // 微信支付接口
      }
    })
  },
  // 当商家不支持支付时
  saveorderFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&sdate=0&status=1' + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/order/list',
      data: {
        clientId: wxData.clientId,
        sdate: 0,
        status: 1,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var listData = res.data.data;
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount == 0) {
            that.setData({
              isMoney: true
            })
          } else {
            isMoney: false
          }
        }
        that.setData({
          listData: listData,
          ispaid: true
        })
      }
    })
  },
  orderFn: function (event) {
    var that = this;
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId
    })
  }
})