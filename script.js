var hashlist = [
  {
    hash: "83b8717bc9184337ca8b2d8c60a9b15a",
    album_id: "18694318"
  }
];

if(localStorage.getItem('hashlist')){
  hashlist=JSON.parse(localStorage.getItem('hashlist'));
}else{
  localStorage.setItem('hashlist',JSON.stringify(hashlist));
}
$('body').css('height',$(window).height()+'px');

$(window).on('resize',r)
function r(){
  if($(window).width()<=700){
    $('main .left .album_name').css('padding-bottom',$(window).height()-450+'px');
  }else{
    $('main .left .album_name').css('padding-bottom','');
    $('.right').removeClass('more');
      $('.left img').add('.left .album_name').add('.left .song_name').css('opacity','');
  }
}
r();
var isi = 0;
var oLRC = {
  ms: [{ t: '0.000', c: "歌词获取中" }]
};
function openMusic(i) {
  isi = i;
  oLRC = {
    ms: [{ t: '0.000', c: "歌词获取中" }]
  }; $('.right ul').html('');
  for (var i2 = 0; i2 < oLRC.ms.length; i2++) {
    $('.right ul').append('<li>' + oLRC.ms[i2].c + '</li>');
  }
  $('.album_img').attr('src', '');
  $('.song_name').text('歌曲获取中...');
  $('.album_name').text('');
  $.ajax({
    dataType: "jsonp",
    url: "https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=" + hashlist[i].hash.toUpperCase() +
      "&dfid=2mScsJ16ucV81qLdzD238ELf&appid=1014&mid=1b211caf58cd1e1fdfea5a4657cc21f5&platid=4&album_id=" + hashlist[i].album_id +
      "&_=" + Date.now(),
    success: function (res) {
      console.log(res);
      $('.album_img').attr('src', res.data.img);
      $('.song_name').text(res.data.audio_name);
      $('.album_name').text(res.data.album_name);
      $('#audio').attr('src', res.data.play_url);
      oLRC = createLrcObj(res.data.lyrics);
      $('.right ul').html('');
      for (var i = 0; i < oLRC.ms.length; i++) {
        $('.right ul').append('<li>' + oLRC.ms[i].c + '</li>');
      }
      if(res.data.privilege>=10){
        alert('你正在试听付费歌曲，只能试听1分钟，下载酷狗音乐听完整版。');
      }
    }
  })
}

$('.playbtn').click(function () {
  if ($('#audio')[0].paused) {
    $('#audio')[0].play();
  } else {
    $('#audio')[0].pause();
  }
})

$('#audio').on('play', function () {
  $('.playbtn').removeClass('bi-play-fill');
  $('.playbtn').addClass('bi-pause');
});
$('#audio').on('pause', function () {
  $('.playbtn').addClass('bi-play-fill');
  $('.playbtn').removeClass('bi-pause');
});

$('#audio').on('canplay', function () {
  $(this)[0].play();
  $('.time_picker').text(getFormatTime($(this)[0].currentTime) + '/' + getFormatTime($(this)[0].duration))
  $('.song_range').attr('max', $(this)[0].duration);
});

$('#audio').on('ended', function () {
  $('.nextbtn').click();
})
$('#audio').on('timeupdate', function () {
  $('.time_picker').text(getFormatTime($(this)[0].currentTime) + '/' + getFormatTime($(this)[0].duration))
  $('.song_range').attr('max', $(this)[0].duration);
  if (!window.___) $('.song_range').val($(this)[0].currentTime);

  for (var i = 0; i <= oLRC.ms.length; i++) {
    if (oLRC.ms[i]) {
      if (parseFloat(oLRC.ms[i].t) > $(this)[0].currentTime) {
        $('.right ul').css('margin-top', $('.right').height() / 2 - 25 - $('.right ul li').height() * (i - 1) + 'px');
        $('.right ul li.act').removeClass('act');
        $('.right ul li').eq(i - 1).addClass('act');
        break;
      }
    } else {
      $('.right ul').css('margin-top', $('.right').height() / 2 - 25 - $('.right ul li').height() * (i - 1) + 'px');
      $('.right ul li.act').removeClass('act');
      $('.right ul li').eq(i - 1).addClass('act');
    }

  }
})

$('.song_range').on('mousedown', function () {
  window.___ = true;
  document.onmouseup = function () {
    delete window.___;
    document.onmouseup = null;
    $('#audio')[0].currentTime = $('.song_range').val();
  }
})
$('.song_range').on('touchstart', function () {
  window.___ = true;
  document.ontouchend = function () {
    delete window.___;
    document.ontouchend = null;
    $('#audio')[0].currentTime = $('.song_range').val();
  }
})
$('.lastbtn').click(function () {
  openMusic(isi == 0 ? hashlist.length - 1 : isi - 1);
})
$('.nextbtn').click(function () {
  openMusic(isi == hashlist.length - 1 ? 0 : isi + 1);
})
function getFormatTime(s) {
  var m = Math.floor(s / 60);
  if (m < 10) m = '0' + m;
  var s2 = parseInt(s % 60);
  if (s2 < 10) s2 = '0' + s2;
  return m + ':' + s2;
}
openMusic(0);



function createLrcObj(lrc) {
  var oLRC = {
    ti: "", //歌曲名
    ar: "", //演唱者
    al: "", //专辑名
    by: "", //歌词制作人
    offset: 0, //时间补偿值，单位毫秒，用于调整歌词整体位置
    ms: [] //歌词数组{t:时间,c:歌词}
  };
  if (lrc.length == 0) return;
  var lrcs = lrc.split('\n');//用回车拆分成数组
  for (var i in lrcs) {//遍历歌词数组
    lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
    var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
    var s = t.split(":");//分离:前后文字
    if (isNaN(parseInt(s[0]))) { //不是数值
      for (var i in oLRC) {
        if (i != "ms" && i == s[0].toLowerCase()) {
          oLRC[i] = s[1];
        }
      }
    } else { //是数值
      var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，可能有多个
      var start = 0;
      for (var k in arr) {
        start += arr[k].length; //计算歌词位置
      }
      var content = lrcs[i].substring(start);//获取歌词内容
      for (var k in arr) {
        var t = arr[k].substring(1, arr[k].length - 1);//取[]间的内容
        var s = t.split(":");//分离:前后文字
        oLRC.ms.push({//对象{t:时间,c:歌词}加入ms数组
          t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
          c: content
        });
      }
    }
  }
  oLRC.ms.sort(function (a, b) {//按时间顺序排序
    return a.t - b.t;
  });
  oLRC.lrc = lrc;
  return oLRC;
}

$('.fullscreen').click(function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      $('main')[0].requestFullscreen();
    }
});
if (document.fullscreenEnabled || document.mozFullScreenEnabled) {}else{
  $('.fullscreen').hide();
}
$('.mode').click(function () {
  if ($('body')[0].classList.contains('dark')) {
    $('body').removeClass('dark');
    $(this).addClass('bi-brightness-high-fill');
    $(this).removeClass('bi-moon-fill');
  } else {
    $('body').addClass('dark')
    $(this).removeClass('bi-brightness-high-fill');
    $(this).addClass('bi-moon-fill');
  }
})
document.onfullscreenchange = function () {
  if (document.fullscreenElement) {
    $('.fullscreen').addClass('bi-arrows-angle-contract')
    $('.fullscreen').removeClass('bi-arrows-angle-expand')
    $('.closebtn').hide();
  } else {
    $('.fullscreen').removeClass('bi-arrows-angle-contract')
    $('.fullscreen').addClass('bi-arrows-angle-expand')
    $('.closebtn').show();
  }
}

document.onkeydown = function (e) {
  if (e.key == 'F11') {
    e.preventDefault();
    $('.fullscreen').click();
  } else if (e.key == ' ') {
    e.preventDefault();
    $('.playbtn').click();
  } else if (e.key == 'ArrowLeft') {
    e.preventDefault();
    $('.lastbtn').click();
  } else if (e.key == 'ArrowRight') {
    e.preventDefault();
    $('.nextbtn').click();
  }
}

var fonts = [
  'system-ui',
  '"ZhanKu Happy"',
  '"Noto Sans SC"',
  'cursive',
  'Consolas'
]
var fontindex = 0;
$('.fonttoggler').click(function () {
  fontindex = fontindex == fonts.length - 1 ? 0 : fontindex + 1;
  $('body').css('font-family', fonts[fontindex]);
});

$('main').click(function () {
  if ($(this)[0].classList.contains('hide')) {
    $(this).removeClass('hide');
  }
});

$('.closebtn').click(function (e) {
  e.stopPropagation()
  $('main').addClass('hide');
})


function openSearch(keyword) {
  $('.search ul').html('');
  $.ajax({
    dataType: 'jsonp',
    url: 'http://mobilecdn.kugou.com/api/v3/search/song?format=jsonp&keyword=' + keyword + '&page=1&pagesize=30&showtype=1',
    success: function (res) {
      console.log(res);
      for (var i = 0; i < res.data.info.length; i++) {
        $('.search ul').append('<li data-hash="' + res.data.info[i].hash + '" data-albumid="' + res.data.info[i].album_id + '"><span class="si">' + (i + 1) + '</span><span class="sname">' + res.data.info[i].filename + '</span></li>')
      }
      $('.search ul li').click(function () {
        hashlist.unshift({
          hash: $(this).attr('data-hash'),
          album_id: $(this).attr('data-albumid')
        })
        openMusic(0);
        $('main').click();
      })
    }
  })
}

$('.searchbox input').keydown(function (e) {
  if (e.key == 'Enter' && $(this).val().trim()) {
    e.preventDefault();
    openSearch($(this).val().trim())
  }
});

$('.searchbox input').on('input',function(){
  if($(this).val()){
    $('.searchbox').css('top','20px');
    $('.search h1').css('opacity','0');
    $('.search ul').css('opacity','1');
  }else{
    $('.searchbox').css('top','');
    $('.search h1').css('opacity','');
    $('.search ul').css('opacity','');
  }
})
$('.searchbox button').click(function () {
  if ($('.searchbox input').val().trim()) {
    openSearch($('.searchbox input').val().trim())
  }
})

$('.downloader').click(function () {
  var mode = prompt('输入 1 下载歌曲，输入 2 下载专辑图片，输入 3 下载歌词文件，默认下载歌曲');
  if (mode == '1') {
    download($('#audio').attr('src'), $('.song_name').text() + '.mp3');
  } else if (mode == '2') {
    download($('.album_img').attr('src'), $('.song_name').text() + '.png');
  } else if (mode == '3') {
    var fileName = $('.song_name').text() + '.lrc';
    var filestream = oLRC.lrc; 
    var blob = new Blob([filestream]);
    var a = document.createElement('a');
    var href = window.URL.createObjectURL(blob); // 创建下载连接
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // 下载完移除元素
  }else if(mode){
    download($('#audio').attr('src'), $('.song_name').text() + '.mp3');
  }
})

function download(url, fileName) {
  if (!url || !fileName) return;
  if (window.enabledGM) {
    window.GM || enabledGM();
    GM.download(url, fileName);
  } else {
    window.open(url);
  }

}

$('.right').click(function(){
  if($(window).width()<=700){
    if($('.right')[0].classList.contains('more')){
      $('.right').removeClass('more');
      $('.left img').add('.left .album_name').add('.left .song_name').css('opacity','');
    }else{
      $('.right').addClass('more');
      $('.left img').add('.left .album_name').add('.left .song_name').css('opacity','0');
    }
  }
})