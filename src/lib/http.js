/*
* Copyright 2015 Ethan Ferrari, OneFire Media Inc.
*
*	Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/


	var _       = require("lodash");
	var Promise = require("bluebird");


	function uriEncodeObject(source){

		_.isObject(source) || (source = {});

		var keys = Object.keys(source);
		var n = keys.length;
		var arr = [];

		while(n--) {
		arr.push(encodeURIComponent(keys[n]) + "=" + encodeURIComponent(source[keys[n]]));
		}
		return array.join("&");
	}




	function http(url,method,data,headers){
		return new Promise(function(resolve,reject){

			var encoded = uriEncodeObject(data);
			var _headers = {
				'Content-Type':'application/x-www-form-urlencoded'
			};
			var request = new (window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");

			_.extend(_headers,headers);

			request.onreadystatechange = function(){
				var response;
				if(this.readyState === 4){
					switch(this.status){
						case 200 :
							try {
								response = JSON.parse(request.responseText);
							} catch(ex){
								response = this.responseText;
							}
							resolve(response);
							break;
						case 404 :
							reject('The server responded with 400 not found');
							break;
						case 500 :
							reject('An internal server error occurred');
							break;
					}
				}
			};

			request.open(method,url,true);

			_.each(_headers,function(val,header){
				request.setRequestHeader(header,val);
			});

			request.send(encoded);
		});
	}




	function Http(url,headers){
		this.url = url;
		this.headers = _.isObject(headers) ? headers : {};
	}



	Http.prototype = {

		get: function(){
			return http(this.url,'GET',null,this.headers);
		},
		post: function(data){
			return http(this.url,'POST',data,this.headers);
		},
		put: function(data){
			return http(this.url,'PUT',data,this.headers);
		},
		delete: function(){
			return http(this.url,'DELETE',null,this.headers);
		}
	};

	module.exports = Http;
