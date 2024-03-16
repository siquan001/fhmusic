!function () {
  function xhr(url, callback,err) {
    // if(url.indexOf('api.epdd.cn')!=-1) url='https://util.siquan.tk/api/cors?url='+encodeURIComponent(url);
    var x=new XMLHttpRequest();
    x.open('GET', url, true);
    x.onreadystatechange = function () {
      if (x.readyState == 4 && x.status == 200) {
        callback(JSON.parse(x.responseText));
      }
    }
    x.onerror = function () {
      err(x.status);
    }
    x.send();
    return {
      abort:function(){
        x.abort()
      }
    }
  }

  function search(keyword, callback, page = 1) {
    var url = 'https://api.lolimi.cn/API/yiny/?word='+encodeURIComponent(keyword)+'&num=30&page='+page;
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

  function getSongDetails(mid, cb) {
    var c = 0, d = {},b;
    var a = xhr('https://api.gumengya.com/Api/Tencent?format=json&id=' + mid, function (res) {
      if (res == false || !res.data) {
        a = xhr('https://api.lolimi.cn/API/yiny/?q=8&mid=' + mid, function (r) {
          if (r == false || r.code != 200) {
            cb({
              error: '获取歌曲失败',
              code: 10000
            })
            b.abort();
          } else {
            var e = {
              title: r.data.singer + ' - ' + r.data.song,
              songname: r.data.song,
              artist: r.data.singer,
              url: r.data.url.replace('https://','http://'),
              album: r.data.album,
              img: r.data.cover,
            };
            for (var k in e) {
              d[k] = e[k];
            }
            c++;
            if (c == 2) {
              cb(d);
            }
          }
        })
        b = xhr('https://siquan-api.wdnmd.top/api/QQMusic?type=lyrics&mid=' + mid, function (r) {
          if (r == false || r.code != 200) {
            d.lrc = { 0: "歌词获取失败" }
            d.lrcstr = '[00:00.00] 歌词获取失败'
          } else {
            d.lrc = parseLrc(r.data);
            d.lrcstr = r.data;
          }
          c++;
          if (c == 2) {
            cb(d);
          }
        },function(){
          d.lrc = { 0: "歌词获取失败" }
            d.lrcstr = '[00:00.00] 歌词获取失败'
            c++;
          if (c == 2) {
            cb(d);
          }
        })
        
      } else {
        cb({
          title: res.data.author + ' - ' + res.data.title,
          songname: res.data.title,
          artist: res.data.author,
          lrc: parseLrc(res.data.lrc),
          url: res.data.url.replace('https://','http://'),
          album: '',
          img: res.data.pic,
          lrcstr: res.data.lrc,
        });
      }
    })
    return {
      abort: function () {
        a.abort();
        b&&b.abort();
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