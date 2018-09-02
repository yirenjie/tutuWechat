const util = require("../../utils/config.js");

const app = getApp()
const http_host = util.http_host;
const img_url = util.img_url;
Page({

  /**
  * 页面的初始数据
  */
  data: {
    showDialogshare: false,
    shuaxin: false,
    //part数组
    part_list: [],
    unit_list: [],
    image: "https://www.chengxuyuantoutiao.com/a/part@2X.png",


    curNav: 1,
    curIndex: 0
  },

  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (e) {
    console.log(e);
    wx.setNavigationBarTitle({
      title: e.bookName
    })
    this.setData({
      bookId:e.bookId,
      bookName:e.bookName
    })
    //显示加载提示框
    // wx.showLoading({
    //   title: '加载中',
    // })

    var that = this
    //获取所有单元数组详情
    wx.request({
      url: http_host + 'practice/units/list/' + e.bookId,
      data: {
        //从app中取出用户数据
        bookId: e.bookId
      },
      header: {
        'token': wx.getStorageSync("userInfo").token,
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (e.id == '' || e.id == null) {
            var liang = res.data.data.unitsVOS[0].id
            var unitname = res.data.data.unitsVOS[0].text
          } else {
            var liang = e.id
            var unitname = e.unitname
          }
          that.setData({
            unit_list: res.data.data.unitsVOS,
            unitId: liang,
            unitName: unitname
          })
          app.unit.id = liang
          app.unit.name = unitname
        } else {
          //返回数据失败
          app.tanchuang('获取unit错误！')
        }

        that.setData({
          //单元高亮赋值
          curNav: liang,
        })

        //查询单元下所有part
        // res.data.data.unitsVOS.forEach(function(a){
        //   if(a.id==liang){
        //     that.setData({
        //       part_list: a.partsVOS
        //     })
        //   }
        // })
        // that.part_list(liang)
      },
      error: function (res) {
        console.log('404');
      },
    })


  },
  //事件处理函数
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值
    let id = e.target.dataset.id,
    index = parseInt(e.target.dataset.index);
    that.setData({
      unitId: e.target.dataset.id,
      unitName: e.target.dataset.name
    })
    //给app中的 unit赋值
    app.unit.id = id
    app.unit.name = e.target.dataset.name
    // 把点击到的某一项，设为当前index
    this.setData({
      curNav: id,
    })

    this.part_list(id)
  },


  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    this.setData({
      shuaxin: true,
      showDialogshare: false,
    })
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    // if (this.data.shuaxin) {
    //   wx.navigateTo({
    //     url: "/pages/slidemenu/slidemenu?id=" + app.unit.id
    //   })
    // }
  },

  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
  },

  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
  },

  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    return {
      title: app.globalData.userInfo.nickName + '  邀请你来闯关啦~图图小学英语课后趣味练习！',
      desc: '转发描述',
      path: '/pages/index/index',
      imageUrl: "http://tutu-resource-base.test.upcdn.net/a/%E8%BD%AC%E5%8F%91%E6%B5%B7%E6%8A%A5.png",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
