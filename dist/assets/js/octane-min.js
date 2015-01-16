/* octane -  - 2015-01-14*/!function(a,b,c){var d={isObject:function(a,b){return b?"object"==typeof a&&null!==a:"object"==typeof a&&null!==a&&!(a instanceof Array)},isArray:function(a){return"object"==typeof a&&a instanceof Array&&a.length>=0},isFalsey:function(a){var b="case_"+a,c={case_false:function(){return!0},case_0:function(){return!0},case_null:function(){return!0},case_undefined:function(){return!0},case_:function(){return!0}};return b=b.trim(),c[b]?c[b]():!1},isUndefined:function(a){return"undefined"==typeof a},isNull:function(a){return null===a},isBlank:function(a){var b="case_"+a,c={case_undefined:function(){return!0},case_null:function(){return!0},case_:function(){return!0}};return b=b.trim(),c[b]?c[b]():!1},is$:function(a){return a instanceof c},createEvent:function(a){var b;try{b=new Event(a)}catch(c){b=document.createEvent("event"),b.initEvent(a,!0,!1)}return b},customEvent:function(a,c){var d;if(b.CustomEvent)try{c=c||{bubbles:!1,cancelable:!1,detail:{}},d=new CustomEvent(a,c)}catch(e){d=document.createEvent("CustomEvent"),d.initCustomEvent(a,c.bubbles||!1,c.cancelable||!1,c.detail||{})}else d=document.createEvent("CustomEvent"),d.initCustomEvent(a,c.bubbles||!1,c.cancelable||!1,c.detail||{});return d},Switch:function(a){function b(a,b,c){return c?void("undefined"==d.typeOf(f[a])&&(f[a]=[b])):(f[a]=_.isArray(f[a])?f[a]:[],_.isFunction(b)&&f[a].push(b),e)}function c(a,b){function c(a,b){var c=a.length;if(1==c)return _.isFunction(a[0])&&a[0].apply(null,b);for(var e=0;c>e;e++)d(a[e],b)}function d(a,b){setTimeout(function(){_.isFunction(a)&&a.apply(null,b)},0)}f["default"]||(f["default"]=[function(){return!1}]);return b=_.isArray(b)?b:_.isString(b)?b.split(","):[],f[a]?c(f[a],b):f["default"][0](b)}var e=this,f={};if(_.isObject(a))for(var g in a)({}).hasOwnProperty.call(a,g)&&b(g,a[g]);this.addCase=function(a,c){return b(a,c)},this.run=function(a,b){return c(a,b)},this.getCases=function(){return f}},typeOf:function(a){return{}.toString.call(a).match(/\s([a-zA-Z]+)/)[1].toLowerCase()},location:function(){var a,c,e=document.createElement("a"),f={};e.href=b.location,a=e.search.replace(/^\?/,"").split("&");for(var g=0,h=a.length;h>g;g++)if(c=a[g].split("="),!d.isBlank(c)){var i=c[0],j=c[1];f[i]=j}return{protocol:e.protocol,host:e.host,hostname:e.hostname,port:e.port,pathname:e.pathname,searchString:e.search,searchObject:f,hash:e.hash}},titleize:function(a){return"string"==d.typeOf(a)?a.replace(/\-+|[_]+/," ").replace(/^.|\s+?[a-z]/g,function(a){return a.toUpperCase()}):void 0},camelize:function(a){return"string"==d.typeOf(a)?a.replace(/\W+?[a-z]|\_+?[a-z]/g,function(a){return a.toUpperCase()}).replace(/\W+|\_+/g,""):void 0},dashify:function(a){return"string"==d.typeOf(a)?a.replace(/\s+|[_]+/g,"-").replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()}).replace(/-{2}/g,"-"):void 0},inArray:function(a,b){return-1!==a.indexOf(b)}};!String.prototype.__titleize&&Object.defineProperty(String.prototype,"__titleize",{value:function(){return this.replace(/\-+|[_]+/," ").replace(/^.|\s+?[a-z]/g,function(a){return a.toUpperCase()})},configurable:!1,writable:!1,enumerable:!1}),!String.prototype.__camelize&&Object.defineProperty(String.prototype,"__camelize",{value:function(){return this.replace(/\W+?[a-z]|\_+?[a-z]/g,function(a){return a.toUpperCase()}).replace(/\W+|\_+/g,"")},configurable:!1,writable:!1,enumerable:!1}),!String.prototype.__dashify&&Object.defineProperty(String.prototype,"__dashify",{value:function(){return this.replace(/\s+|[_]+/g,"-").replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()}).replace(/-{2}/g,"-")},configurable:!1,writable:!1,enumerable:!1}),!Function.prototype.__construct&&Object.defineProperty(Function.prototype,"__construct",{value:function(a){var b=this.prototype,c=Object.create(b);return this.apply(c,a),c},configurable:!1,writable:!1,enumerable:!1}),!Array.prototype.__contains&&Object.defineProperty(Array.prototype,"__contains",{value:function(a){return-1!==this.indexOf(a)},configurable:!1,writable:!1,enumerable:!1}),!Array.prototype.__isEmpty&&Object.defineProperty(Array.prototype,"__isEmpty",{value:function(){return 0===this.length},configurable:!1,writable:!1,enumerable:!1}),!Object.prototype.__isEmpty&&Object.defineProperty(Object.prototype,"__isEmpty",{value:function(){var a;for(a in this)if({}.hasOwnProperty.call(this,a))return!1;return!0},configurable:!1,writable:!1,enumerable:!1}),b[a]=d}("__",window,jQuery),function(a,b,c){"use strict";function d(a){this.name=b.isString(a)&&a}function e(a){this.name=a}function f(){}function g(a,c,d){a=b.isArray(a)?a:[];for(var e=0,f=a.length;f>e;e++)if(!a[e][0])return t.log("Context: "+d+". A "+c+" failed; "+a[e][1]),!1;return!0}function h(a){this.message=a||"An Octane error occurred.",this.stack=Error().stack}function i(a,c){a=b.isString(a)?a:"",c=b.isObject(c)?c:{};var d,e,f=/\{\{([^{^}]+)\}\}/g,g=a.match(f);if(b.isArray(g))for(var h=0,i=g.length;i>h;h++)d=g[h].replace(/[{}]+/g,""),e=new RegExp("(\\{\\{"+d+"\\}\\})","g"),a=a.replace(e,c[d]);return a}function j(a,c){if(b.isObject(c)){var d=b.isObject(c)?c:{};this.name=a,this.checkout=function(){return d},this.contrib=function(a,b){d[a]||(d[a]=b)},this.resolve(d)}else this.reject("invalid library data, not an object")}function k(a,c){c=b.isObject(c)?c:{},c.context=c.context||"Application";var e=[[b.isString(a),"Model name must be a string."]],f=g(e,"Model",c.context);if(!f)return{instanced:!1};var h={},i=this;this.define({instanced:!0,name:a,context:c.context,state:{}});var j=new l(i);this.define({access:function(a){return h[a]},reScope:function(){j.parse()}}),function(b){t.models[a]=b,d.prototype.extend.call(h,c.db),b.set(c.defaults)}(this)}function l(a){var b=this;this.define({instanced:!0,model:a,watcher:new c.Switch,scope:{}}),function(a){a.watcher.addCase("input",function(b){a.uptake(b.srcElement)}).addCase("select",function(b){a.uptake(b.srcElement)}).addCase("click",function(b){a.uptake(b.srcElement)}).addCase(a.model.name+":statechange",function(){a.refresh()}),s.handle("input click "+a.model.name+":statechange",a),a.parse(),a.refresh()}(b)}function m(a,b){b=b||"Application";var d=t.models[a]||{},e=[[d instanceof k,"defined model is not an instance of $O.Model"],[d.instanced,"model "+a+" passed as argument was not initialized"]],f=g(e,"Controller",b);if(!f)return{instanced:!1};var h=this;this.define({instanced:!0,model:d,context:b,tasks:new c.Switch,filters:{},parsers:{},hooks:{}}),function(){t.controllers[a]=h,s.handle(h.model.name+":statechange",h)}()}function n(a){t.bootlog.push(a),s.model("bootlog").set({bootlog:t.bootlog,status:a})}function o(a){this.extend(a)}function p(a,b,d){d="function"==c.typeOf(arguments[2])?arguments[2]:arguments[1],t.modules[a]=new o({name:a,constructor:d,dependencies:"array"==c.typeOf(arguments[1])?arguments[1]:[],loaded:!1})}function q(a){a=a||{};var c,d,e=Object.keys(t.modules),f=[];return t.modules.router._load().then(function(){for(var g=0,h=e.length;h>g;g++)d=e[g],c=t.modules[d],c.loaded||!function(c){c.cfg=b.isArray(a[d])?a[d]:[],n(c.name+": not loaded, loading..."),f.push(c._load())}(c);return Promise.all(f)}).catch(function(a){n(a)})}function r(a){if(a=a||{},!s.initialized){s.define({initialized:!0}),octane.name=a.name;for(var c,d=s.library("startup-utilities")||{},e=Object.keys(d),f=0,g=e.length;g>f;f++)c=e[f],s.fire("loading:utility",{detail:c}),b.isFunction(d[c])&&d[c].call();t.modules.debug&&(a.debug=[t]),q(a).then(function(){setTimeout(function(){var a=s.dom.container().getAttribute("class");a=a?a.split(" "):[],b.pull(a,"hidden"),a=a.join(" "),s.dom.container().setAttribute("class",a)},1e3),s.fire("octane:ready")})}}if(!window.__)return!1;if(window.octane)return!1;Object.defineProperty(d.prototype,"extend",{value:function(a,c){c=b.isBoolean(c)?c:!0;var d,e;if(b.isObject(a)){d=Object.keys(a);for(var f=0,g=d.length;g>f;f++)if(e=d[f],c)this[e]=a[e];else if(!this[e]){var h=this;this[e]=b.isFunction(a[e])?a[e].bind(h):a[e]}}return this},writable:!1,configuarable:!1}),Object.defineProperty(d.prototype,"define",{value:function(a,c,d){switch(b.isBoolean(arguments[0])?(a=arguments[0],c=arguments[1],d=arguments[2]):(c=arguments[0],d=arguments[1],a=!1),!0){case b.isObject(c):for(var e,f=Object.keys(c),g=0,h=f.length;h>g;g++)e=f[g],Object.defineProperty(this,e,{value:c[e],configurable:!1,writable:a,enumerable:!0});break;case b.isString(c):Object.defineProperty(this,c,{value:d,configurable:!1,writable:a,enumerable:!0})}return this},writable:!1,configuarable:!1});var s=e.prototype=new d("Octane Application");s.constructor=e,s.initialized=!1,s.define({base:function(a){return new d(a)}});var t=new d("octane protected");t.define({modules:{},models:{},views:{},controllers:{},eventRegister:{}}),f.prototype=new d("Simple Promise"),f.prototype.extend({state:"pending",result:null,error:null}),f.prototype.define({constructor:f,_isResolved:function(){return"resolved"==this.state},_isRejected:function(){return"rejected"==this.state},_isPending:function(){return"pending"==this.state},resolveCallbacks:[],rejectCallbacks:[],then:function(a,c){return a=b.isFunction(a)?a:function(){},c=b.isFunction(c)?c:function(){},this.resolveCallbacks.push(a),this.rejectCallbacks.push(c),"resolved"==this.state?a(this.result):"rejected"==this.state?c(this.error):void 0},resolve:function(a){var b=this.resolveCallbacks;this.state="resolved",this.result=a;for(var c=0,d=b.length;d>c;c++)setTimeout(function(){b[c].call&&b[c].call(null,a)},0)},reject:function(a){var b=this.rejectCallbacks;this.state="rejected",this.error=a;for(var c=0,d=b.length;d>c;c++)setTimeout(function(){b[c].call&&b[c].call(null,a)},0)}}),s.define({GUID:function(){var a=function(){return(65536*(1+Math.random())|0).toString(16).substring(1).toUpperCase()};return"octane"+a()+"-"+a()+"-"+a()+a()}}),t.extend({logfile:[],log:function(a){t.logfile.push(a)},getLog:function(){for(var a=0,b=t.logfile.length;b>a;a++)console.log(t.logfile[a])}}),s.define({log:function(a){s.hasModule("debug")&&t.log(a)}}),h.prototype=Object.create(Error.prototype),h.prototype.constructor=h,h.prototype.name="OctaneError",s.define({error:function(a){throw new h(a)}}),s.define({xhr:function(a){return new Promise(function(d,e){function f(){4===h.readyState&&new c.Switch({200:function(a,b,c,d){var e;e="json"==b.responseType?g(a.responseText):a.responseText,e?c(e):d(s.error("Error parsing response as JSON: Octane.ajax()"))},404:function(a,b,c,d){d(s.error("The server responded with 400 not found"))},500:function(a,b,c,d){d(s.error("An internal server error occurred"))}}).run(h.status,[h,j,d,e])}function g(a){try{return JSON.parse(a)}catch(b){return!1}}var h,i,j={url:!1,type:"POST",send:null,responseType:"text"};if(b.isString(a)&&0!==a.length)j.url=a;else{if(!b.isObject(a))return i=s.error("Octane.ajax must have a url"),void e(i);s.extend(j,a)}if(window.XMLHttpRequest)h=new XMLHttpRequest;else if(window.ActiveXObject)try{h=new ActiveXObject("Msxml2.XMLHTTP")}catch(k){try{h=new ActiveXObject("Microsoft.XMLHTTP")}catch(k){i=s.error("Could not create XMLHttpRequest "+k.message),e(i)}}h.onreadystatechange=f,h.open(j.type,j.url),h.send(j.send)})},getLibrary:function(a){return new Promise(function(b,c){var d,e,f=a.replace(/[.\/:]/g,"_"),g=document.querySelectorAll("script#"+f);0!==g.length?s.hasLibrary(f).then(b,c):(s.handle("script:loaded:"+f,function(){e=t.cacheJSON.pop(),s.addLibrary(f,e).then(b,c)}),s.handle("script:failed:"+f,function(){c("Script failed to load from "+a)}),d=document.createElement("script"),d.id=f,d.src=a,d.onload=function(){s.fire("script:loaded:"+f)},d.onerror=function(){s.fire("script:failed:"+f)},document.body.appendChild(d))})},jsonp:function(a){if(b.isString(a))try{a=JSON.parse(a)}catch(c){s.error("failed to parse JSON from Octane.jsonp() "+c.message)}b.isObject(a)&&t.cacheJSON.push(a)}}),t.cacheJSON=[],s.define({handle:function(a,d,e){e=3==arguments.length?arguments[2]:arguments[1];var f=a?a.split(" "):[],g=new c.Switch;g.addCase("2",function(a,c){window.addEventListener(f[h],c,!1),b.isArray(t.eventRegister[f[h]])||(t.eventRegister[f[h]]=[]),t.eventRegister[f[h]].push(c)}).addCase("3",function(a,b,d){window.addEventListener(a,function(a){if(a.srcElement==d){new c.Switch({"function":function(a){try{b.apply(d,[a])}catch(c){t.log(c)}},object:function(a,c){try{b.handleEvent.apply(b,[c])}catch(d){t.log(d)}}}).run(c.typeOf(b),[d,a])}})});for(var h=0,i=f.length;i>h;h++)g.run(arguments.length,[f[h],e,d])},fire:function(a,d){if(b.isString(a)){var e=d?c.customEvent(a,d):c.createEvent(a);window.dispatchEvent(e)}}}),t.templates={},s.define({addTemplate:function(a,c){b.isString(a)&&b.isString(c)&&(t.templates[a]?t.log("Could not create template "+a+". Already exists"):t.templates[a]=c)},template:function(a,b){var c=document.createElement("o-template");return c.innerHTML=i(t.templates[a],b),c}}),t.filters=new c.Switch,s.define({addFilter:function(a,c,d){c=c||/.*/,d=d||/.*/;var e=function(a){switch(!0){case c.test(a):return{data:a,status:"valid"};case b.isEmpty(a)||b.isUndefined(a):return{data:null,status:"undefined"};case d.test(a):return{data:null,status:"invalid"};default:return{data:a,status:"default"}}};t.filters.addCase(a,e,!0)}}),s.addFilter("number",/^[-\d]+$/),s.addFilter("email",/^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/),s.addFilter("tel",/^[-0-9\.]{7,12}$/),t.libraries={},j.prototype=new f,s.define({addLibrary:function(a,c){return b.isObject(c)?t.libraries[a]=new j(a,c):Promise.reject("could not create library "+a+". Data was not an object")},library:function(a){return s.hasLibrary(a).then(function(a){return a})},hasLibrary:function(a){var b=t.libraries[a];return b instanceof j?b:Promise.reject("Error: Library "+a+" does not exist")}}),k.prototype=new d,k.prototype.constructor=k,k.prototype.define({set:function(){function a(a,c,d){return a[c]=d==m-1?l:b.isObject(a[c])?a[c]:{}}var c;if(b.isString(arguments[0]))c={},c[arguments[0]]=arguments[1];else{if(!b.isObject(arguments[0]))return;c=arguments[0]}for(var d=[],e=this.state,f=Object.keys(c),g=0,h=f.length;h>g;g++){var i,j=f[g],k=j.split("."),l=c[j],m=k.length;try{k.reduce(a,e),i=!0}catch(n){i=!1,t.log('Unable to set model data "'+j+'". Error: '+n)}i&&d.push(j)}var n=this.name+":statechange";return s.fire(n,{detail:d}),c},get:function(a){var b,c=this;if(a){var d=a.split(".");try{b=d.reduce(function(a,b){return a[b]},c.state)}catch(e){b="",t.log('Unable to get model data "'+a+'". Error: '+e)}return b}return this.state},process:function(a){t.controllers[this.name]&&t.controllers[this.name].doFilter(a)},controller:function(){return t.controllers[this.name]?t.controllers[this.name]:new m(this.name,this.context)}}),s.define({model:function(a,c){return t.models[a]?t.models[a]:(c=b.isObject(c)?c:{},new k(a,c))}}),l.prototype=new d,l.prototype.define({parse:function(){for(var a=document.querySelectorAll('[o-bind^="'+this.model.name+'."]'),d=document.querySelectorAll('[o-update*="'+this.model.name+'."]'),e=[],f=0,g=a.length;g>f;f++)e.push(a[f]);for(var h=0,i=d.length;i>h;h++)c.inArray(e,d[h])||e.push(d[h]);for(var j=0,k=e.length;k>j;j++){var l=e[j],m=l.getAttribute("o-bind"),n=l.getAttribute("o-update"),o={};if(n)if(n.length>0&&0!==n.indexOf("{"))o[n]="html";else try{o=b.invert(JSON.parse(l.getAttribute("o-update")))||{}}catch(p){octane.log(p),octane.error("JSON.parse() could not parse o-update string. ViewModel.parse() on element "+l)}if(!l._guid){l._guid=s.GUID(),l._bind=m,l._update=o;try{l._filters=JSON.parse(l.getAttribute("o-filters"))}catch(q){s.error(q)}}m&&(b.isArray(this.scope[m])||(this.scope[m]=[]),c.inArray(this.scope[m],l)||this.scope[m].push(l));for(var r,t=Object.keys(o),u=0,v=t.length;v>u;u++)r=t[u],b.isArray(this.scope[r])||(this.scope[r]=[]),c.inArray(this.scope[r],l)||this.scope[r].push(l)}},refresh:function(){function a(a,b,d){var e=new c.Switch({html:function(){a.innerHTML=d},text:function(){a.textContent=d},"default":function(){a.setAttribute(b,d)}});e.run(b)}for(var b,d=Object.keys(this.scope),e=0,f=d.length;f>e;e++){b=d[e];for(var g=0,h=this.scope[b].length;h>g;g++){var i,j,k=this.scope[b][g],l=k._bind?k._bind.split(".").slice(1).join("."):"",m=k._update,n=Object.keys(m);k.value=this.model.get(l);for(var o=0,p=n.length;p>o;o++)i=n[o],j=i.split(".").slice(1).join("."),a(k,m[i],this.model.get(j))}}},uptake:function(a){var b=a._bind,c=b?b.split(".").slice(1).join("."):"",d={};this.scope[b]&&a.value!=this.model.get(c)&&(d[c]=a.value,t.controllers[this.model.name]?t.controllers[this.model.name].doFilter(d):this.model.set(d))},handleEvent:function(a){this.watcher.run(a.type,[a])}}),m.prototype=new d,m.prototype.constructor=m,m.prototype.define({filter:function(a,b){return this.filters[a]=b,this},parser:function(a,c){var d=c.toString().split("{")[0],e=/\(([^)]+)\)/,f=e.exec(d)[1],g=f.split(","),h=this;return b.isFunction(c)&&b.isUndefined(this.parsers[a])&&(this.parsers[a]=2==g.length?function(a){return new Promise(function(b,d){var e={resolve:b,reject:d};c.bind(h)(a,e)})}:function(a){return c.bind(h,a)()}),this},hook:function(a,b){return this.hooks[a]=new c.Switch(b),this},task:function(a,d){function e(a){a=a.trim(),f.tasks.addCase(a,function(){var b=f.model.get(a);d.bind(f)(a,b)})}var f=this;if(b.isFunction(d)){"string"==c.typeOf(a)&&(a=a.split(","));for(var g=0,h=a.length;h>g;g++)e(a[g])}return this},fetch:function(a){return this.model.access(a)},doFilter:function(a){function c(a){a=b.isObject(a)?a:{};for(var c,f,g=Object.keys(a),h=0,i=g.length;i>h;h++)c=g[h],f=e.filters[c],a=e.filters[c]?d(f,c,a):a;return a}function d(a,b,c){var d=t.filters.run(a,[c[b]]);return c[b]=d.data,e.hooks[b]?e.hooks[b].run(d.status,[c]):c}var e=this;this.applyParsers(c(a))},applyParsers:function(a){var c,d=this;if(b.isObject(a))for(var e,f=Object.keys(a),g=0,h=f.length;h>g;g++)e=f[g],c=d.parsers[e]&&d.parsers[e](a),b.isObject(c)&&b.isFunction(c.then)?c.then(d.model.set):d.model.set(a)},handleEvent:function(a){function b(a){for(var b=0,c=a.length;c>b;b++)d(a[b])}function d(a){setTimeout(function(){e.tasks.run(a)},0)}var e=this,f=new c.Switch;f.addCase(e.model.name+":statechange",b),f.run(a.type,[a.detail])}}),s.define({controller:function(a){return t.controllers[a]?t.controllers[a]:new m(a,"Application")}}),t.bootlog=[],t.moduleExports={},o.prototype=new d,o.prototype.extend({constructor:o}),o.prototype.define({"import":function(a){return t.moduleExports[a]},"export":function(a){b.isObject(t.moduleExports[this.name])||(t.moduleExports[this.name]={});try{s.extend.apply(t.moduleExports[this.name],[a])}catch(c){s.error("Could not create extend exports, "+this.name+" module. "+c.message)}},model:function(a,c){return t.models[a]?t.models[a]:(c=b.isObject(c)?c:{},c.context=this.name+" module",new k(a,c))},controller:function(a){return t.controllers[a]?t.controllers[a]:new m(a,this.name+" module")},_checkDependencies:function(){function a(a){a=a?a.trim():"";var b=t.modules[a],d=[c.name+": no dependencies, preparing to initialize...",c.name+': Could not load module, missing module dependency "'+a+'"',c.name+': dependency "'+a+'" loaded and initialized, continuing...',c.name+': dependency "'+a+'" not yet loaded, loading now...'];return a&&0!==a.length?b&&b instanceof o?b&&b.loaded?(n(d[2]),Promise.resolve()):b.loaded?void 0:(n(d[3]),b._load().then(function(){return c._checkDependencies()}).catch(function(a){n(a),Promise.reject(a)})):(n(d[1]),Promise.reject(d[1])):(n(d[0]),Promise.resolve())}var b=this.dependencies||[],c=this,d=[],e=[this.name+": checking dependencies...",this.name+": no dependencies, preparing to initialize..."];if(n(e[0]),0===b.length)return n(e[1]),Promise.resolve();for(var f=0,g=b.length;g>f;f++)d.push(a(b[f]));return Promise.all(d)},_load:function(){var a=this;return this.loaded?void Promise.resolve(a):this._checkDependencies().then(function(){return a._initialize()}).catch(function(b){return n(b),a._abort()})},_abort:function(){return this.define({loaded:!1}),delete octane[this.name],Promise.reject(this.name+": failed to initialize!")},_initialize:function(){var a=this,b=[this.name+": initializing...",this.name+": successfully initialized!",this.name+": already initialized, continuing..."];return this.loaded||(n(b[0]),this.constructor.prototype=new o({name:this.name}),this.define({loaded:!0,name:this.name,exports:this.constructor.prototype.exports}).define(this.constructor.__construct(this.cfg)),Object.defineProperty(octane,a.name,{value:a,writatble:!1,configurable:!1}),n(b[1]),s.goose("application",{loadingProgress:Math.ceil(100/Object.keys(t.modules).length)}),s.fire("loaded:module",{detail:{moduleID:this.name}})),Promise.resolve(this)}}),s.define({module:function(a,b,c){return p(a,b,c)},hasModule:function(a){return t.modules[a]?t.modules[a].loaded:!1}}),s.define({goose:function(a,b){t.controllers[a]&&t.controllers[a].doFilter(b)},trip:function(a){var b=Math.random(),d=c.customEvent("input",{bubbles:!0,detail:b});a.dispatchEvent&&a.dispatchEvent(d)}}).define({appModel:new k("application"),$Controller:new m("application"),dom:{}}),s.define.call(s.dom,{container:function(){return document.getElementsByTagName("o-container")[0]||document.createElement("o-container")},canvas:function(){return document.getElementsByTagName("o-canvas")[0]||document.createElement("o-canvas")},views:function(){return document.getElementsByTagName("o-view")||[]},zIndexOverlay:999999999,zIndexMenu:99999998,zIndexView:99999997,zIndexHidden:-1}),s.controller("application").parser("loadingProgress",function(a){var b=this.model.get("loadingProgress")||0;a.loadingProgress=b+a.loadingProgress}),s.define({initialize:r}),window.octane=window.$o=new e}($,_,__),octane.addLibrary("startup-utilities",{fastlickJS:function(){"addEventListener"in document&&document.addEventListener("DOMContentLoaded",function(){FastClick.attach(document.body)},!1)},historyJS:function(){try{!function(a){History.Adapter.bind(a,"statechange",function(){History.getState()})}(window)}catch(a){}}}),octane.module("modal",["oView","viewLoadAnimations","viewExitAnimations"],function(){function a(a,b){if(!_.isString(a.id))return{instanced:!1};b=_.isObject(b)?b:{},this.configure(b),this.define({instanced:!0,id:a.id,elem:a,$elem:$(a),_guid:octane.GUID(),doneLoading:[]}),this.setPosition(this.loadsFrom);for(var c=this.elem.querySelectorAll('[o-dismiss="'+this.id+'"]'),d=0,e=c.length;e>d;d++)this.addDismissHandler(c[d]);this.adjustSize()}function b(b){var c=b.id,d=b.getAttribute("o-config");try{d=d?JSON.parse(d):null}catch(e){octane.error("invalid o-config attribute for o-modal "+c+". "+e.message),d=null}k[c]||(k[c]=new a(b,d))}function c(){for(var a=document.querySelectorAll("[o-modal]"),b=0,c=a.length;c>b;b++)d(a[b])}function d(a){octane.handle("click",a,function(){var b=a.getAttribute("o-modal");e(b)})}function e(b){var c=k[b];c&&c instanceof a&&(o||(octane.fire("block:routing"),n?n.id!==b?n.exit().then(c.load).then(function(){n=c,octane.fire("unblock:routing")}):octane.fire("unblock:routing"):c.load().then(function(){n=c,octane.fire("unblock:routing")})))}function f(b){var c=k[b];c&&c instanceof a&&(octane.fire("block:routing"),c.exit(),octane.fire("unblock:routing"),n=!1)}function g(){l.setAttribute("id","o-modal-bg"),document.body.appendChild(l),$modals=document.getElementsByTagName("o-modal");for(var a=0,d=$modals.length;d>a;a++)b($modals[a]);c(),octane.handle("routing:begin",function(){o=!0,f(n.id)}),octane.handle("routing:complete",function(){o=!1}),octane.handle("load resize orientationchange",function(){n&&n.adjustSize()})}{var h=octane.constructor,i=this.import("viewPrototype"),j=this.import("viewLoadAnimations"),k=(this.import("viewExitAnimations"),{}),l=document.createElement("div");document.createElement("div")}a.prototype=new h("Octane Modal"),a.prototype.define({constructor:a,configure:function(a){var b=["left","right","top","bottom","behind","invisible","onscreen"],c=_.isObject(a.loads),d=_.isObject(a.exits);this.define({loadsBy:c&&a.loads.by||"slide",loadsFrom:c&&__.inArray(b,a.loads.from)?a.loads.from:"bottom",loadEasing:c&&a.loads.ease||"swing",loadDuration:c&&_.isNumber(a.loads.dur)?a.loads.dur:500,exitsBy:d&&a.exits.by||"slide",exitsTo:d&&__.inArray(b,a.exits.to)?a.exits.to:"bottom",exitEasing:d&&a.exits.ease||"swing",exitDuration:d&&_.isNumber(a.exits.dur)?a.exits.dur:500})},setPosition:i.setPosition,addCallback:i.addCallback,doCallbacks:i.doCallbacks,load:function(){var a=this,b=m.checkCssFilterSupport();return this.adjustSize(),m.addLoading(),b?m.loadBG().then(m.getCanvas).then(m.removeLoading).then(m.hideApp).then(m.loadModal.bind(a)).then(a.doCallbacks.bind(a)):m.loadBG().then(m.removeLoading).then(m.loadModal.bind(a)).then(a.doCallbacks.bind(a))},exit:function(){var a=this;return i.exit.bind(a)().then(m.unloadBG).then(m.revealApp)},adjustSize:function(){var a=$(window),b=a.height(),c=a.width();this.$elem.css({"min-height":b,width:c,"min-width":c,"max-width":c})},addDismissHandler:function(a){var b=this;a.addEventListener("click",a),a.handleEvent=function(a){return a.stopPropagation,a.stopImmediatePropagation,f(b.id),!1}}});var m={checkCssFilterSupport:function(a){var b,c,d,e="filter:blur(2px)";return void 0===a&&(a=!0),b=document.createElement("div"),b.style.cssText=a?"-webkit-"+e:e,c=0!==b.style.length,d=void 0===document.documentMode||document.documentMode>9,c&&d},addLoading:function(){$(l).addClass("loading")},removeLoading:function(){$(l).removeClass("loading")},getCanvas:function(){return new Promise(function(a){html2canvas(octane.dom.container(),{onrendered:function(b){l.firstChild&&l.removeChild(l.firstChild),l.appendChild(b),a()}})})},loadModal:function(){var a=this;return new Promise(function(b){$("body").velocity("scroll",{duration:600}),a.$elem.css({visibility:"visible",display:"block","z-index":octane.dom.zIndexOverlay}),"fade"!==a.loadsBy&&a.$elem.css({opacity:1});try{j[a.loadsBy].bind(a,b)()}catch(c){octane.hasModule("debug")&&octane.log(c),j.slide.bind(a,b)()}})},loadBG:function(){return new Promise(function(a){$(l).addClass("o-modal-active").velocity("fadeIn",{display:"block",easing:"swing",duration:300,complete:function(){a()}})})},unloadBG:function(){$(l).removeClass("o-modal-active").velocity({opacity:0},{easing:"swing",duration:300,display:"none",complete:function(){l.firstChild&&l.removeChild(l.firstChild)}})},revealApp:function(){return $(octane.dom.container()).removeClass("hidden"),Promise.resolve()},hideApp:function(){return new Promise(function(a){$(octane.dom.container()).addClass("hidden"),a()})}},n=!1,o=!1;this.extend({call:e,dismiss:f,current:function(){return n},isBlocked:function(){return o}}),g()}),octane.module("router",["oView"],function(){function a(a){a=_.isObject(a)?a:{};var b=__.location().searchObject;octane.extend.call(b,a);for(var c,d=[],e=Object.keys(b),f=0,g=e.length;g>f;f++)c=e[f],d.push(c+"="+b[c]);d=d.join("&"),d="?"+d;var h=octane.translator&&octane.translator.getLang(),i=__.titleize(a.view)||__.titleize(l);History.pushState({lang:h},octane.name+" | "+i,d)}function b(a,b,c){_.isArray(p[a])||(p[a]=[]),_.isFunction(b)?b=b:(b=function(){return!0},octane.error("condition passed to .routeIf() for must be a function. View ID: "+a)),p[a].push({condition:b,onFail:c})}function c(a,b){return octane.view(a)&&octane.view(a).addCallback(b),octane}function d(a,b){return new Promise(function(c,d){b=_.isBoolean(b)?b:!1;var g=octane.view(a);if(g&&g!=l)if(m||n)__.inArray(o,a)||a===m||o.push(a);else{if(!f(a))return void d('Routing condition not fulfilled for route "'+a+'"');octane.fire("routing:begin"),m=a,l?l.exit().then(function(){return e(g,b)}).then(c).catch(octane.log):e(g,b).then(c).catch(octane.log)}else c()})}function e(b,c){return octane.fire("view:loading"),b.load().then(function(){octane.fire("view:loaded"),!c&&a({view:b.id}),l=b,octane.goose("application",{currentView:b.id}),m=null,o.length>0?d(o.pop()):octane.fire("routing:complete")})}function f(a){for(var b=p[a]||[],c=0,d=b.length;d>c;c++)if(!b[c].condition())return _.isFunction(b[c].onFail)&&b[c].onFail(),!1;return!0}function g(a){octane.view(a)&&octane.view(a).exit(),octane.goose("application",{currentView:""})}function h(){for(var a=document.querySelectorAll("[o-route]"),b=a.length;b--;)i(a[b])}function i(a){var b=a.getAttribute("o-route");a.addEventListener("click",function(){octane.route(b).then().catch(octane.log)})}function j(){var a=__.inArray(document.getElementsByTagName("html")[0].getAttribute("class").split(" "),"history");if(a)return __.location().searchObject.view||!1;var b,c=window.location.hash,d={};return function(){c=c.replace("#?",""),c=c.split("&");for(var a=0,e=c.length;e>a;a++)b=c[a].split("="),d[b[0]]=b[1]}(),d.view||!1}function k(){var a=__.inArray(document.getElementsByTagName("html")[0].getAttribute("class").split(" "),"history"),b=a?"popstate":"hashchange";h(),window.addEventListener(b,function(){var a=j();a&&octane.route(a).then(function(){}).catch(function(a){octane.log(a)})}),octane.handle("translated resize orientationchange",function(){l&&l.setCanvasHeight()})}var l,m=null,n=!1,o=[],p={};octane.handle("block:routing",function(){n=!0}),octane.handle("unblock:routing",function(){n=!1;var a=o.pop();o=[],d(a).catch(function(a){octane.log(a)})}),octane.define({parseView:j,route:function(a,b){return d(a,b).catch(function(a){octane.log(a)})},routeIf:b,routeThen:c,exit:g,pushState:a,currentView:function(){return l}}),octane.controller("application").parser("currentView",function(a){return a.currentViewTitle=__.titleize(a.currentView),a}),k()}),octane.module("translator",function(a){function b(a){_.isObject(a)&&(k.rosettaStone=a);for(var b=document.querySelectorAll("[o-lang]"),d=0,e=b.length;e>d;d++)c(b[d]);k.dropdown.pill.html(k.lang.display+" "),octane.fire("translated")}function c(a){var b=a.getAttribute("o-lang"),c=h(b);a.firstChild&&3==a.firstChild.nodeType?a.firstChild.data=c:a.insertBefore(document.createTextNode(c),a.firstChild)}function d(a,b){var c=k.dropdown;switch(!0){case _.isString(b):c.wrapper=$(b);break;case __.is$(b):c.wrapper=b}c.outerUL.appendTo(c.wrapper),c.outerLI.append(c.pill).append(c.innerUL).appendTo(c.outerUL),a=_.isArray(a)?a:[];var d,e,f,g=a.length;for(d=0;g>d;d++)e=j(a[d]),e&&(f=$("<li></li>"),f.addClass(c.classKey).attr("data-"+c.dataKey,e.key).html(e.display).appendTo(c.innerUL));i()}function e(){var a=__.location().searchObject;k.lang=j(a.lang)||k.defaultLang}function f(){return k.lang.key}function g(a){return j(a)?(k.lang=j(a),f()):void 0}function h(a){var b,c,d,e;return k.isPaginated?(b=_.isString(a)?a.split("-"):[],c=b[0],d=b[1],e=k.rosettaStone[c]&&k.rosettaStone[c][d]?k.rosettaStone[c][d]:null):e=k.rosettaStone[a]?k.rosettaStone[a]:null,e?e[k.lang.abbr]?e[k.lang.abbr]:e[k.defaultLang.abbr]:""}function i(){var a,c;$("li."+k.dropdown.classKey).on("click",function(){a=$(this),c=a.data(k.dropdown.dataKey),g(c),b(),k.dropdown.pill.trigger("click")}),k.dropdown.pill.on("click",function(){var a=$(this);a.hasClass("closed")?(a.removeClass("closed").addClass("open"),k.dropdown.innerUL.show()):a.hasClass("open")&&(a.removeClass("open").addClass("closed"),k.dropdown.innerUL.hide())})}function j(a){var b,c,d=k.languages.length;for(b=0;d>b;b++)if(c=k.languages[b],c.regexp&&c.regexp.test&&c.regexp.test(a))return c;return!1}var k={};a=a||{},k.rosettaStone=_.isObject(a.langData)?a.langData:{},k.isPaginated=_.isBoolean(a.paginated)?a.paginated:!1,k.langSupport=_.isArray(a.langSupport)?a.langSupport:["English"],k.dropdown={wrapper:$("o-control#translator"),outerUL:$('<ul class="nav nav-pills"></ul>'),outerLI:$('<li class="dropdown"></li>'),pill:$('<a id="selected-language" class="dropdown-toggle closed" data-toggle="dropdown"></a>'),caret:$('<span class="caret"></span>'),innerUL:$('<ul class="dropdown-menu" role="menu"></ul>'),classKey:"language-selector",dataKey:"language-selected"},k.languages=[{key:"English",display:"English",abbr:"en",regexp:/^_?(english|eng|en)$/i},{key:"Russian",display:"Русский",abbr:"ru",regexp:/^_?(russian|rus|ru|Русский)$/i},{key:"Spanish",display:"Español",abbr:"es",regexp:/^_?(spanish|espanol|esp|es|español)$/i},{key:"French",display:"Françias",abbr:"fr",regexp:/^_?(french|francias|françias|fra|fr)$/i},{key:"German",display:"Deutsch",abbr:"de",regexp:/^_?(german|deutsch|ger|de)$/i},{key:"Chinese",display:"简体中文",abbr:"zh",regexp:/^_?(chinese|zh|简体中文)$/i},{key:"Portugese",display:"Portugese",abbr:"pt",regexp:/^_?(portugese|port|pt)$/i},{key:"Japanese",display:"日本語",abbr:"ja",regexp:/^_?(japanese|jap|ja|日本語|nihongo)$/i}],k.defaultLang=j(a.defaultLang)||k.languages[0],this.define({renderTranslator:function(a,b){return d(a,b)
},translate:function(a){return b(a)},translateElement:function(a){c(a)},getLang:function(){return f()},setLang:function(a){return g(a)}}),octane.handle("view:routed",b),e(),d(k.langSupport),b()}),octane.module("viewPrototype",["viewLoadAnimations","viewExitAnimations"],function(){var a=this.import("viewLoadAnimations"),b=this.import("viewExitAnimations");this.export({configure:function(a){var b=["left","right","top","bottom","behind","invisible","onscreen"],c=_.isObject(a.loads),d=_.isObject(a.exits);this.define({loadsBy:c&&a.loads.by||"slide",loadsFrom:c&&__.inArray(b,a.loads.from)?a.loads.from:"left",loadEasing:c&&a.loads.ease||"swing",loadDuration:c&&_.isNumber(a.loads.dur)?a.loads.dur:500,exitsBy:d&&a.exits.by||"slide",exitsTo:d&&__.inArray(b,a.exits.to)?a.exits.to:"right",exitEasing:d&&a.exits.ease||"swing",exitDuration:d&&_.isNumber(a.exits.dur)?a.exits.dur:500})},handleEvent:function(a){switch(a.type){case"translated":this.setCanvasHeight();break;case"resize":this.setCanvasHeight();break;case"orientationchange":this.setCanvasHeight()}},load:function(){var b=this;return new Promise(function(c){$("body").velocity("scroll",{duration:350}),b.$elem.css({visibility:"visible",display:"block","z-index":octane.dom.zIndexView}),"fade"!==b.loadsBy&&b.$elem.css({opacity:1}),b.setCanvasHeight(b.cachedHeight);try{a[b.loadsBy].bind(b,c)()}catch(d){octane.hasModule("debug")&&octane.log(d),a.slide.bind(b,c)()}}).then(function(){b.doCallbacks()})},exit:function(){var a=this;return new Promise(function(c){try{b[a.exitsBy].bind(a,c)()}catch(d){octane.hasModule("debug")&&octane.log(d),b.fade.bind(a,c)}}).then(function(){a.$elem.css({"z-index":octane.dom.zIndexHidden,visibility:"hidden",display:"none",opacity:0}),a.setPosition(a.loadsFrom)})},setCanvasHeight:function(a){var b=[];this.$elem.children().each(function(){b.push($(this).height())});var c=_.reduce(b,function(a,b){return a+b});a=a||c,this.cachedHeight=a,document.querySelector("o-canvas").setAttribute("style","height:"+a+"px")},setPosition:function(a){var b=this;return new Promise(function(c){var d=b.$elem,e=new __.Switch({left:function(){d.css({left:-(1.1*$(window).width()),top:0})},right:function(){d.css({right:-(1.1*$(window).width()),top:0})},top:function(){d.css({top:-(1.1*$(window).height()),left:0,right:0})},bottom:function(){d.css({top:1.1*$(window).height(),bottom:-(1.1*$(window).height()),left:0,right:0})},onscreen:function(){d.css({left:0,right:0,top:0})},"default":function(){d.css({left:-(1.1*$(window).width()),top:0})}});e.run(a),c()})},addCallback:function(a){try{this.doneLoading.push(a)}catch(b){octane.error("cannot push callback, "+b.message)}},doCallbacks:function(){for(var a=this,b=this.doneLoading,c=0,d=b.length;d>c;c++)_.isFunction(b[c])&&b[c].bind(a)()}})}),octane.module("oView",["viewPrototype"],function(){function a(a,b){return _.isString(a.id)?(b=_.isObject(b)?b:{},this.configure(b),this.define({instanced:!0,id:a.id,elem:a,$elem:$(a),_guid:octane.GUID(),doneLoading:[]}),void this.setPosition(this.loadsFrom)):{instanced:!1}}function b(){for(var b,c=octane.dom.views(),e=0,f=c.length;f>e;e++)b=c[e].id,config=JSON.parse(c[e].getAttribute("o-config")),!d[b]&&(d[b]=new a(c[e],config));octane.define({view:function(a){return d[a]||!1}})}var c=octane.constructor,d={},e=this.import("viewPrototype");a.prototype=new c("octane View"),a.prototype.define({constructor:a}),a.prototype.extend(e),b()}),octane.module("viewExitAnimations",function(){this.export({removeLoading:function(){},slide:function(a){var b=this,c=b.$elem,d={duration:b.exitDuration,easing:b.exitEasing,complete:a},e=new __.Switch({left:function(){c.velocity({left:-(1.1*$(window).width()),right:2.2*$(window).width()},d)},right:function(){c.velocity({right:-(1.1*$(window).width()),left:2.2*$(window).width()},d)},top:function(){c.velocity({top:-(1.1*$(window).height()),bottom:2.2*$(window).height()},d)},bottom:function(){c.velocity({bottom:-(1.1*$(window).height()),top:2.2*$(window).height()},d)}});e.run(b.exitsTo)},fade:function(a){var b=this,c=b.$elem;c.velocity("fadeOut",{display:"none",easing:b.exitEasing,duration:b.exitDuration,complete:a})}})}),octane.module("viewLoadAnimations",function(){this.export({applyLoading:function(){},slide:function(a){var b=this,c=b.$elem,d={duration:b.loadDuration,easing:b.loadEasing,complete:a},e=new __.Switch({left:function(){c.velocity({left:0,right:0},d)},right:function(){c.velocity({left:0,right:0},d)},top:function(){c.velocity({top:"0%"},d)},bottom:function(){c.velocity({top:0,bottom:0},d)}});e.run(b.loadsFrom)},fade:function(a){var b=this,c=b.$elem;b.setPosition("onscreen").then(function(){c.velocity("fadeIn",{display:"block",easing:b.loadEasing,duration:b.loadDuration,complete:a})})}})});