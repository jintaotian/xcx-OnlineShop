// pages/orderDetail/orderDetail.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    contactname:'联系方式'
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var isOpenPay=wxData.isOpenPay
    // var isOpenPay = 0;
    if (isOpenPay == 1) {
      that.setData({
        isPay: false,
        orderId: options.orderId,
        ispaid: options.ispaid
      })
    } else {
      that.setData({
        isPay: true,
        orderId: options.orderId
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.orderDetailFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //打电话接口
  phone: function (event) {
    var that = this;
    var mob = that.data.contactMob;
    wx.makePhoneCall({
      phoneNumber: mob
    })
  },
  orderDetailFn: function (event) {
    var that = this;
    var orderId = that.data.orderId;
    var sign = util.hexMD5('orderId=' + orderId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/v2/order/detail',
      data: { orderId: orderId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var orderDetailData = res.data.data;
        var companyData = res.data.data.company;
        var itemsData = res.data.data.items;
        if(!orderDetailData.contact){
          that.setData({
            contactname:orderDetailData.contact,
            isContact:false
          })
        }else{
          that.setData({
            contactname:'联系方式 :',
            isContact:true
          })
        }
        for (var i = 0; i < itemsData.length; i++) {
          itemsData[i].price = itemsData[i].price.toFixed(2)
        }
        that.setData({
          orderDetailData: orderDetailData,
          companyData: companyData,
          itemsData: itemsData,
        })
        that.setData({
          shopprice: (orderDetailData.amount).toFixed(2),
          cutfee: (orderDetailData.couponDiscount).toFixed(2),
          freightfee: (orderDetailData.feeAmount).toFixed(2),
          foldingfee:(orderDetailData.discount).toFixed(2),
          totalfee: (orderDetailData.amount + orderDetailData.feeAmount - orderDetailData.couponDiscount).toFixed(2),
          timeStamp: orderDetailData.addedTime
        })
      }
    })
  },
  //取消订单
  cancleFn: function (event) {
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('id=' + orderId + gConfig.key);
    wx.showModal({
      title: '取消提示',
      content: '您确定要取消该订单吗？',
      success: function (res) {
        if (res.confirm) {
          /*--重新渲染--*/
          wx.request({
            url: gConfig.http + 'xcx/order/del',
            data: {
              id: orderId,
              sign: sign
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                wx.switchTab({
                  url: '../index/index'
                })
              }, 1500)
            }
          })

        }
      }
    })
  },
  placeOrderFn: function (event) {
    // 下单方法
    var that = this;
    var sellData = that.data.sellData;
    var companyId = sellData.companyId;;
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('orderId=' + orderId + '&companyId=' + companyId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/v2/wx/prepardId',
      data: {
        orderId: orderId,
        companyId: companyId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // 微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function (res) {
            wx.switchTab({
              url: '../index/index'
            })
          }
        })
        // 微信支付接口
      }
    })
  }
})
