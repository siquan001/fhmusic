!function () {
  function xhr(url, callback) {
    var x=new XMLHttpRequest();
    x.open('GET', url, true);
    x.onreadystatechange = function () {
      if (x.readyState == 4 && x.status == 200) {
        callback(JSON.parse(x.responseText));
      }
    }
    x.send();
    return {
      abort:function(){
        x.abort()
      }
    }
  }

  function search(keyword, callback, page = 1) {
    var url = 'https://api.vkeys.cn/API/QQ_Music?word='+encodeURIComponent(keyword)+'&num=30&page='+page;
    var a=xhr(url, function (data) {
      var res = {
        total: Infinity,
        page: page,
        songs: [],
      }
      data.data.forEach(function (song) {
        var pushed={
          songname: song.song,
          artist: song.singer,
          id: song.mid,
          ispriviage: false,
        };

        // if(song.filename.match(/【歌词 : .*】/)){
        //   var matched=song.filename.match(/【歌词 : .*】/);
        //   pushed.title=song.filename.replace(matched[0], '');
        //   pushed.matchLyric=matched[0].replace('【歌词 : ', '').replace('】', '');
        // }else{
        // }
        pushed.title=song.singer+' - '+song.song;

        res.songs.push(pushed);
      });
      callback(res);
    })
    return a;
  }

  function getSongDetails(id, callback) {
    var url = "https://api.vkeys.cn/API/QQ_Music?mid="+id+"&q=8";
    var p={};
    function ck(r){
      for(var k in r){
        p[k]=r[k];
      }
    }
    var l=0;
    var a=xhr(url, function (res) {
      if(res.code==200){
        ck({
          title: res.data.song,
          songname: res.data.singer+' - '+res.data.song,
          artist: res.data.singer,
          url: res.data.url,
          album: res.data.album,
          img: res.data.cover,
          ispriviage: false,
        });
        l++
        if(l==2){
          callback(p);
        }
      }else{
        callback({
          error:'获取歌曲失败',
          code:res.code
        })
      }
    });
    var b=xhr('https://api.gumengya.com/Api/Tencent?format=json&id='+id,function(res){
      if(res.code==200){
        ck({
          lrcstr:res.data.lrc,
          lrc:parseLrc(res.data.lrc)
        })
      }else{
        ck({
          lrc:{0:"歌词获取失败"},
          lrcstr:'歌词获取失败'
        })
      }
      l++;
      if(l==2){
        callback(p);
      }
    })
    return {
      abort:function(){
        a.abort();
        b.abort();
      }
    };
  }

  function parseLrc(lrc) {
    var oLRC=[];
    if (lrc.length == 0) return;
    var lrcs = lrc.split('\n');//用回车拆分成数组
    for (var i in lrcs) {//遍历歌词数组
      lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
      var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
      var s = t.split(":");//分离:前后文字
      if (!isNaN(parseInt(s[0]))) { //是数值
        var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，可能有多个
        var start = 0;
        for (var k in arr) {
          start += arr[k].length; //计算歌词位置
        }
        var content = lrcs[i].substring(start);//获取歌词内容
        for (var k in arr) {
          var t = arr[k].substring(1, arr[k].length - 1);//取[]间的内容
          var s = t.split(":");//分离:前后文字
          oLRC.push({//对象{t:时间,c:歌词}加入ms数组
            t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
            c: content
          });
        }
      }
    }
    oLRC.sort(function (a, b) {//按时间顺序排序
      return a.t - b.t;
    });
    var r={};
    oLRC.forEach(function(a){
      r[a.t]=a.c;
    })
    return r;
  }
  window.kugou = {
    search: search,
    getSongDetails
  }
}();