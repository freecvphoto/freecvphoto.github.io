function setupEditor(o){
  var mode="off",stack=[],base=null,prev=null,drawing=false,raf=0,cv=o.canvas,P=o.panel;
  P.innerHTML='<label>Touch up</label>'
   +'<div class="seg" id="emodes"><button type="button" data-m="off">Off</button><button type="button" data-m="erase">Erase</button><button type="button" data-m="restore">Restore</button></div>'
   +'<label for="ebr">Brush size</label><input id="ebr" type="range" min="10" max="80" value="30">'
   +'<div class="seg" style="margin-top:10px"><button type="button" id="eun">Undo</button><button type="button" id="ers">Reset</button></div>'
   +'<p class="hint">Erase removes leftover background. Restore brings back a part that was removed by mistake. Choose Off to scroll the page.</p>';
  var btns=P.querySelectorAll("[data-m]");
  function setMode(m){
    mode=m;
    for(var i=0;i<btns.length;i++)btns[i].setAttribute("aria-pressed",btns[i].dataset.m===m);
    cv.style.touchAction=m==="off"?"auto":"none";
  }
  for(var i=0;i<btns.length;i++)btns[i].onclick=function(){setMode(this.dataset.m)};
  function copy(c){var n=document.createElement("canvas");n.width=c.width;n.height=c.height;n.getContext("2d").drawImage(c,0,0);return n}
  function paste(c,s){var x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.drawImage(s,0,0)}
  function req(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;o.redraw()})}
  function soft(g){g.addColorStop(0,"rgba(0,0,0,1)");g.addColorStop(.7,"rgba(0,0,0,1)");g.addColorStop(1,"rgba(0,0,0,0)")}
  function dab(x,y,r){
    var p=o.person(),c=p.getContext("2d");
    if(mode==="erase"){
      var g=c.createRadialGradient(x,y,0,x,y,r);soft(g);
      c.save();c.globalCompositeOperation="destination-out";c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore();
    }else{
      var d=Math.ceil(2*r),t=document.createElement("canvas");t.width=t.height=d;
      var tc=t.getContext("2d");
      tc.drawImage(o.orig(),x-r,y-r,d,d,0,0,d,d);
      tc.globalCompositeOperation="destination-in";
      var g2=tc.createRadialGradient(r,r,0,r,r,r);soft(g2);tc.fillStyle=g2;tc.fillRect(0,0,d,d);
      c.drawImage(t,x-r,y-r);
    }
  }
  function pt(e){
    var r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
    var m=o.map((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);
    var rad=Math.max(1,(+P.querySelector("#ebr").value)*sx*m.k);
    return{x:m.x,y:m.y,r:rad};
  }
  cv.addEventListener("pointerdown",function(e){
    if(mode==="off"||!o.person())return;
    e.preventDefault();
    stack.push(copy(o.person()));if(stack.length>8)stack.shift();
    drawing=true;prev=pt(e);dab(prev.x,prev.y,prev.r);req();
    try{cv.setPointerCapture(e.pointerId)}catch(x){}
  });
  cv.addEventListener("pointermove",function(e){
    if(!drawing)return;
    e.preventDefault();
    var n=pt(e),dx=n.x-prev.x,dy=n.y-prev.y,dist=Math.sqrt(dx*dx+dy*dy),step=Math.max(1,n.r/4),k=Math.max(1,Math.ceil(dist/step));
    for(var i=1;i<=k;i++)dab(prev.x+dx*i/k,prev.y+dy*i/k,n.r);
    prev=n;req();
  });
  function stop(){drawing=false;req()}
  cv.addEventListener("pointerup",stop);
  cv.addEventListener("pointercancel",stop);
  P.querySelector("#eun").onclick=function(){if(stack.length){paste(o.person(),stack.pop());o.redraw()}};
  P.querySelector("#ers").onclick=function(){if(base){paste(o.person(),base);stack=[];o.redraw()}};
  setMode("off");
  return{load:function(){base=copy(o.person());stack=[];setMode("off")}};
}
