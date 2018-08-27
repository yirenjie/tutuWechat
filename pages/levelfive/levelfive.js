const util = require("../../utils/config.js");

const app = getApp()
const http_host = util.http_host;
const img_url = util.img_url;
// pages/levelfive/levelfive.js
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.autoplay = true;
innerAudioContext.obeyMuteSwitch = false;
innerAudioContext.onError((res) => {
  console.log(res.errMsg)
  console.log(res.errCode)
})

Page({

  /**选择图为填空图的相同
   * 
   * 
   */
  data: {
  //  下面的数组传过来的数据
    arr: [],
    // 上面播放的练习题的音乐以及答案
    exercises: {
      // 播放的音乐
      music: '',
      // 正确答案
      rightlist: [],
      selectlist: [],
    },
    //默认喇叭放大
    clicksound: 1,
    // 当前达到第几部分
    selectindex: 0,
    // 当前第几个答错了
    errorselectindex: -1,
    // 是否正确点过
    clicking: 0,
    // 是否正确
    istrue: 0,
    // 错误次数
    errornum: 0,
    // 连续正确次数
    rightnum: 0,
    // 分数
    score: 0,
    wancheng:true,
    // 错误次数  用于播放失败音频
    cuo_number:0,
   
    // 滑动需要的参数
    lastX: 0,          //滑动开始x轴位置
    lastY: 0,          //滑动开始y轴位置
    text: "没有滑动",
    xuhao: 1,
    currentGesture: 0, //标识手势

  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (e) {

    var that = this

    //给当前关卡数 和 总关卡数  赋值
    this.setData({
      // 关卡ID
      card_id: e.card_id,
      // 题数
      number: e.number,

    })


    // 加载数据
    that.jiazai(1)

    wx.setNavigationBarColor({

      frontColor: '#000000',

      backgroundColor: '#f5ede2'

    })


    var title = "0" + (app.partList.xia + 1) + " " + app.card.name
    //修改标题为关卡名称
    wx.setNavigationBarTitle({
      title: title//页面标题为路由参数
    })

  },

// 加载数据
jiazai:function (xuhao)
{
  var that = this;
  if (parseInt(xuhao) < parseInt(that.data.number)) {
    this.setData({

      xuhao: xuhao,
    })


  } else {


    this.setData({

      xuhao: parseInt(that.data.number)
    })
  }


  if (parseInt(xuhao) == parseInt(that.data.number)) {
    this.setData({
      wancheng: false
    })
  }

  var yes = "exercises.rightlist"

  // 第二个正确答案
  var yes2 = "exercises.rightlist2"

  var selectlist = 'exercises.selectlist';

  this.setData({
    [yes]: [],
    [yes2]: [],
    [selectlist]: [],
    // 当前达到第几部分
    selectindex: 0,
    // 当前第几个答错了
    errorselectindex: -1,
    // 是否正确点过
    clicking: 0,
    // 是否正确
    istrue: 0,
    // 错误次数
    errornum: 0,
    // 连续正确次数
    rightnum: 0,
    cuo_number:0
  })
 

  //当前
  wx.request({
    url: http_host + 'getquestion',
    data: {
      //从app中取出用户数据
      token: app.user.token,
      uid: app.user.uid,
      card_id: that.data.card_id,
      //当前题的序号  
      question_sequence: xuhao
    },
    header: {
      'Content-Type': 'application/json'
    },
    success: function (res) {
      // 判断是否正确传回数据
      console.log(2)
      console.log(res)
      if (res.data.code == 0) {
        var yes = "exercises.rightlist"
        // 第二个正确答案
        var yes2 = "exercises.rightlist2"
        // 结束
        that.setData({
          //所有数据  方便以后调用
          all: res.data.data,
         
          //正确的图片
          [yes]: res.data.data.question_answer,
          // 第二个正确答案
          [yes2]: [2, 1, 3],
          // 结束
          //录音文件
          video: encodeURI(res.data.data.question_title_voice).replace(/'/, "%27"),

        })

        
        var all_img = res.data.data.question_content_images



        if (res.data.data.question_answer1 == null || res.data.data.question_answer1 == '') {
          that.setData({
            // 第二个正确答案
            [yes2]: [],
          })
        }

        var data = []
        var xia = 0
        for (var i in all_img) {


          data[xia] = new Object();
          data[xia].img_path = all_img[i].replace(/'/, "%27")

          data[xia].id = i
          data[xia].eff = 0
          xia++;

        }

        that.setData({
          arr: data
        })
        that.updatadataarr();//对答案列表进行分页
   

      } else {
        //返回数据失败
        // app.tanchuang('获取题错误！')
        console.log(res.data)
      }
    }
  })

  wx.onBackgroundAudioStop(function () {
    console.log('onBackgroundAudioStop')

  })
},



  //对象转数组
  objToArray: function (array) {
    var arr = []
    for (var i in array) {
      arr.push(array[i]);
    }
    console.log(arr);
    return arr;
  },

  //下一题
  xiayiti: function () {
    var that = this
    console.log(that.data)

    if (parseInt(that.data.xuhao) == parseInt(that.data.number)) {
      //发送后台增加分数
      wx.request({
        url: http_host + 'setcardscore',
        data: {
          //从app中取出用户数据
          token: app.user.token,
          uid: app.user.uid,
          card_id: that.data.card_id,
          // 分数
          card_score: that.data.score,
          // 是否解锁下一关    1解锁  0不解锁
          is_completed: 1

        },
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {

          if (res.data.code == 0) {

            wx.redirectTo({
              url: "/pages/gameresult/gameresult?fenshu=" + parseInt(that.data.score)
            })
          }
        }
      })

    } else {

   
        that.jiazai(parseInt(that.data.xuhao) + 1)
     
    }
    
  },

  selectClick: function (e) {
    if (e.currentTarget.dataset.eff == 1) {
      return;
    }
    innerAudioContext.stop();
    var that = this

    // 判断是否答对
    if (e.currentTarget.dataset.id == this.data.exercises.rightlist[this.data.selectindex]) {
      that.dadui(e)
    } else if (e.currentTarget.dataset.id == this.data.exercises.rightlist2[this.data.selectindex]) {
      that.dadui(e)
     
    } else {

      // 错误逻辑层

      //停止播放之前的音乐     防止两重音
      innerAudioContext.stop();
      innerAudioContext.stop()
      if (that.data.cuo_number == 0) {
        innerAudioContext.src = 'http://app.yizhizaibo.cn/eat/public/tutu/careful.mp3';

      } else if (that.data.cuo_number == 1) {
        innerAudioContext.src = 'http://app.yizhizaibo.cn/eat/public/tutu/notquite.mp3';
      } else if (that.data.cuo_number == 2) {
        innerAudioContext.src = 'http://app.yizhizaibo.cn/eat/public/tutu/youalmostthere.mp3';
      } else if (that.data.cuo_number == 3) {
        innerAudioContext.src = 'http://app.yizhizaibo.cn/eat/public/tutu/entryagain.mp3';
      } else if (that.data.cuo_number >= 4) {
        innerAudioContext.src = 'http://app.yizhizaibo.cn/eat/public/tutu/comeonyoucandoit.mp3';
      }
      innerAudioContext.play();


      this.setData({
        errornum: this.data.errornum + 1,
        errorselectindex: this.data.selectindex,
        score: this.data.score - 5,
        clicking: 1,
        cuo_number: this.data.cuo_number + 1,
      })
      setTimeout(function () {
        that.setData({
          errorselectindex: -1
        })
      }, 2000);
    }
 
    setTimeout(function () {
      that.setData({
        clicking: 0
      })
    }, 2000);
    

  },
// 答对执行的操作

dadui:function (e,number)
{


  innerAudioContext.src = 'https://www.chengxuyuantoutiao.com/a/sound/ding.mp3';
  innerAudioContext.play();

  var that = this;
  for (var i = 0; i < that.data.arr.length; i++) {
    if (e.currentTarget.dataset.id == that.data.arr[i].id) {
      var arr_id = i
      break;
    }
  }
  if (this.data.arr[arr_id].eff != 0) {
    return;
  }

  var selectlist = 'exercises.selectlist[' + this.data.selectindex + ']';
  var effective = 'arr[' + arr_id + '].eff';



  this.setData({
    [selectlist]: this.data.arr[arr_id].img_path,
    selectindex: this.data.selectindex + 1,
    [effective]: 1
  })
  this.updatadataarr();
 

  // 判断这道题是否答完
  if (this.data.exercises.selectlist.length == this.data.exercises.rightlist.length) {
    that.setData({
      wancheng: false
    })
    console.log('答完')
    that.setData({
      score: this.data.score + 20,
      clicking: 1
    })
    innerAudioContext.src = 'https://www.chengxuyuantoutiao.com/a/sound/ding.mp3';
    innerAudioContext.play();
    innerAudioContext.onEnded((res) => {
     
    


    innerAudioContext.src = this.data.video;
    innerAudioContext.play();
    innerAudioContext.onEnded((res) => {


      console.log('触发')
      // 判断这道题是否答完
      if (this.data.exercises.selectlist.length == this.data.exercises.rightlist.length) {
        that.xiayiti()
        innerAudioContext.stop()
      }
      innerAudioContext.offEnded();
    });
    });

  }

},
  updatadataarr: function () {
    var that = this;
    var array = Object.keys(that.data.arr)
    let subArrayNum = 8;
    var dataArr = new Array(Math.ceil(array.length / subArrayNum));
    //console.log('dataArr', dataArr);
    for (let i = 0; i < dataArr.length; i++) {
      dataArr[i] = new Array();
    }
    for (let i = 0; i < array.length; i++) {
      dataArr[parseInt(i / subArrayNum)][i % subArrayNum] = that.data.arr[i];
    }

    console.log(';dataArr', dataArr)
    that.setData({
      dataArr: dataArr,
      len: array.length
    })

  },
  funended: function () {
    console.log("audio end");
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
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
    innerAudioContext.stop();
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