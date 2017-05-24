// pages/addrEdit/addrEdit.jsx
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    apply: false,
    used: '立即使用',
    useing: 'useing',
    // coupon: [{
    //   discount: 50,
    //   fullPrice: 65,
    //   useEndTime: '2017-5-31',
    //   id: 55665
    // }, {
    //   discount: 500,
    //   fullPrice: 625,
    //   useEndTime: '2017-5-31',
    //   id: 55668
    // }, {
    //   discount: 50,
    //   fullPrice: 65,
    //   useEndTime: '2017-5-31',
    //   id: 55665
    // }, {
    //   discount: 500,
    //   fullPrice: 625,
    //   useEndTime: '2017-5-31',
    //   id: 55668
    // }]
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      order: options.order
    })
    var shoplistdata = wx.getStorageSync('shoplistdata')
    that.setData({
      shoplistdata: shoplistdata,
    })
  },
  onShow: function () {
    // 页面显示
    var that = this;
    this.shoppriceDetailFn();
    var couponData = wx.getStorageSync('couponData');
    if (couponData.length > 0) {
      for (var i = 0; i < couponData.length; i++) {
        if (couponData[i].couponcode == -1) {
          that.setData({
            apply: true,
            used: '已使用',
            usenone: 'usenone',
          })
        }
      }
    }

  },
  rightFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var cartid=wxData.companyId
    var id = event.currentTarget.dataset.id;
    var coupon = that.data.coupon;
    console.log(coupon)
    var goodsData = that.data.goodsData;
    var couponlistdata = [];
    for (var i = 0; i < coupon.length; i++) {
      if (coupon[i].id == id) {
        wx.setStorageSync('couponData', {
          id: id,
          discount: coupon[i].discount,
          code: coupon[i].code,
          fullPrice: coupon[i].fullPrice,
          name: coupon[i].name
        })
      }

    }
    wx.navigateBack({
      dleta: 1,
    })
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + cartid + '&couponId=' + id + gConfig.key);
    wx.request({
      url: gConfig.http + "xcx/coupon/ledcoupon",
      data: {
        clientId: wxData.clientId,
        companyId: cartid,
        couponId: id,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var couponcode = res.data.result.code
        if (couponcode == 200) {
          that.setData({
            apply: true,
            used: '已使用',
            usenone: 'usenone',
          })
        }
      }
    })
  },
  //获取买家所花费具体金额的方法
  shoppriceDetailFn: function (event) {
    var that = this;
    var orderInfoData = wx.getStorageSync('orderData');
    var sellData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData')
    let data = {};
    let items = {};
    for (let j = 0; j < orderInfoData.length; j++) {
      var companyId = orderInfoData[j].companyId
      let ncompanyId = `N${companyId}`;
      data[ncompanyId] = {
        clientId: wxData.clientId,
        companyId: companyId,
        items: items,
        region: sellData.region
      }
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].moq
      }
    }
    wx.request({
      url: gConfig.http + 'xcx/v2/order/itemsAmount',
      data: { data },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var goodsData = res.data.data;
        var couponData=goodsData[0].coupons;
        for(var i=0;i<couponData.length;i++){
          couponData[i].useEndTime = couponData[i].useEndTime.slice(0, 10)
        }
        that.setData({
          couponlist: goodsData,
          coupon: couponData,
          goodsData: goodsData
        })
      }
    })
  }
})
