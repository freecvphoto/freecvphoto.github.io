const CDN="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
const MODEL="https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
let seg;
async function load(){
  if(seg)return seg;
  const m=await import(CDN+"/+esm");
  const v=await m.FilesetResolver.forVisionTasks(CDN+"/wasm");
  seg=await m.ImageSegmenter.createFromOptions(v,{baseOptions:{modelAssetPath:MODEL},runningMode:"IMAGE",outputConfidenceMasks:true,outputCategoryMask:false});
  return seg;
}
function loadImage(file){
  return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(file)});
}
async function cutout(img){
  const s=await load();
  const k=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
  const W=Math.round(img.naturalWidth*k),H=Math.round(img.naturalHeight*k);
  const src=document.createElement("canvas");src.width=W;src.height=H;
  src.getContext("2d").drawImage(img,0,0,W,H);
  cutout.orig=src;
  const r=s.segment(src);
  const w=r.confidenceMasks[0].width,h=r.confidenceMasks[0].height;
  const arr=r.confidenceMasks.map(m=>Float32Array.from(m.getAsFloat32Array()));
  r.close&&r.close();
  // pick the mask where the centre of the photo is "person" and the border is "background"
  const sc=a=>{let c=0,cn=0,b=0,bn=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=a[y*w+x];
      if(x>w*.3&&x<w*.7&&y>h*.3&&y<h*.7){c+=v;cn++}else if(x<w*.1||x>w*.9||y<h*.1){b+=v;bn++}}
    return c/cn-b/bn};
  let bi=0,bs=-9;arr.forEach((a,i)=>{const v=sc(a);if(v>bs){bs=v;bi=i}});
  const a=arr[bi],inv=bs<0;
  const mc=document.createElement("canvas");mc.width=w;mc.height=h;
  const mx=mc.getContext("2d"),md=mx.createImageData(w,h);
  for(let i=0;i<w*h;i++){let p=inv?1-a[i]:a[i];p=Math.min(1,Math.max(0,(p-.3)/.4));md.data[i*4+3]=p*255}
  mx.putImageData(md,0,0);
  const out=document.createElement("canvas");out.width=W;out.height=H;
  const o=out.getContext("2d");
  o.drawImage(src,0,0);
  o.globalCompositeOperation="destination-in";
  o.imageSmoothingEnabled=true;o.imageSmoothingQuality="high";
  o.drawImage(mc,0,0,W,H);
  o.globalCompositeOperation="source-over";
  return out;
}
function withBg(c,color){
  const o=document.createElement("canvas");o.width=c.width;o.height=c.height;
  const x=o.getContext("2d");
  if(color){x.fillStyle=color;x.fillRect(0,0,o.width,o.height)}
  x.drawImage(c,0,0);return o;
}
function swatches(box,list,pick){
  const bs=[];
  const set=(c,b)=>{bs.forEach(x=>x.setAttribute("aria-pressed",x===b));pick(c)};
  list.forEach(([n,c])=>{
    const b=document.createElement("button");b.type="button";b.title=n;b.setAttribute("aria-label",n);
    b.style.background=c||"repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/12px 12px";
    b.onclick=()=>set(c,b);bs.push(b);box.append(b);
  });
  const i=document.createElement("input");i.type="color";i.title="Custom color";i.setAttribute("aria-label","Custom color");
  i.oninput=()=>set(i.value,null);box.append(i);
  set(list[0][1],bs[0]);
}
function save(canvas,name,type){
  const a=document.createElement("a");a.download=name;a.href=canvas.toDataURL(type,.95);a.click();
}
