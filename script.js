var hashlist = [
  {
    id: "002aTpXP49B4FC"
  }
];


$(window).on('resize',r)
function r(){
  $('body').css('height',$(window).height()+'px');
  $('.search h1').css('top',$(window).height()/2.5-$('.search h1').height()+'px');
  if(!$('.searchbox input').val())$('.searchbox').css('top',$(window).height()/2.5+'px');
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
    url: "https://api.vkeys.cn/v2/music/tencent/geturl?q=8&mid=" + hashlist[i].id,
    type:'get',
    success: function (res) {
      $('.album_img').attr('src', res.data.cover);
      $('.song_name').text(res.data.singer+' - '+res.data.song);
      $('.album_name').text(res.data.album);
      $('#audio').attr('src', res.data.url);
    }
  })
  $.ajax({
    url:'https://api.vkeys.cn/v2/music/tencent/lyric?mid='+hashlist[i].id,
    type:"get",
    success:function(res){
      oLRC = createLrcObj(res.data.lrc);
      yLRC=null;
      if(res.data.trans){
        yLRC=createLrcObj(res.data.trans);
        $('.translate').show()
      }else{
        $('.translate').hide()
      }
      $('.translate').removeClass('act');

      $('.right ul').html('');
      for (var i = 0; i < oLRC.ms.length; i++) {
        $('.right ul').append('<li>' + oLRC.ms[i].c + '</li>');
      }
    }
  })
}
var yLRC,usetrans;

$('.translate').click(function(){
  if($(this).hasClass('act')){
    $(this).removeClass('act');
    usetrans=false;
    $('.right ul').html('');
      for (var i = 0; i < oLRC.ms.length; i++) {
        $('.right ul').append('<li>' + oLRC.ms[i].c + '</li>');
      }
  }else{
    $(this).addClass('act');
    usetrans=true;
    $('.right ul').html('');
      for (var i = 0; i < oLRC.ms.length; i++) {
        $('.right ul').append('<li>' + yLRC.ms[i].c + '</li>');
      }
  }
})
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
  try{
    $(this)[0].play();
  }catch(e){}
  $('.time_picker').text(getFormatTime($(this)[0].currentTime) + '/' + getFormatTime($(this)[0].duration))
  $('.song_range').attr('max', $(this)[0].duration);
});

$('#audio').on('ended', function () {
  if($('.lopper').hasClass('act')){
    $(this)[0].currentTime=0;
    $(this)[0].play();
  }else{
    $('.nextbtn').click();
  }
})
$('#audio').on('timeupdate', function () {
  $('.time_picker').text(getFormatTime($(this)[0].currentTime) + '/' + getFormatTime($(this)[0].duration))
  $('.song_range').attr('max', $(this)[0].duration);
  if (!window.___) $('.song_range').val($(this)[0].currentTime);

  for (var i = 0; i <= oLRC.ms.length; i++) {
    if (oLRC.ms[i]) {
      if (parseFloat(oLRC.ms[i].t) > $(this)[0].currentTime) {
        var tli=$('.right ul li.act');
        var rli=$('.right ul li').eq(i - 1);
        tli.removeClass('act');
        rli.addClass('act');
        var tlitop=tli[0].offsetTop-$('.right ul')[0].offsetTop;
        var h=$(".right").height()/2-tli.height()/2;      
        $('.right ul').css('margin-top',h-tlitop+'px');
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
  if($('main').hasClass('hide'))return;
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

var si=1,keyword;
function openSearch(key) {
  $('.search ul').html('');
  si=1;
  keyword=key;
  $.ajax({
    type:"get",
    url: 'https://api.vkeys.cn/v2/music/tencent/search/song?word=' + encodeURIComponent(keyword)+"&num=30",
    success: searchSuccess
  })
}

function searchSuccess(res){
  $('.search ul li.loading').remove();
    for (var i = 0; i < res.data.length; i++) {
      $('.search ul').append('<li data-id="' + res.data[i].mid + '"><span class="si">' + (i + 1+(si-1)*30) + '</span><span class="sname">' + res.data[i].singer+' - '+res.data[i].song + '</span></li>')
    }
    $('.search ul').append('<li class="loadmore">加载更多</li>');
    $('.search ul li').click(function () {
      if($(this).hasClass('loadmore')){
        si++;
        $(this).text('正在加载...');
        $(this).removeClass('loadmore');
        $(this).addClass('loading');
        $.ajax({
          type:"get",
          url: 'https://api.vkeys.cn/v2/music/tencent/search/song?word=' + encodeURIComponent(keyword)+"&num=30",
          success: searchSuccess
        })
        return;
      }
      if($(this).hasClass('loading'))return;
      hashlist.unshift({
        id: $(this).attr('data-id'),
      })
      openMusic(0);
      $('main').click();
    })
}
$('.lopper').click(function(e){
  if($(this).hasClass('act')){
    $(this).removeClass('act');
  }else{
    $(this).addClass('act');
  }
})

$('.searchbox input').keydown(function (e) {
  if (e.key == 'Enter' && $(this).val().trim()) {
    e.preventDefault();
    openSearch($(this).val().trim())
  }
});

$('.searchbox input').on('input',function(){
  if($(this).val()){
    $('.searchbox').css('top','0px');
    $('.search h1').css('opacity','0');
    $('.search ul').css('opacity','1');
    $('.search ul').css('pointer-events','all');
  }else{
    $('.searchbox').css('top',$(window).height()/2.5+'px');
    $('.search h1').css('opacity','');
    $('.search ul').css('opacity','');
    $('.search ul').css('pointer-events','');
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
