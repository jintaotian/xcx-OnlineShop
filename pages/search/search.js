// pages/search/search.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    click: '取消',
    focus:true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      judge: options.judge,
      searchvalue: options.name,
      region:options.region
    })
    var judge = that.data.judge
    var searchvalue = that.data.searchvalue
    if (judge) {
      that.setData({
        searchname: searchvalue
      })
    } else { }
   if(that.data.searchname){
      that.setData({
        click: '搜索'
      })
   }else{
      that.setData({
        click: '取消'
      })
   }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.classfyFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //页面跳转(点击按钮跳转)
  clickFn: function (event) {
    var that = this;
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
    var value = that.data.value
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中
    if (value) {
      prevPage.setData({
        searchname: that.data.value
      })
    } else { };
  
  },
  //当input框中有数据时取消变为搜索(bindinput)
  clicksearch: function (e) {
    var that = this;
    that.setData({
      value: e.detail.value,
      spare: e.detail.value
    })
    if (that.data.value) {
      that.setData({
        click: '搜索'
      })

    } else {
      that.setData({
        click: '取消'
      })
    }
  },
  //当点击按钮全部商品之后的点击方法后页面跳转至首页
  categoriesFn: function (event) {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面的位置
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中
    prevPage.setData({
      nothing: '',
      searchname:''
    })
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  },
  branchFn: function (event) {
    var that = this;
    var cfyData=that.data.cfyData;
    var id=event.currentTarget.dataset.id
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面的位置
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中
    for(var i=0;i<cfyData.length;i++){
      if(cfyData[i].id==id){
        prevPage.setData({
          searchname: cfyData[i].name
        })
      }
    };
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  },
  shoveFn: function (event) {
    var that = this;
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  },
  classfyFn: function (event) {
    var that = this;
    var sign = util.hexMD5('companyId=' + 10000036 + '&parentId=' + 0 + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/company/categorys',
      data: {
        companyId: 10000036,
        parentId: 0,
        sign:sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          cfyData: res.data.data
        })
      }
    })
  },
})