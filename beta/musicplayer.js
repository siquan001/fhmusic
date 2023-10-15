var LRC={};
var lrcstr='';

function initMusicPlayer(song){
  document.querySelector("#player_album_img").src=song.img;
  document.querySelector("#player_song_album").innerHTML=song.album;
  document.querySelector("#player_song_artist").innerHTML=song.artist;
  document.querySelector("#player_song_title").innerHTML=song.songname+(song.ispriviage?'<span class="vip">VIP</span>':'');
  audio.src=song.url;
  LRC=song.lrc;
  lrcstr=song.lrcstr;
  var str='';
  for(var k in LRC){
    str+='<li>'+LRC[k]+'</li>';
  }
  rightul.innerHTML=str;
}
document.querySelector(".player").onclick=function(){
  if(this.classList.contains('hide')){
    this.classList.remove('hide');
  }
}

var audio=document.querySelector("#audio");
var playbtn=document.querySelector(".player .playbtn");
var range=document.querySelector("#player_range");
var rightul=document.querySelector(".right_lrc ul");
document.querySelector(".player .lastbtn").onclick=function(){
  play(nowplay-1<0?playlist.length-1:nowplay-1);
}
document.querySelector(".player .nextbtn").onclick=function(){
  play(nowplay+1>playlist.length-1?0:nowplay+1);
}
document.querySelector(".player .lrcer").onclick=function(){
  if(document.querySelector(".player").classList.contains('haslrc')){
    document.querySelector(".player").classList.remove('haslrc');
  }else{
    document.querySelector(".player").classList.add('haslrc');
  }
}
document.querySelector(".player .repeater").onclick=function(){
  if(document.querySelector(".player").classList.contains('repeat')){
    document.querySelector(".player").classList.remove('repeat');
  }else{
    document.querySelector(".player").classList.add('repeat');
  }
}
audio.oncanplay=function(){
  this.play();
}
audio.onplay=function(){
  playbtn.className='bi bi-pause playbtn';
}
audio.onpause=function(){
  playbtn.className='bi bi-play-fill playbtn';
}
audio.onended=function(){
  if(document.querySelector(".player").classList.contains('repeat')){
    audio.currentTime=0;
    audio.play();
  }else{
    document.querySelector(".player .nextbtn").click();
  }
}
audio.ontimeupdate=function(){
  document.querySelector(".time_picker").innerHTML=getFormatTime(audio.currentTime) + '/' + getFormatTime(audio.duration);
  range.max=audio.duration;
  if(!window.___) range.value=audio.currentTime;
  if((window.innerWidth<=700&&!document.querySelector(".player").classList.contains('haslrc'))||document.querySelector(".player").classList.contains('hide')) return;
  var a=false;
  var i=-1;
  for (var k in LRC) {
    i++;
    if (parseFloat(k) > audio.currentTime) {
      if(rightul.querySelector('li.active')){
        rightul.querySelector('li.active').classList.remove('active');
      }
      var actLi=rightul.querySelectorAll('li')[i-1<0?0:i-1]
      actLi.classList.add('active');
      actLi.scrollIntoView({
        block:"center",
        behavior: 'smooth'
      })
      a=true;
      break;
    }
  }
  if(!a){
    i++;
    if(rightul.querySelector('li.active')){
      rightul.querySelector('li.active').classList.remove('active');
    }
    var actLi=rightul.querySelectorAll('li')[i-1<0?0:i-1]
    actLi.classList.add('active');
    actLi.scrollIntoView({
      block:"center",
      behavior: 'smooth'
    })
  }
}

range.onchange=function(){
  audio.currentTime=range.value;
}
range.onmousedown=function(){
  window.___=true;
  document.onmouseup=function(){
    window.___=false;
    document.onmouseup=null;
  }
}

// touch
range.addEventListener('touchstart',function(){
  window.___=true;
  document.addEventListener('touchend',function(){
    window.___=false;
    document.ontouchend=null;
  },{
    passive:false
  });
},{
  passive:false
})

playbtn.onclick=function(){
  if(nowplay==-1){
    if(playlist.length==0){
      alert('当前播放列表里还没有歌哦！');
    }else{
      play(0);
    }
    return;
  }
  if(audio.paused){
    audio.play();
  }else{
    audio.pause();
  }
}
function getFormatTime(s) {
  var m = Math.floor(s / 60);
  if (m < 10) m = '0' + m;
  var s2 = parseInt(s % 60);
  if (s2 < 10) s2 = '0' + s2;
  return m + ':' + s2;
}
var nowplay=-1;
function play(index){
  nowplay=index;
  playlistul.querySelectorAll('li')[index].click();
}

document.querySelector('.fullscreen').onclick=function () {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.querySelector('.player').requestFullscreen();
  }
};
if (document.fullscreenEnabled || document.mozFullScreenEnabled) {}else{
  document.querySelector('.fullscreen').style.display='none';
}
document.onfullscreenchange = function () {
  if (document.fullscreenElement) {
    document.querySelector('.fullscreen').classList.add('bi-arrows-angle-contract')
    document.querySelector('.fullscreen').classList.remove('bi-arrows-angle-expand')
    document.querySelector('.closebtn').style.display='none';
  } else {
    document.querySelector('.fullscreen').classList.remove('bi-arrows-angle-contract')
    document.querySelector('.fullscreen').classList.add('bi-arrows-angle-expand')
    document.querySelector('.closebtn').style.display='block';
  }
}
document.querySelector('.closebtn').onclick=function(e){
  e.stopPropagation();
  document.querySelector(".player").classList.add('hide');
}
document.querySelector(".downloader").onclick=function(){
  var mode = prompt('输入 1 下载歌曲，输入 2 下载专辑图片，输入 3 下载歌词文件，默认下载歌曲');
  if (mode == '1') {
    download(audio.src, document.querySelector("#player_song_artist").innerHTML+' - '+document.querySelector("#player_song_title").innerHTML + '.mp3');
  } else if (mode == '2') {
    download(document.querySelector("#player_album_img").src, document.querySelector("#player_song_artist").innerHTML+' - '+document.querySelector("#player_song_title").innerHTML + '.png');
  } else if (mode == '3') {
    var fileName = document.querySelector("#player_song_artist").innerHTML+' - '+document.querySelector("#player_song_title").innerHTML + '.lrc';
    var filestream = lrcstr; 
    var blob = new Blob([filestream]);
    var a = document.createElement('a');
    var href = window.URL.createObjectURL(blob); // 创建下载连接
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // 下载完移除元素
  }else if(mode){
    download(audio.src, document.querySelector("#player_song_artist").innerHTML+' - '+document.querySelector("#player_song_title").innerHTML + '.mp3');
  }
}

function download(url, fileName) {
  if (!url || !fileName) return;
  if (window.enabledGM) {
    window.GM || enabledGM();
    GM.download(url, fileName);
  } else {
    window.open(url);
  }

}
