//浏览器检测
(function(){
	window.sys={};
	var ua=navigator.userAgent.toLowerCase();
	var s;
	(s=ua.match(/msie ([\d.]+)/))?sys.ie=s[1]:
	(s=ua.match(/firefox\/([\d.]+)/))?sys.firefox=s[1]:
	(s=ua.match(/chrome\/([\d.]+)/))?sys.chrome=s[1]:
	(s=ua.match(/oprea\/.*version\/([\d.]+)/))?sys.oprea=s[1]:
	(s=ua.match(/version\/([\d.]+).*safari/))?sys.safari=s[1]:0;	
	if(/webkit/.test(ua))sys.webkit=ua.match(/webkit\/([\d.]+)/)[1];
})()
//跨浏览器DOM加载
function addDomLoaded(fn){
	var isReady=false;
	var timer=null;
	function doReady(){
		if(timer)clearInterval(timer);
		if(isReady)return ;
		isReady=true;
		fn();	
	}	
	if((sys.oprea&&sys.oprea<9)||(sys.firefox&&sys.firefox<3)||(sys.webkit&&sys.webkit<525)){
		timer=setInterval(function(){
			if(document&&document.getElementById&&document.getElementsByTagName&&document.body){
				doReady();	
			}	
		},1)	
	}else if(document.addEventListener){
		addEvent(document,'DOMContentLoaded',function(){
			fn();
			removeEvent(document,'DOMContentLoaded',arguments.callee);
		})	
	}else if(sys.ie && sys.ie<10){
		timer=setInterval(function(){
			try{
				document.documentElement.doScroll('left');
				doReady();
			}catch(e){
				alert('ie未识别')	
			}
			
		},1)	
	}
}


function addEvent(obj,type,fn){		//绑定事件
	
	if(obj.attachEvent){
		obj.attachEvent('on'+type,function(){
			if(false==fn.call(obj)){
				event.cancelBubble=true;	//阻止默认行为
				return false;	//阻止冒泡
			};	
		});
	}else{
		obj.addEventListener(type,function(ev){
			if(false==fn.call(obj)){
				ev.cancelBubble=true;
				ev.preventDefault();//阻止冒泡
			}	
		},false);	//w3c
	}
}

//解除事件绑定
function removeEvent(obj,type,fn){
	if(obj.removeEventListener){
		obj.removeEventListenenr(type,fn,false);	
	}else{
		for(var i in obj.events[type]){
			if(obj.events[type][i]==fn){
				delete obj.events[type][i];
			}	
		}	
	}
}

function getByClass(oParent, sClass)	//class选择器
{
 var aEle=oParent.getElementsByTagName('*');
 var aResult=[];
 var re=new RegExp('\\b'+sClass+'\\b', 'i');
 var i=0;
 
 for(i=0;i<aEle.length;i++)
 {
  //if(aEle[i].className==sClass)
  //if(aEle[i].className.search(sClass)!=-1)
  if(re.test(aEle[i].className))
  {
   aResult.push(aEle[i]);
  }
 }
 
 return aResult;
}

function getStyle(obj,attr){	//获取非行间样式
	if(obj.currentStyle){
		return obj.currentStyle[attr];	
	}else{
		
		return window.getComputedStyle(obj,false)[attr];
	}
	
}

function ZQuery(vArg){	//选择器
	this.elements=[];
	
	switch(typeof vArg){
		
		case 'function':
			addEvent(window,'load',vArg);
		break;	
		case 'string':
			switch(vArg.charAt(0)){
				case '#':		//id
					var obj=document.getElementById(vArg.substring(1));
					this.elements.push(obj);
				break;
				case '.':		//class
					this.elements=getByClass(document,vArg.substring(1));
				break;
				default:		//tagName
					this.elements=document.getElementsByTagName(vArg);
				
			}
		break;
		case 'object': 
		this.elements.push(vArg);
			break;
	}	
}

ZQuery.prototype.click=function(fn){	//点击事件
	var i=0;
	for (i=0; i<this.elements.length;i++){
		
		addEvent(this.elements[i],'click',fn);	
	}
	return this;
	
}
ZQuery.prototype.hover=function(fnOver,fnOut){	//鼠标移入移除
	var i=0;
	for (i=0; i<this.elements.length;i++){
		
		addEvent(this.elements[i],'mouseover',fnOver);	
		addEvent(this.elements[i],'mouseout',fnOut);	
	}
	return this;
		
}

ZQuery.prototype.css=function(attr,value){	//获取或者设置css样式
	if(arguments.length==2){	//设置
		var i=0;
		for (i=0; i<this.elements.length;i++){
		
			this.elements[i].style[attr]=value;
		}
			
	}else{	//获取
		if(typeof attr=='string'){
			return getStyle(this.elements[0],attr);
		}else{	//设置
			
			for(i=0;i<this.elements.length;i++){
				var k='';
				for(k in attr){
					this.elements[i].style[k]=attr[k];	
				}	
			}
		}
	}
	return this;
		
}
ZQuery.prototype.hide=function(){	//隐藏
	
	var i=0;
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.display='none';	
	}	
	return this;
}
ZQuery.prototype.show=function(){	//显示
	
	var i=0;
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.display='block';	
	}	
	return this;
}
ZQuery.prototype.toggle=function(){	//计数（切换器）
	var i=0;
	var _arguments=arguments;
	for(i=0;i<this.elements.length;i++){
			addToggle(this.elements[i]);
	}	
	function addToggle(obj){
			var count=0;
			addEvent(obj,'click',function(){
				_arguments[count++%_arguments.length].call(obj)	
			})
	}
	return this;
}
ZQuery.prototype.attr=function(attr,value){	//修改属性
	if(arguments.length==2){	//设置
		var i=0;
		for (i=0; i<this.elements.length;i++){
		
			this.elements[i][attr]=value;
		}
			
	}else{	//获取
	
		return this.elements[0][attr];	
	}
	return this;
	
}
//获取设置标签内容
ZQuery.prototype.html=function(str){
	var i=0;
	for(i=0;i<this.elements.length;i++){
		if(arguments==0){
			return this.elements[i].innerHTML;	
		}else {
			this.elements[i].innerHTML=str;
		}	
	}
	return this;
}
//获取设置text文本内容
ZQuery.prototype.text=function(str){
	var i=0;
	for(i=0;i<this.elements.length;i++){
		if(arguments==0){
		
			return getText(this.elements[i]);	
		}else {
			setText(this.elements[i],str);
		}	
	}
	return this;
}


ZQuery.prototype.eq=function(n){ //选择元素
	
	return $(this.elements[n]);
}

function addArry(arr1,arr2){
	var i=0;
	for(i=0; i<arr2.length;i++){
		
		arr1.push(arr2[i]);	
	}	
}
ZQuery.prototype.find=function(str){ //查找元素
		var result=[];
		var i=0;
		for(i=0;i<this.elements.length;i++){
			switch(str.charAt(0)){
				case '.':
					var Ele=getByClass(this.elements[i],str.substring(1));
					result=result.concat(Ele);
					break;
				default:
					var Ele=this.elements[i].getElementsByTagName(str);
					//result=result.concat(Ele);
					addArry(result,Ele);
			}	
		}
		var newZquery=$();
		newZquery.elements=result;
		return newZquery;
}

function getIndex(obj){
		var _children=obj.parentNode.children;
		var i=0;
		for(i=0;i<_children.length;i++){
			if(_children[i]==obj){
				return i;
			}	
		}
}
ZQuery.prototype.index=function(){	//查找元素所在序号
		
		return getIndex(this.elements[0]);
	
}
ZQuery.prototype.bind=function(sEv,fn){	//阻止默认行为
		var i=0;
		for(i=0;i<this.elements.length;i++){
			addEvent(this.elements[i],sEv,fn);	
		}
		return this;
}
ZQuery.prototype.resize=function(fn){ //浏览器窗口大小改变事件
	var i=0;
	for(i=0;i<this.elements.length;i++){
		window.onresize=function(){
			fn();
		};
	}
	return this;
}
ZQuery.prototype.center=function(width,height){	//元素居中
	var L=document.documentElement.clientWidth||document.body.clientWidth;
	var T=document.documentElement.clientHeight||document.body.clientHeight;
	var i=0;
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.left=(L-width)/2+'px';
		this.elements[i].style.top=(T-height)/2+'px';
	}
	return this;	
}
ZQuery.prototype.lock=function(){
	var i=0;
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.display='block';
		this.elements[i].style.width=document.documentElement.clientWidth+'px';
		this.elements[i].style.height=document.documentElement.scrollHeight+'px';
	}	
	return this;
}

//删除首尾空格
function trim(str){
		return str.replace(/(^\s*)(\s*$)/g)
}
//跨浏览器获取text
function getText(element){
	return (typeof element.textContent=='string')?element.textContent:element.innerText;	
}
//跨浏览器设置text
function setText(element,text){
	if(typeof element.textContent=='string'){
		element.textContext=text;	
	}else{
		element.innerText=text;	
	}
}


ZQuery.prototype.extend=function(name,fn){	//插件接口
		ZQuery.prototype[name]=fn;
}



function $(vArg){
	
	return new ZQuery(vArg);
}


















