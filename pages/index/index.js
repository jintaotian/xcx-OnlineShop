// pages/index/index.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    imgUrls: [
      { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
      { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
      { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg' },
      { url: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' }
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    swiperCurrent: 0,
    circular: true,
    search: false,
    hidden: true,
    isPosition: true,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参
    var that = this;
    var sign = util.hexMD5('companyId=' + 10000036 + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/company/info',
      data: {
        companyId: 10000036,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.setNavigationBarTitle({ title: res.data.data.name })
      }
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this;
    that.registerFn();
    that.swiperFn();
    that.getPositionFn();
    that.setData({ dot: false, iscome: true, dotclass: ['on', '', ''], })


  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  // 注册页面
  registerFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    if (wxData.clientId == 0) {
      wx.navigateTo({
        url: '../register/register'
      })
    }
  },
  //获取地理位置
  getPositionFn: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({
          isPosition: ''
        })
        that.seatFn(res.latitude, res.longitude)
      },
      fail: function () {
        that.setData({
          isPosition: true
        })
      }
    })
  },
  seatFn: function (lati, longi) {
    //获取当前所在区域
    var that = this;
    var sign = util.hexMD5('x=' + lati + '&y=' + longi + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/common/region',
      data: {
        x: lati,
        y: longi,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          region: res.data.data.region
        });
        wx.setStorageSync('sellData', { region: that.data.region, companyId: 10000036 })
        var region = (that.data.region).slice(0, 2)
        that.couponFn()
        if (that.data.searchname) {
          that.searchFn();
        } else {
          that.refreshFn();
        }
      },
    })
  },
  // 优惠劵方法
  couponFn: function (event) {
    var that = this;
    var region = that.data.region
    var wxData = wx.getStorageSync('wxData')
    var sign = util.hexMD5('companyId=' + wxData.companyId + '&region=' + region + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/v2/coupon/list',
      data: {
        'region': region,
        'companyId': wxData.companyId,
        'sign': sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var couponData = res.data.data
        if(couponData.length>0){
        for (var i = 0; i < couponData.length; i++) {
          couponData[i].endTime = couponData[i].endTime.slice(0, 10)
        }
        var width = (470 * couponData.length) + 'rpx'
        that.setData({
          iscoupon:false,
          coupon: couponData,
          width: width
        })
        }else{
          that.setData({
            iscoupon:true
          })
        }
      },
      faild:function(res){
          that.setData({
            iscoupon:true
          })
      }
    })
  },
  drawFn: function (event) {
    var that = this;
    var coupon = that.data.coupon;
    var wxData = wx.getStorageSync('wxData')
    var id = event.currentTarget.dataset.id;
    if (coupon.length > 0) {
      for (var i = 0; i < coupon.length; i++) {
        if (coupon[i].id == id) {
          var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + wxData.companyId + '&couponId=' + id + gConfig.key);
          wx.request({
            url: gConfig.http + 'xcx/coupon/ledcoupon',
            data: {
              'clientId': wxData.clientId,
              'companyId': wxData.companyId,
              'couponId': id,
              'sign': sign
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res)
              wx.showToast({
                title: '优惠劵领取成功',
                icon: 'success',
                duration: 500
              })
            }
          })
        }
      }
    }
  },
  //初始全部商品列表
  refreshFn: function (region) {
    var that = this;
    that.setData({
      tap: 1,
      search: false
    })
    that.shopjoggleFn();
  },
  //判断搜索框中的value值是否为空
  searchFn: function (region) {
    var that = this;
    that.setData({
      search: true,
      tap: 1
    })
    that.searchDataFn()
  },
  //搜索框中有内容时当搜索框有焦点时的方法
  searchshopFn: function (event) {
    var that = this;
    var searchname = that.data.searchname;
    wx.navigateTo({
      url: '../search/search?judge=' + true + '&name=' + searchname
    })
  },
  //上拉加载更多
  onReachBottom: function (event) {
    var that = this
    if (that.data.searchname) {
      that.dotfor();
      that.setData({ iscome: false })
      setTimeout(function () { that.searchDataFn() }, 1500)
    } else {
      that.dotfor();
      that.setData({ iscome: false })
      setTimeout(function () { that.shopjoggleFn() }, 1500)
    }
  },
  //搜索框无内容时上拉加载更多  
  shopjoggleFn: function (event) {
    var that = this;
    var tap = that.data.tap;
    var region = (that.data.region).slice(0, 2)
    var sign = util.hexMD5('companyId=' + 10000036 + '&pageNum=' + tap + '&perpage=' + 10 + '&region=' + region + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/company/items',
      data: {
        companyId: 10000036,
        pageNum: tap,
        perpage: 10,
        region: region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var shopDetailData = res.data.data.list;
        for (var i = 0; i < shopDetailData.length; i++) {
          shopDetailData[i].price = shopDetailData[i].price.toFixed(2)
        }
        if (shopDetailData.length > 0) {
          //将已有的数据和加载的数据放到一起
          if (that.data.tap == 1) {
            that.setData({
              shopsData: shopDetailData,
              tap: tap + 1
            })
          } else {
            var shopsData = that.data.shopsData.concat(shopDetailData)
            //再次进行页面重绘
            that.setData({
              shopsData: shopsData,
              tap: tap + 1
            })
          }
        } else {
          that.setData({
            dot: true,
            iscome: true
          })
        }
      }
    })
  },
  orderFn: function (event) {
    var shopsData = that.data.shopsData
    wx.navigateTo({
      url: '../shopDetail/shopDetail?itemId=' + shopsData.id
    })
  },
  //搜索框中有内容时上拉加载更多
  searchDataFn: function () {
    var that = this;
    var tap = that.data.tap;
    var searchname = that.data.searchname;
    var region = (that.data.region).slice(0, 2);
    var sign = util.hexMD5('companyId=' + 10000036 + '&region=' + region + '&keywords=' + searchname + '&pageNum=' + tap + '&perpage=' + 10 + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/company/search',
      data: {
        companyId: 10000036,
        region: region,
        keywords: searchname,
        pageNum: tap,
        perpage: 10,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var searchcode = res.data.result;
        if (searchcode.code == 200) {
          var searchDetailData = res.data.data.list;
          if (searchDetailData.length > 0) {
            //将已有的数据和加载的数据放到一起
            for (var i = 0; i < searchDetailData.length; i++) {
              searchDetailData[i].price = searchDetailData[i].price.toFixed(2)
            }
            if (that.data.tap == 1) {
              that.setData({
                seachshopData: searchDetailData,
                tap: tap + 1
              })
            } else {
              var shopsData = (that.data.seachshopData).concat(searchDetailData)
              //再次进行页面重绘
              that.setData({
                seachshopData: shopsData,
                tap: tap + 1
              })
            }
          }
        } else {
          that.setData({
            dot: true,
            iscome: true
          })
        }
      }
    })
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
  //判断搜索框内容有无时所选中的商品
  shopdetailFn: function (event) {
    var that = this;
    var region = (that.data.region).slice(0, 2)
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    var seachshopData = that.data.seachshopData;
    var searchname = that.data.searchname;
    var itemId;
    if (searchname) {
      for (var i = 0; i < seachshopData.length; i++) {
        if (index == i) {
          itemId = seachshopData[i].id
        }
      }
    } else {
      for (var i = 0; i < shopData.length; i++) {
        if (index == i) {
          itemId = shopData[i].id
        }
      }
    }
    that.setData({
      dot: false
    })
    wx.navigateTo({
      url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region + '&fullregion=' + that.data.region
    })
  },
  focusFn: function (event) {
    var that = this;
    var searchname = that.data.searchname;
    that.setData({
      dot: false
    })
    wx.navigateTo({
      url: '../search/search?region=' + that.data.region
    })
  },
  dotfor: function () {
    var that = this;
    var dotclass = ['on', '', ''];
    var n = 1;
    var timer = setInterval(function () {
      n = n > dotclass.length ? 1 : n;
      for (var i = 0; i < dotclass.length; i++) {
        if ((n - 1) == i) {
          dotclass[i] = 'on'
          that.setData({
            dotclass: dotclass
          })
        } else {
          dotclass[i] = ''
          that.setData({
            dotclass: dotclass
          })
        }
      }
      n++;
      if (n == 4) {
        clearInterval(timer)
      }
    }, 400)

  },
  orderFn: function () {
    var that = this;
    wx.navigateTo({
      url: '../register/register',
    })
  }
}) 