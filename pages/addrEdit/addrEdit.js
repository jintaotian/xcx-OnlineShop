// pages/addrEdit/addrEdit.jsx
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isAdd: true,
    isError: true,
    condition: false,
    provinceName: '——请选择——',
    provinceColor: 'color:#ddd',
    isProvince: false,
    isCity: true,
    isArea: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.region) {
      this.setData({
        consignee: options.consignee,
        mob: options.mob,
        address: options.address,
        region: options.region,
        id: options.id,
        isAdd: '',
        isDefault: options.isDefault
      })
      var provinceId = options.region.slice(0, 2)
      var cityId = options.region.slice(0, 4)
      var areaId = options.region.slice(0, 6)
      this.getProvinceFn(0, provinceId);
      this.getCityFn(provinceId, cityId);
      this.getAreaFn(cityId, areaId);
    } else {
      that.setData({
        isDefault: 0,
      })
      that.getProvinceFn(0);
    }
  },
  onShow: function () {
    // 页面显示
    var userData = wx.getStorageSync('userData')
    //this.addFn();
  },
  consigneeFn: function (event) {
    this.data.consignee = event.detail.value;
  },
  isDefaultFn: function (event) {
    var that = this;
    that.data.isDefault = event.detail.value;
    if (that.data.isDefault) {
      that.setData({
        isDefault: 1
      })
    } else {
      that.setData({
        isDefault: 0
      })
    }
  },
  mobFn: function (event) {
    var that = this;
    that.data.mob = event.detail.value;
    var mob = that.data.mob;
  },
  addressFn: function (event) {
    this.data.address = event.detail.value;
  },
  editAddrFn: function () {
    // 修改地址
    var that = this;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData')

    if (that.data.consignee == '' || that.data.consignee == null) {
      that.setData({
        errorMsg: '收件人不能为空',
        isError: ''
      })
    } else if (that.data.consignee == '' || !(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '手机号格式错误',
        isError: ''
      })
    } else if (that.data.address == '' || that.data.address == null) {
      that.setData({
        errorMsg: '请填写详细地址',
        isError: ''
      })
    } else {
      wx.request({
        url: gConfig.http + 'xcx/address/update',
        data: {
          wxOpenid: wxData.wxOpenid,
          clientId: wxData.clientId,
          id: that.data.id,
          consignee: that.data.consignee,
          mob: that.data.mob,
          region: that.data.region,
          address: that.data.address,
          isDefault: that.data.isDefault
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  addAddrFn: function () {
    // 新增地址
    var that = this;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData');
    if (that.data.consignee == '' || that.data.consignee == null) {
      that.setData({
        errorMsg: '收件人不能为空',
        isError: ''
      })
    } else if (that.data.consignee == '' || !(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '手机号格式错误',
        isError: ''
      })
    } else if (that.data.address == '' || that.data.address == null) {
      that.setData({
        errorMsg: '请填写详细地址',
        isError: ''
      })
    } else {
      wx.request({
        url: gConfig.http + 'xcx/address/add',
        data: {
          wxOpenid: wxData.wxOpenid,
          clientId: wxData.clientId,
          consignee: that.data.consignee,
          mob: that.data.mob,
          region: that.data.region,
          address: that.data.address,
          isDefault: that.data.isDefault
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorageSync('wxData', { wxOpenid: wxData.wxOpenid, clientId: res.data.data.clientId })
          wx.showToast({
            title: '新增成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  removeAddrFn: function () {
    // 删除地址
    var that = this;
    var sign = util.hexMD5('id=' + that.data.id + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/address/delete',
      data: {
        id: that.data.id,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1000
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)

      }
    })
  },
  //地址的选择
  provinceFn: function (event) {
    let that = this;
    let provinceData = that.data.provinceData
    that.setData({
      pIndex: event.detail.value,
      provinceName: provinceData[event.detail.value].name,
      cityName: '——请选择——',
      provinceColor: 'color:#333',
      cityColor: 'color:#ddd',
      isCity: false,
      isArea: true,
      areaName:''
    })
    var valId = that.data.provinceData[event.detail.value].id;
    that.getCityFn(valId);
  },
  cityFn: function (event) {
    let that = this;
    let cityData = that.data.cityData
    that.setData({
      cIndex: event.detail.value,
      cityName: cityData[event.detail.value].name,
      areaName: '——请选择——',
      cityColor: 'color:#333',
      areaColor: 'color:#ddd',
      isArea: false,
    })
    var valId = that.data.cityData[event.detail.value].id
    that.getAreaFn(valId);
  },
  areaFn: function (event) {
    let that = this;
    var areaData = that.data.areaData;
    that.setData({
      aIndex: event.detail.value,
      region: areaData[event.detail.value].id,
      areaName: areaData[event.detail.value].name,
      areaColor: 'color:#333',
    })
  },
  getProvinceFn: function (defaultCode, provinceId) {
    //获取省份
    var that = this;
    var sign = util.hexMD5('id=' + defaultCode + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/common/childregion',
      data: {
        id: defaultCode,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          provinceData: res.data.data
        })
        for (var i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].id == provinceId) {
            that.setData({
              provinceName: res.data.data[i].name,
              cityName: '——请选择——',
              provinceColor: 'color:#333',
              cityColor: 'color:#ddd',
              isCity: false,
              isArea:false
            })
          }
        }
      }
    })
  },
  getCityFn: function (provinceId, cityId) {
    //获取城市
    var that = this;
    var sign = util.hexMD5('id=' + provinceId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/common/childregion',
      data: {
        id: provinceId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          cityData: res.data.data
        })
        for (var i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].id == cityId) {
            that.setData({
              cityName:  res.data.data[i].name,
              areaName: '——请选择——',
              cityColor: 'color:#333',
              areaColor: 'color:#ddd',
              isArea: false,
            })
          }
        }
      }
    })
  },
  getAreaFn: function (cityId, areaId) {
    //获取地区
    var that = this;
    var sign = util.hexMD5('id=' + cityId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/common/childregion',
      data: {
        id: cityId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          areaData: res.data.data,
        })
        for (var i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].id == areaId) {
            that.setData({
              areaName: res.data.data[i].name,
              areaColor: 'color:#333',
            })
          }
        }
      }
    })
  },
})