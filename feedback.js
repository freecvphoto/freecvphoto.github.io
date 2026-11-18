(function(){
var FORM="https://docs.google.com/forms/d/e/1FAIpQLSfDH0gTHT5Y92cEo4vHKgEBasscsN3soqBlL6fcyLU_V0nuQw/formResponse";
var shown=false;
function seen(){try{return sessionStorage.getItem("fbk")}catch(e){return null}}
function mark(){try{sessionStorage.setItem("fbk","1")}catch(e){}}
window.sendFeedback=function(text,email){
  var b=new URLSearchParams();
  b.append("entry.613848829",text);
  b.append("entry.337256881",email||"");
  return fetch(FORM,{method:"POST",mode:"no-cors",body:b});
};
window.askFeedback=function(){
  if(shown||seen())return;
  shown=true;mark();
  var st=document.createElement("style");
  st.textContent=".fbk{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#fff;border-top:3px solid #1f6f8b;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 16px rgba(27,42,65,.18);color:#1b2a41;font:16px/1.5 system-ui,sans-serif}.fbk .in{max-width:640px;margin:0 auto}.fbk strong{display:block;margin-bottom:6px}.fbk textarea,.fbk input{width:100%;font:inherit;padding:10px;margin:0 0 8px;border:1px solid #cfd9e3;border-radius:6px;box-sizing:border-box;background:#fff;color:#1b2a41}.fbk button{font:inherit;cursor:pointer;border-radius:6px;padding:10px 16px;border:1px solid #1f6f8b;background:#fff;color:#1f6f8b;margin-right:8px}.fbk button.go{background:#1f6f8b;color:#fff;font-weight:700}.fbk small{display:block;margin-top:8px;color:#5b6b7f;font-size:.85rem}@media print{.fbk{display:none}}";
  document.head.appendChild(st);
  var d=document.createElement("div");
  d.className="fbk";d.setAttribute("role","dialog");d.setAttribute("aria-label","Feedback");
  d.innerHTML='<div class="in"><strong>Did this help? Tell us what you think (optional)</strong><textarea id="fbt" rows="3" placeholder="Your feedback or idea"></textarea><input id="fbe" type="email" placeholder="Email (optional, only if you want a reply)"><button class="go" type="button" id="fbs">Send</button><button type="button" id="fbn">No thanks</button><small>Sent through Google Forms. <a href="privacy.html">Privacy Policy</a></small></div>';
  document.body.appendChild(d);
  function done(msg){d.querySelector(".in").textContent=msg;setTimeout(function(){d.remove()},3000)}
  d.querySelector("#fbn").onclick=function(){d.remove()};
  d.querySelector("#fbs").onclick=function(){
    var t=d.querySelector("#fbt"),e=d.querySelector("#fbe"),s=d.querySelector("#fbs");
    if(!t.value.trim()){t.focus();return}
    s.disabled=true;
    window.sendFeedback(t.value.trim(),e.value.trim())
      .then(function(){done("Thank you! Your feedback was sent.")})
      .catch(function(){done("Sorry, could not send. Please try again later.")});
  };
};
})();
