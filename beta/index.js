var searchinput=document.getElementById("searchinput");
var searchul=document.querySelector(".page.search ul");
var showmore=document.querySelector(".page.search .showmore");
searchinput.onkeydown=function(e){
  if(e.key=='Enter'&&this.value.trim()){
    gosearch();
    this.blur();
  }
}

var ysearch,nowpage=0,nowsearch='';
function gosearch(){
  var v=searchinput.value.trim();
  searchul.innerHTML='';
  if(ysearch)ysearch.abort();
  nowsearch=v;
  nowpage=0;
  bsearch();
}

showmore.querySelector('a').onclick=function(){
  bsearch();
}

document.querySelectorAll(".openMenu").forEach(function(e){e.onclick=function(){
  document.querySelector(".leftmenu").classList.add('show');
}});
document.querySelector(".closeMenu").onclick=function(){
  document.querySelector(".leftmenu").classList.remove('show');
}
function bsearch(){
  nowpage++;
  showmore.className='showmore';
  ysearch=kugou.search(nowsearch,function(res){
    res.songs.forEach(function(song,i){
      var li=document.createElement('li');
      li.innerHTML='<span class="index">'+(searchul.querySelectorAll('li').length+1)+'</span> <span class="title">'+(song.ispriviage?'<span class="vip">VIP</span>':'')+song.title+'</span>';
      li.setAttribute('data-detail',JSON.stringify(song));
      li.title=song.title;
      searchul.appendChild(li);
    });
    if(searchul.querySelectorAll('li').length<res.total){
      showmore.className='showmore more';
    }else{
      showmore.className='showmore no';
    }
  },nowpage)
}

searchul.addEventListener('click',function(e){
  
  function clli(l){
    if(l.tagName=='LI'){
      var detail=JSON.parse(l.getAttribute('data-detail'));
      if(detail.ispriviage){
        alert('这是付费歌曲，只能试听一分钟哦！');
      }
      addSong(detail);
    }else{
      if(l.parentElement.tagName!='UL')clli(l.parentElement);
    }
  }
  clli(e.target);
},false)

document.querySelector(".s1").onclick=function(){
  this.classList.add('active');
  document.querySelector(".leftmenu").classList.remove('show');
  document.querySelector(".s2").classList.remove('active');
  document.querySelector(".page.search").classList.add('active');
  document.querySelector(".page.playlist").classList.remove('active');
}

document.querySelector(".s2").onclick=function(){
  this.classList.add('active');
  document.querySelector(".leftmenu").classList.remove('show');
  document.querySelector(".s1").classList.remove('active');
  document.querySelector(".page.search").classList.remove('active');
  document.querySelector(".page.playlist").classList.add('active');
}


if(!localStorage.getItem('fh_list')){
  localStorage.setItem('fh_list',JSON.stringify([]));
}
var playlist=JSON.parse(localStorage.getItem('fh_list'));
var playlistul=document.querySelector('.playlist ul');
playlist.forEach(function(song){
  var li=document.createElement('li');
  li.innerHTML='<span class="index">'+(playlistul.querySelectorAll('li').length+1)+'</span> <span class="title">'+(song.ispriviage?'<span class="vip">VIP</span>':'')+''+song.title+'</span><span class="bi bi-x-lg"></span>';
  li.setAttribute('data-id',song.id);
  li.setAttribute('data-aid',song.album_id);
  li.title=song.title;
  playlistul.appendChild(li);
});

playlistul.addEventListener('click',function(e){  
  function clli(l){
    if(l.classList.contains('bi')){
      removeSong(l.parentElement.querySelector('.index').innerText-1);
      return;
    }
    if(l.tagName=='LI'){
      var aid=l.getAttribute('data-aid');
      var id=l.getAttribute('data-id');
      document.querySelector(".player").classList.remove('hide');
      nowplay=l.querySelector('.index').innerText-1;
      var actli=playlistul.querySelector("li.nowplay");
      if(actli)actli.classList.remove('nowplay');
      l.classList.add('nowplay');
      kugou.getSongDetails(id,aid,function(res){
        if(res.error){
          alert('歌曲获取失败！');
          removeSong(nowplay);
          return;
        }
        initMusicPlayer(res)
      })
    }else{
      if(l.parentElement.tagName!='UL')clli(l.parentElement);
    }
  }
  clli(e.target);
},false)

function addSong(song){
  console.log(song.id);
  var a=false;
  playlist.forEach(function(s,i){
    console.log(s.id,s.id==song.id);
    if(s.id==song.id){
      playlistul.querySelectorAll('li')[i].click();
      a=true;
      return;
    }
  });
  if(a)return;
  playlist.push(song);
  var li=document.createElement('li');
  li.innerHTML='<span class="index">'+(playlistul.querySelectorAll('li').length+1)+'</span> <span class="title">'+song.title+'</span><span class="bi bi-x-lg"></span>';
  li.setAttribute('data-id',song.id);
  li.setAttribute('data-aid',song.album_id);
  li.title=song.title;
  playlistul.appendChild(li);
  play(playlist.length-1);
  localStorage.setItem('fh_list',JSON.stringify(playlist));
}

function removeSong(i){
  console.log(i);
  playlist.splice(i,1);
  playlistul.querySelectorAll('li')[i].remove();
  playlistul.querySelectorAll('li').forEach(function(li,i){
    li.querySelector('.index').innerHTML=i+1;
  })
  localStorage.setItem('fh_list',JSON.stringify(playlist));
  if(nowplay==i){
    if(playlist.length==0){
      nowplay=-1;
      document.getElementById("player_album_img").src='https://image.gumengya.cn/i/2023/10/15/652b46cf15392.png';
    }else{
      if(nowplay==0){
        play(0);
      }else{
        play(nowplay-1);
      }
    }
  }

}