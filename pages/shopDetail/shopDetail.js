// pages/orderDetail/orderDetail.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    imgUrls: [
      { url: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg' },
      { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    circular: true,
    currentTab: 0,
    selected: true,
    hidden: true,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      itemId: options.itemId,
      region: options.region,
      fullregion: options.fullregion,
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.swiperFn();
    this.getshopinfo();
    this.receiveFn();
    this.swichNavFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //轮播
  swiperFn: function (event) {
    var that = this;
    var imgUrls = that.data.imgUrls;
    var indicatorDots = that.data.indicatorDots;
    if (imgUrls.length <= 1) {
      that.setData({
        indicatorDots: false
      })
    }
  },
  //商品信息的展示
  getshopinfo: function (event) {
    var that = this;
    var itemId = that.data.itemId;
    console.log(itemId)
    var sign = util.hexMD5('itemId=' + itemId + '&region=' + that.data.region + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/compitem/detail',
      data: {
        itemId: itemId,
        region: that.data.region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          goodsData: res.data.data,
          shoppingData: res.data.data.itemSkus[0]
        })
        var goodsData = that.data.goodsData;
        var itemSkus = goodsData.itemSkus;
        var currentid = itemSkus[0].id;
        var index = 0;
        that.setData({
          currentid: currentid,
          moq: itemSkus[index].moq == 0 ? 1 : itemSkus[index].moq,
          shopprice: (itemSkus[index].retailPrice).toFixed(2),
          skuId: itemSkus[index].id,
          company: goodsData.companyName
        })
      }
    })
  },
  //商品规格的选择
  specFn: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id
    var itemSkus = that.data.goodsData.itemSkus;
    for (var i = 0; i < itemSkus.length; i++) {
      if (id == itemSkus[i].id) {
        that.setData({
          currentid: id,
          moq: itemSkus[i].moq == 0 ? 1 : itemSkus[index].moq,
          shopprice: (itemSkus[i].retailPrice).toFixed(2),
          skuId: itemSkus[i].id,
          shoppingData: itemSkus[i]
        })
      }
    }
    that.setData({ skuId: id });
  },
  goodsNumFn: function (event) {
    var that = this;
    var shoppingData = that.data.shoppingData
    var moq = shoppingData.moq;
    that.setData({
      moq: (event.detail.value == "" || event.detail.value <= 1) ? 1 : (event.detail.value >= 9999 ? 9999 : event.detail.value),
      shoppingData: shoppingData
    })
    var moq = that.data.moq
    if ((typeof moq) !== Number && moq % 1 !== 0) {
      that.setData({
        moq: 1,
        shoppingData: shoppingData
      })
    }

  },
  //点击数量减少
  decrFn: function (event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    if (moq - 1 < 1) {
      var moq = 1;
    } else {
      var moq = moq - 1;
    }
    that.setData({
      moq: moq
    })

  },
  //点击数量增加
  incrFn: function (event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    if (moq + 1 >= 9999) {
      var moq = 9999;
    } else {
      moq = moq + 1;
    }
    that.setData({
      moq: moq
    })
  },

  //点击将数据存储到本地加入购物车
  addcarFn: function (event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    var goods = that.data.goodsData;
    var shoppingData = that.data.shoppingData;
    var skuid = event.currentTarget.dataset.skuid;
    let isExit = true;
    var shoppingcarData = wx.getStorageSync('shoppingcarData')
    if (shoppingcarData.length > 0) {
      for (var i = 0; i < shoppingcarData.length; i++) {
        if (shoppingcarData[i].skuId == skuid) {
          shoppingcarData[i].moq = moq;
          wx.setStorageSync('shoppingcarData', shoppingcarData)
          isExit = false;
          break;
        }
      }
    }
    if (isExit) {
      var shopData = [];
      shopData.push({
        moq: moq,
        skuId: skuid,
        id: goods.companyId,
        shopname: goods.name,
        seller:goods.companyName,
        companyId: goods.companyId,
        onlineTitle: goods.onlineTitle,
        fullregion: that.data.fullregion,
        shopprice: shoppingData.retailPrice.toFixed(2),
        specData: shoppingData.norm + shoppingData.units,
        retailPromotionPrice: shoppingData.retailPromotionPrice
      })
      var hb = shoppingcarData.concat(shopData)
      wx.setStorageSync('shoppingcarData', hb)
    }
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 500
    })
  },
  //点击立即购买
  boughtFn: function (event) {
    /*立即购买方法*/
    var that = this;
    var goods = that.data.goodsData;
    var shoppingData = that.data.shoppingData;
    wx.setStorageSync('orderData', [{
      shopname: goods.name,
      companyname: goods.companyName,
      skuId: that.data.skuId,
      companyId: goods.companyId,
      onlineTitle: goods.onlineTitle,
      fullregion: that.data.fullregion,
      shopprice: shoppingData.retailPrice,
      moq: that.data.moq <= 1 ? 1 : that.data.moq,
      specData: shoppingData.norm + shoppingData.units,
      retailPromotionPrice: shoppingData.retailPromotionPrice
    }])
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm'
    })
  },
  //点击切换至侃价页面
  bargainFn: function (e) {
    wx.navigateTo({
      url: '../bargain/bargain'
    })
  },
  //切换至服务商选择页面
  serviceproviderFn: function (e) {
    var that = this;
    var skuId = that.data.skuId;
    var itemId = that.data.itemId;
    var sellerData = wx.getStorageSync('sellerData')
    wx.setStorageSync('sellerData', [{ company: that.data.company, id: that.data.id, skuId: skuId }])
    wx.navigateTo({
      url: '../serviceprovider/serviceprovider?itemId=' + itemId + '&region=' + that.data.region + '&skuId=' + skuId
    })
  },
  //产品参数
  swichNavFn: function (event) {
    var that = this;
    var itemId = that.data.itemId
    var sign = util.hexMD5('itemId=' + itemId + gConfig.key);
    that.setData({
      selected: true,
      selected1: false,
      selected2: false
    })
    wx.request({
      url: gConfig.http + 'xcx/compitem/itemattr',
      data: { itemId: itemId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          shopinfo: res.data.data
        })
      }
    })
  },
  //商品介绍
  introduceFn: function (event) {
    var that = this;
    var itemId = that.data.itemId
    var sign = util.hexMD5('itemId=' + itemId + gConfig.key);

    that.setData({
      selected: false,
      selected1: true,
      selected2: false
    })
    wx.request({
      url: gConfig.http + 'xcx/compitem/iteminfo',
      data: { itemId: itemId, sign: sign },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var parameterData = res.data.data
        WxParse.wxParse('parameterData', 'html', parameterData, that, 5);
        that.setData({
          wxParseData: parameterData
        })
      }
    })
  },
  ensureFn: function (event) {
    var that = this;
    that.setData({
      selected: false,
      selected1: false,
      selected2: true
    })
  },
  //送货地址为空时
  receiveFn: function (event) {
    var that = this;
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
        if (addrList.length != 0) {
          for (var i = 0; i < addrList.length; i++) {
            if (addrList[i].isDefault == 1) {
              that.setData({
                isOver: false,
                addr: addrList[i].regionName + addrList[i].address,
              })
            }
          }
        } else {
          that.setData({
            isOver: true
          })

        }
      }
    })
  }
})
