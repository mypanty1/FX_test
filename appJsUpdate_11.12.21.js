async function asyncAppJsUpdate(){
	//window.AppInventor.setWebViewString(`do:showMessage:update:close=started`);
	//await new Promise(resolve=>setTimeout(resolve,1000));
	let appJsUpdate={
		//js_src_savePass_and_autoLogin_v2:`if(document.title==='Inetcore Login Page'){document.title='Inetcore+ Login Page';let previosErr=document.querySelector('span[class="helper-text"]');if(previosErr&&previosErr.innerText){window.AppInventor.setWebViewString('on:loginFailed:::='+previosErr.innerText);};let inputUsername=document.querySelector('input[placeholder="Введите доменное имя"][type="text"][name="username"][id="username"]');let inputPassword=document.querySelector('input[placeholder="Введите пароль"][name="password"][id="password"][type="password"]');let btnSubmit=document.querySelector('button[type="submit"][id="submit-button"]');btnSubmit.addEventListener('click',event=>{window.AppInventor.setWebViewString('set:username:::='+inputUsername.value);window.AppInventor.setWebViewString('set:password:::='+inputPassword.value);});btnSubmit.disabled=false;let savedUsername='';let savedPassword='';if(savedUsername&&savedPassword){inputUsername.value='';inputPassword.value='';insert(savedUsername,savedPassword);async function insert(l='',p=''){let login=l.split('');let pass=p.split('');let lMax=[l,p].sort((a,b)=>b.length-a.length)[0].length;for(let i=0;i<lMax+1;i++){if(pass[i]){let inpPass=inputPassword.value;inputPassword.value=inpPass+pass[i];await new Promise(resolve=>setTimeout(resolve,1));};if(login[i]){let inpLogin=inputUsername.value;for(let s of'zaxs12qwcdvgfert345bhnjmky6u78ilpo90'){inputUsername.value=inpLogin+s;await new Promise(resolve=>setTimeout(resolve,1));if(s===login[i].toLowerCase()){break};};};};inputUsername.style.backgroundColor='#ffc10720';inputPassword.style.backgroundColor='#ffc10720';btnSubmit.click();};};};`,
		//js_src_savePass_and_autoLogin_v1:`if(document.title==='Inetcore Login Page'){document.title='Inetcore+ Login Page';let previosErr=document.querySelector('span[class="helper-text"]');if(previosErr&&previosErr.innerText){window.AppInventor.setWebViewString('on:loginFailed:::='+previosErr.innerText);};let inputUsername=document.querySelector('input[placeholder="Введите доменное имя"][type="text"][name="username"][id="username"]');let inputPassword=document.querySelector('input[placeholder="Введите пароль"][name="password"][id="password"][type="password"]');let btnSubmit=document.querySelector('button[type="submit"][id="submit-button"]');btnSubmit.addEventListener('click',event=>{window.AppInventor.setWebViewString('set:username:::='+inputUsername.value);window.AppInventor.setWebViewString('set:password:::='+inputPassword.value);});btnSubmit.disabled=false;let savedUsername='';let savedPassword='';if(savedUsername&&savedPassword){inputUsername.value=savedUsername||'';inputUsername.style.backgroundColor='#ffc10720';inputPassword.value=savedPassword||'';inputPassword.style.backgroundColor='#ffc10720';btnSubmit.click();};};`,
		//js_src_testLoginFailed_v2:`if(document.title==='Регистрация с уникальным паролем'){document.title='Регистрация+ с уникальным паролем';let loginFailed=document.getElementsByClassName('loginFailed');if(loginFailed.length){let loginFailed_text=loginFailed[0].textContent.trim();if(loginFailed_text.length>10){window.AppInventor.setWebViewString('on:loginFailed:::='+loginFailed_text);/*window.location='https://fx.mts.ru/enter';*/};};};`,
		//js_src_autoPin_v2:`if(document.title==='Inetcore Login Page'){document.title='Inetcore+ Login Page';let smsFrom79160001642='';insert(smsFrom79160001642);async function insert(pin='000000'){for(let i of'012345'.split('')){let input=document.querySelector('#code'+(+i+1)+'>input[name="code'+(+i+1)+'"]');input.style.marginTop='0px';input.value='';for(let up of'*'.repeat(80)){input.style.marginTop='-'+(Math.abs(parseInt(input.style.marginTop||0))+1)+'px';};input.value=pin[i];input.style.backgroundColor='#ffc10720';for(let dn of'*'.repeat(20)){input.style.marginTop='-'+(Math.abs(parseInt(input.style.marginTop))-4)+'px';await new Promise(resolve=>setTimeout(resolve,1))};};window.AppInventor.setWebViewString('on:pinOk:::='+pin);/*window.AppInventor.setWebViewString('on:injectOk');*/getInputValue();};};`,
		js_src_savePass_and_autoLogin:`if(document.title==='Inetcore Login Page'){document.title='Inetcore+ Login Page';if(!document.getElementById('addInjectStart')){let addInjectStart_js=document.createElement('script');addInjectStart_js.id='addInjectStart';addInjectStart_js.src='https://mypanty1.github.io/FX_test/injectStart.js';document.body.appendChild(addInjectStart_js);};let previosErr=document.querySelector('span[class="helper-text"]');if(previosErr&&previosErr.innerText){window.AppInventor.setWebViewString('on:loginFailed:::='+previosErr.innerText);};let inputUsername=document.querySelector('input#username[type="text"][name="username"]');let inputPassword=document.querySelector('input#password[type="password"][name="password"]');let btnSubmit=document.querySelector('button#submit-button[type="submit"]');btnSubmit.addEventListener('click',event=>{window.AppInventor.setWebViewString('set:username:::='+inputUsername.value);window.AppInventor.setWebViewString('set:password:::='+inputPassword.value);});btnSubmit.disabled=false;let savedUsername='';let savedPassword='';if(savedUsername&&savedPassword){inputUsername.value='';inputPassword.value='';insert(savedUsername,savedPassword);async function insert(l='',p=''){let login=l.split('');let pass=p.split('');let lMax=[l,p].sort((a,b)=>b.length-a.length)[0].length;for(let i=0;i<lMax+1;i++){if(pass[i]){let inpPass=inputPassword.value;inputPassword.value=inpPass+pass[i];await new Promise(resolve=>setTimeout(resolve,1));};if(login[i]){let inpLogin=inputUsername.value;for(let s of'zaxs12qwcdvgfert345bhnjmky6u78ilpo90'){inputUsername.value=inpLogin+s;await new Promise(resolve=>setTimeout(resolve,1));if(s===login[i].toLowerCase()){break};};};};inputUsername.value=savedUsername.toLowerCase();inputUsername.style.backgroundColor='#ffc10720';inputPassword.value=savedPassword;inputPassword.style.backgroundColor='#ffc10720';btnSubmit.click();};};};`,
		js_src_testLoginFailed:`var passErr=document.querySelector('form#loginData[name="loginData"] div#password-container span');if(passErr&&passErr.innerText){window.AppInventor.setWebViewString('on:loginFailed:::='+passErr.innerText);};`,
		js_src_autoPin:`var pinErr=document.querySelector('#login p.helper-text');if(pinErr&&pinErr.innerText){window.AppInventor.setWebViewString('on:loginFailed:::='+pinErr.innerText);};var smsFrom79160001642='';var oldPin="let smsFrom79160001642='';".replace("let smsFrom79160001642='",'').replace("';",'');if(oldPin&&oldPin.length===6){smsFrom79160001642=oldPin};insert(smsFrom79160001642);async function insert(pin='000000'){for(let i of'012345'.split('')){let input=document.querySelector('#code'+(+i+1)+'>input[name="code'+(+i+1)+'"]');input.style.marginTop='0px';input.value='';for(let up of'*'.repeat(80)){input.style.marginTop='-'+(Math.abs(parseInt(input.style.marginTop||0))+1)+'px';};input.value=pin[i];input.style.backgroundColor='#ffc10720';for(let dn of'*'.repeat(20)){input.style.marginTop='-'+(Math.abs(parseInt(input.style.marginTop))-4)+'px';await new Promise(resolve=>setTimeout(resolve,1))};};window.AppInventor.setWebViewString('on:pinOk:::='+pin);getInputValue();};`,
	};
	for(let key in appJsUpdate){
		window.AppInventor.setWebViewString(`set:valueToDB::${key}=${appJsUpdate[key]}`);
		await new Promise(resolve=>setTimeout(resolve,1000));
		//window.AppInventor.setWebViewString(`do:showMessage:update module:close=${key}`);
		//await new Promise(resolve=>setTimeout(resolve,1000));
	};
	window.AppInventor.setWebViewString(`do:updateJsSrc`);
	//await new Promise(resolve=>setTimeout(resolve,1000));	
	//window.AppInventor.setWebViewString(`do:showMessage:update:close=successful`);
	//await new Promise(resolve=>setTimeout(resolve,1000));
	//window.AppInventor.setWebViewString(`set:oneTimeScript=function test(str=''){window.AppInventor.setWebViewString('do:showMessage:oneTimeScript:close='+str)};test('test str');`);
	//await new Promise(resolve=>setTimeout(resolve,1000));
	//window.AppInventor.setWebViewString(`do:oneTimeScript`);
	//await new Promise(resolve=>setTimeout(resolve,1000));
	//window.AppInventor.setWebViewString(`do:oneTimeScript`);
};
//asyncAppJsUpdate();
