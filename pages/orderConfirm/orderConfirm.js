// pages/orderConfirm/orderConfirm.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isDisplay: true,
    value: '请选择收货地址',
    // giftData: [
    // //   {
    // //   name: '敌敌畏',
    // //   spec: '瓶',
    // //   qty: '4'
    // // }, {
    // //   name: '鹤顶红',
    // //   spec: '瓶',
    // //   qty: '5'
    // // }
    // ],
    // coupon: [{ discount: 52 }, { discount: 89 }, { discount: 89 }, { discount: 89 }]
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var sellData = wx.getStorageSync('sellData')
    var wxData = wx.getStorageSync('wxData')
    var orderData = wx.getStorageSync('orderData')
    var isOpenPay = wxData.isOpenPay
    // var isOpenPay = 0
    var isShow, isDisplay;
    if (isOpenPay == 1) {
      isShow = true;
      isDisplay = false;
    } else {
      isShow = false;
      isDisplay = true;
    }
    that.setData({
      isShow: isShow,
      isDisplay: isDisplay,
      orderData: orderData
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this;
    var cutfee = 0;
    var userData = wx.getStorageSync('userData');
    var addressData = wx.getStorageSync('addressData');
    if (addressData) {
      //当地址自己选择时
      that.setData({
        value: addressData.regionName + addressData.address,
        mobile: addressData.mob,
        name: addressData.consignee,
        id: addressData.id
      })

    } else {
      //获取默认地址
      that.setDefaultAddrFn();
    }
    that.shoppriceDetailFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //收货地址选择
  addrOptFn: function (event) {
    var that = this;
    wx.navigateTo({
      url: '../addrOpt/addrOpt'
    })
  },
  //优惠劵的选择
  couponchoiceFn: function (event) {
    var that = this;
    var order = that.data.order;
    var couponinfo = that.data.couponinfo;
    if (couponinfo.length > 0) {
      if (order) {
        wx.navigateTo({
          url: '../coupons/coupons?order=' + 'name'
        })
      } else {
        wx.navigateTo({
          url: '../coupons/coupons'
        })
      }
    } else {
      wx.showToast({
        title: '暂无可用优惠劵',
        icon: 'faild',
        duration: 2000,
        mask: true
      })
    }

  },
  //每种商品的不同总价
  totalFn: function (event) {
    var that = this;
    var price = Number(that.data.shopprice);
    var freightfee = Number(that.data.freightfee);
    var foldingfee = Number(that.data.foldingfee);
    var coupon = Number(that.data.cutfee);
    console.log(coupon)
    that.setData({
      realfee: (price + freightfee - coupon - foldingfee).toFixed(2)
    })
  },
  wxpay: function () {
    // 下单方法
    var that = this;
    var foldingfee = Number(that.data.foldingfee);
    var coupons = that.data.coupons;
    var orderInfoData = wx.getStorageSync('orderData');
    var wxData = wx.getStorageSync('wxData');
    var couponData = wx.getStorageSync('couponData')
    var order = that.data.order;
    var companyData = wx.getStorageSync('sellData');
    var itemListData = [];
    for (var i = 0; i < orderInfoData.length; i++) {
      var companyId = orderInfoData[i].companyId
      if (coupons.length > 0) {
        if (couponData) {
          var code = couponData.code
          itemListData.push({
            id: orderInfoData[i].skuId,
            qty: orderInfoData[i].moq
          })
        } else {
          var code = coupons[0].code;
          itemListData.push({
            id: orderInfoData[i].skuId,
            qty: orderInfoData[i].moq
          })
        }
      } else {
        var code = 0;
        itemListData.push({
          id: orderInfoData[i].skuId,
          qty: orderInfoData[i].moq
        })
      }
    }
    wx.setStorageSync('delData', itemListData);
    if (that.data.mobile) {
      wx.request({
        url: gConfig.http + 'xcx/v2/order/save',
        data: {
          data: {
            "appId": "wxd00557c22dc314a0",
            'discount': foldingfee,
            "clientAddrId": that.data.id,
            "buyer": wxData.clientId,
            "companyId": companyData.companyId,
            "itemCartsList": [{
              "code": code,
              "itemList": itemListData,
              "key": "N" + companyId
            }],
            "logisticsId": 0,
            "orderSource": 3,
            "payMode": 1,
            "seller": companyData.companyId,
            "region": companyData.region
          }
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
              console.log('success')
            },
            'fail': function (res) {
              console.log('fail')
            }
          })
          // 微信支付接口
        },
      })
    } else {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    }
  },
  //当地址列表存储的数据为空时执行以下方法
  setDefaultAddrFn: function () {
    var that = this;
    var companyData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/address/list',
      data: {
        clientId: wxData.clientId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var addrList = res.data.data.list;
        for (var i = 0; i < addrList.length; i++) {
          if (addrList[i].isDefault == 1) {
            that.setData({
              value: addrList[i].regionName + addrList[i].address,
              mobile: addrList[i].mob,
              name: addrList[i].consignee,
              id: addrList[i].id
            })
          }
        }
      }
    })
  },
  //当商家不支持线上支付时，那么就执行以下方法
  placeOrderFn: function (event) {
    var that = this;
    var foldingfee = Number(that.data.foldingfee);
    var orderInfoData = wx.getStorageSync('orderData');
    var wxData = wx.getStorageSync('wxData');
        var coupons = that.data.coupons;
    var couponData = wx.getStorageSync('couponData')
    var order = that.data.order;
    var companyData = wx.getStorageSync('sellData');
    var itemListData = [];
    for (var i = 0; i < orderInfoData.length; i++) {
      var companyId = orderInfoData[i].companyId
      if (coupons.length > 0) {
        if (couponData) {
          var code = couponData.code
          itemListData.push({
            id: orderInfoData[i].skuId,
            qty: orderInfoData[i].moq
          })
        } else {
          var code = coupons[0].code;
          itemListData.push({
            id: orderInfoData[i].skuId,
            qty: orderInfoData[i].moq
          })
        }
      } else {
        var code = 0;
        itemListData.push({
          id: orderInfoData[i].skuId,
          qty: orderInfoData[i].moq
        })
      }
    }
    if (that.data.mobile) {
      wx.request({
        url: gConfig.http + 'xcx/v2/order/save',
        data: {
          data: {
            "appId": "wxd00557c22dc314a0",
            'discount': foldingfee,
            "clientAddrId": that.data.id,
            "buyer": wxData.clientId,
            "companyId": companyData.companyId,
            "itemCartsList": [{
              "code": code,
              "itemList": itemListData,
              "key": "N" + companyId
            }],
            "logisticsId": 0,
            "orderSource": 3,
            "payMode": 1,
            "seller": companyData.companyId,
            "region": companyData.region
          }
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          })
        }
      })
    }
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
        console.log(res)
        var goodsData = res.data.data;
        var sumtotal = 0;
        var sumfreight = 0;
        var promotionDiscount = 0;
        var items = goodsData[0].items;
        var orderGifts = [];
        var couponinfo = [];
        for (var z = 0; z < goodsData.length; z++) {
          sumtotal += goodsData[z].total;
          sumfreight += goodsData[z].freight;
          promotionDiscount += goodsData[z].promotionDiscount;
          var orderGifts = orderGifts.concat(goodsData[z].orderGifts);
          var couponinfo = couponinfo.concat(goodsData[z].coupons)
        }
        for (var j = 0; j < items.length; j++) {
          items[j].price = items[j].price.toFixed(2)
        }
        if (!orderGifts.length > 0) {
          that.setData({
            isGift: true
          })
        } else {
          that.setData({
            isGift: false,
            giftData: orderGifts
          })
        }
        if(promotionDiscount==0 || promotionDiscount==null){
          that.setData({
            isfold:true
          })
        }
        that.setData({
          items: items,
          coupons: couponinfo,
          foldingfee: promotionDiscount.toFixed(2),
          shopprice: (sumtotal).toFixed(2),
          freightfee: sumfreight.toFixed(2),
          couponinfo: couponinfo
        })
        that.couponFn()
      },
      fail:function(res){
        that.setData({
          iscoupon:true
        })
      }
    })
  },
  couponFn: function (event) {
    var that = this;
    var couponinfo = that.data.coupons;
    var couponData = wx.getStorageSync('couponData')
    if (couponinfo.length > 0) {
      if (couponData) {
        that.setData({
          cutfee: (couponData.discount).toFixed(2),
          discount: couponData.discount,
          iscoupon: false
        })
      } else {
        that.setData({
          cutfee: (couponinfo[0].discount).toFixed(2),
          discount: couponinfo[0].discount,
          iscoupon: false,
        })
      }
    } else {
      that.setData({
        iscoupon: true,
        iscut:true
      })
    }
    that.totalFn();
  }
})
