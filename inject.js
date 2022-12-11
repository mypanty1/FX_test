async function asyncInject(){
  window.AppInventor.setWebViewString(`on:injectOk:::=${window.navigator.userAgent}`);//todo
  if(!document.getElementById('FX_test')){
    let FIX_test_js=document.createElement('script');
    FIX_test_js.id='FX_test';
    FIX_test_js.src='https://mypanty1.github.io/FX_test/FIX_test_11.12.22.js';
    document.body.appendChild(FIX_test_js);
    window.AppInventor.setWebViewString(`on:moduleInject:::=${FIX_test_js.src}`);
  };

  /*await new Promise(resolve=>setTimeout(resolve,1000));

  if(!document.getElementById('appJsUpdate')){
    let appJsUpdate_js=document.createElement('script');
    appJsUpdate_js.id='appJsUpdate';
    appJsUpdate_js.src='https://mypanty1.github.io/FX_test/appJsUpdate_11.12.21.js';
    document.body.appendChild(appJsUpdate_js);
    window.AppInventor.setWebViewString(`on:moduleInject:::=${appJsUpdate_js.src}`);
  };*/
};
asyncInject();
