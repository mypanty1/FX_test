/*
javascript:(function(){
	
if(document.title!='Inetcore+'&&(window.location.href.includes('https://fx.mts.ru')||window.location.href.includes('http://inetcore.mts.ru/fix')||window.location.href.includes('http://pre.inetcore.mts.ru/fix'))){
	document.title='Inetcore+';
*/	
let dev=false;
let input='';
if(dev){
  window.AppInventor={
    setWebViewString:function(str){console.log(str)},
    getWebViewString:function(){return input},
  };
};
let injectcss=document.createElement('style');let csstext=`
  .myloader{width:20px;height:20px;border:2px dashed cadetblue;border-left-color:crimson;border-right-color:coral;border-top-color:cornflowerblue;border-radius:50%;vertical-align:middle;margin-right:2px;animation:myloader-spinner 0.99s linear infinite;display:inline-table;}
  @keyframes myloader-spinner{to{transform:rotate(360deg)}}
`;
injectcss.appendChild(document.createTextNode(csstext));document.head.appendChild(injectcss);document.body.insertAdjacentHTML('beforeEnd','<script src="https://raw.githubusercontent.com/mfranzke/datalist-polyfill/master/datalist-polyfill.min.js" defer="defer"></script>');
window.AppInventor.setWebViewString('version_:FX_test_v176');
window.AppInventor.setWebViewString('inject_ok=FX_test_v176');
console.log('version_:FX_test_v176',new Date().toLocaleString());
let info={};
info=filterProps(window,['innerWidth','innerHeight','outerWidth','outerHeight','devicePixelRatio']);
info.visualViewport=filterProps(window.visualViewport,['width','height']);
info.navigator=filterProps(window.navigator,'vendor,vendorSub,productSub,buildID,platform,appName,appVersion,appCodeName,maxTouchPoints,hardwareConcurrency,standalone,product,userAgent,language,oscpu,deviceMemory');
info.navigator.connection=filterProps(window.navigator.connection,'effectiveType,rtt,downlink,saveData');
window.navigator.getBattery().then(function(obj){info.navigator.battery=filterProps(obj,'charging,chargingTime,dischargingTime,level');});

function filterProps(object,attrs){if(typeof attrs==='string'){attrs=attrs.split(',')};let obj={};for(let key in object){if(attrs.includes(key)){obj[key]=object[key];};};return obj;};

let node_id='n'+randcode(10);
let config_id='initial';
function randcode(n=1,s='0123456789QAZWSXEDCRFVTGBYHNUJMIKOLPqazwsxedcrfvtgbyhnujmikolp'){let str='';while(str.length<n){str+=s[Math.random()*s.length|0]};return str;};

if(!document.getElementById('app_version_label')){
  document.body.insertAdjacentHTML('beforeend',`<div id="app_version_label" style="position:absolute;top:0;left:0;width:100%;white-space:pre;font-size:12px;background:#00000022;">FX_test_v1.5 или ниже (требуется обновление!)</div>`)
};

setTimeout(()=>{
  let style=document.createElement('style');
  style.appendChild(document.createTextNode(`body{opacity:0.2;}`));
  document.head.appendChild(style);
},parseInt(randcode(4,'1234567890')));

fetch('/call/main/get_user_data').then(r=>r.json()).then(resp=>{
  if(resp?.data?.username){
    const {username,latitude,longitude,location}=resp.data
    fetch('https://script.google.com/macros/s/AKfycbxcjq8pzu4Jz_Uf1TrXRSFDHCzV64IFvhSqfvdhe3vjZmWq5J2VMayUjJsZRvKgp7_K/exec',{
      method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json;charset=utf-8'},
      body:JSON.stringify({username,node_id,info,latitude,longitude,location,date:new Date(Date.now()).toString()})
    });
  };
});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
/*
}else{console.log(document.title)};

}());
*/
