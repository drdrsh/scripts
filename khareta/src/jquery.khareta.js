/* 	jQuery Khareta Plugin 1.0.0 By Mostafa Abdelraouf (@droushi)
*	https://github.com/drdrsh/scripts/tree/master/Khareta
*
*  	Copyright (c) 2014 Mostafa Abdelraouf
*	This plugin is released under MIT license
*   http://www.opensource.org/licenses/mit-license.php
*/
;(function ( $, window, document, undefined ) {

		var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=Base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e;var f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}}

		// Create the defaults once
		var pluginName = "khareta",
			defaults = {
				strFullscreen	: "Full screen",
				strPoints		: "Points",
				strPolyline		: "Polyline",
				strPolygon		: "Polygon",

				mapTypeId		: google.maps.MapTypeId.TERRAIN,

				strokeColor		: '#FF0000',
				fillColor		: '#5555FF',
				strokeOpacity	: 1.0,
				fillOpacity		: 1.0,
				strokeWeight	: 3,

				initialZoom		: 4,
				initialCenter	: new google.maps.LatLng(33.358062, 9.755859),
				initialMode		: 'polygon',

				maxCount		: 0,
				codec			: 'json'
			};

		function Plugin ( element, options ) {
				this.element = element;

				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		$.extend(Plugin.prototype, {

			VERSION		: '1.0.0',
	
			mDomInput	: null,
			mDomParent	: null,
			mMapObject 	: null,
			mDomMap		: null,
			mDomFscrBtn : null,
			mDomMode	: null,
			mMarkers	: [],
			mPath		: null,
			mMode		: '',
			
			mMapElement : null,

			mIsReady	: false,
			mIsFullscreen: false,
			
			init: function () {
				
				var that = this;
				
				if(this.mIsReady){
					return;
				}
				
				this.mDomInput = $(this.element);
				this.mDomInput.hide();
				
				this.mDomMap =
					$('<div />')
					.addClass(pluginName + '-inline-map map-' + this.mDomInput.attr('id'))
					.attr('id', this.generateRandomId());
				
				this.mDomInput.after(this.mDomMap);

				this.mMapObject =
					new google.maps.Map(
						document.getElementById(this.mDomMap.attr('id')),{	
							zoom				: this.settings.initialZoom,
							center	 			: this.settings.initialCenter,
							mapTypeId			: this.settings.mapTypeId,
							mapTypeControl		: false,
							scaleControl 		: false,
							rotateControl 		: false,
							panControl 			: false,
							streetViewControl	: false,
							overviewMapControl 	: false,
							zoomControl			: true,
							zoomControlOptions: {
								style: google.maps.ZoomControlStyle.LARGE
							}
						}
					);

				this.mPath = new google.maps.MVCArray;
				
				this.mDomFscrBtn = document.createElement('div');
				$(this.mDomFscrBtn)
					.addClass(pluginName + '-btn-fullscreen')
					.html(this.settings.strFullscreen)
					.click(function(){
						that.toggleFullscreen.call(that, !that.mIsFullscreen);
					});
				this.mDomFscrBtn.index = 1;

				var cnt = document.createElement('div');
				
				this.mDomMode = 
					$("<select />")
					.addClass(pluginName)
					.append(
						$("<option />")
						.attr('value', 'point')
						.html(this.settings.strPoints)
					)
					.append(
						$("<option />")
						.attr('value', 'polyline')
						.html(this.settings.strPolyline)
					)
					.append(
						$("<option />")
						.attr('value', 'polygon')
						.html(this.settings.strPolygon)
					)
					.on('change.' + pluginName, function(){
						that.onModeSelectChanged.apply(that);
					});
				$(cnt).append(this.mDomMode);
				
				this.mMapObject.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.mDomFscrBtn);
				this.mMapObject.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(cnt);

				google.maps.event.addListener(this.mMapObject, 'click', function(event){
					that.onMapClicked.call(that, event); 
				})
	
				this.readInputElement();
				
				this.turnOnListeners();
								
				var	pnts = this.mPath.getArray();
				if(pnts.length > 0){
					bounds = new google.maps.LatLngBounds();
					for(idx in pnts){
						bounds.extend(pnts[idx]);
					}	
					this.mMapObject.fitBounds(bounds);
				}

			},

			getIndexWithinPath : function (latlng){
				for(var i=0;i<this.mPath.getLength();i++){
					var v = this.mPath.getAt(i);
					if(v.lat() == latlng.lat() && v.lng() == latlng.lng()){
						return i;
					}
				}
				return -1;
			},
			
			getData : function(){
				var coords = [];
				var tmp = this.mPath.getArray();
				for(idx in tmp){
					coords.push(  [ tmp[idx].lat(),  tmp[idx].lng() ]  );
				}
				return {
					'mode'	: this.mMode,
					'points': coords
				}
			},

			serialize : function (){
				return this.encode(this.getData());
			},
			
			unserialize : function (input){
			
				this.turnOffListeners();
				var data = {};
				try{
					data = this.decode(input);
				} catch(e){
					this.turnOnListeners();
					return false;
				}
				this.clear();

				this.setMode(data.mode);
				for(idx in data.points){
					this.addPoint(new google.maps.LatLng(data.points[idx][0], data.points[idx][1]), -1)
				}
				this.turnOnListeners();
				return true;
			},
			
			turnOffListeners : function(){
				this.mDomInput.off('change.' + pluginName);
			},
			
			turnOnListeners : function(){

				var that = this;
				this.mDomInput
				.on('change.' + pluginName, function(){
					that.readInputElement();
				});

			},

			readInputElement: function (){
				if(!this.unserialize(this.mDomInput.val())){
					this.setMode(this.settings.initialMode);
				}
			},
			
			writeInputElement : function (){
				this.mDomInput.val(this.serialize());
			},

			toggleFullscreen : function (enabled){
				var that = this;
				if(enabled){
					$('body').addClass(pluginName + '-body-no-scroll')
					this.mDomMap.addClass('fullscreen');
					$(document).on('keyup.' + pluginName, function(e) {
						if (e.keyCode == 27){
							that.toggleFullscreen(false);
						}
					});
				} else {
					$('body').removeClass(pluginName + '-body-no-scroll')
					this.mDomMap.removeClass('fullscreen');
					$(document).off('keyup.' + pluginName);
				}
				this.mIsFullscreen = enabled;
				google.maps.event.trigger(this.mMapObject, "resize");
			},

			clear : function (){
				if(this.mMapElement){
					this.mMapElement.setMap(null);
					this.mMapElement = null;
				}
				this.mPath.clear();
				for(var i=0;i<this.mMarkers.length;i++){
					this.mMarkers[i].setMap(null);
				};
				this.mMarkers = [];
			},

			generateRandomId : function(){
				function s4(){return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);}
				return (s4() + s4() + s4() + s4());
			},

			encode : function(data){
				var codec = this.settings.codec.toLowerCase();
				
				switch(codec){						
					case 'base64' : return Base64.encode(JSON.stringify(data));

					default:
					case 'json': return JSON.stringify(data);
				}
			},
			
			decode : function(data){
				var codec = this.settings.codec.toLowerCase();
				
				switch(codec){						
					case 'base64' : return JSON.parse(Base64.decode(data));

					default:
					case 'json': return JSON.parse(data);
				}				
			},
			
			addPoint : function (point, index){
				var that = this;
				if(this.mMode == ''){
					return;
				}
				
				if(this.settings.maxCount != 0 && this.settings.maxCount <= this.mPath.getLength()){
					return;
				}
				
				if(index == -1){
					this.mPath.push(point);
				} else {
					this.mPath.insertAt(index, point);
				}
				var marker = 
					new google.maps.Marker({
						position 	: point,
						map		 	: this.mMapObject,
						title		: '#' + this.mPath.length,
						draggable	: true
					});
				
				google.maps.event.addListener(marker, 'click', function(event){
					that.onMarkerClicked.call(that, event, this);
				})

				google.maps.event.addListener(marker, 'dragstart', function(event){
					that.onMarkerDragStart.call(that, event, this);
				})

				google.maps.event.addListener(marker, 'dragend', function(event){
					that.onMarkerDragEnd.call(that, event, this);
				})

				this.mMarkers.push(marker);

				this.writeInputElement();
				
			},

			onMarkerClicked : function (event, marker){
				marker.setMap(null);
				for (var i = 0, I = this.mMarkers.length; i < I && this.mMarkers[i] != marker; ++i);
				this.mPath.removeAt(this.getIndexWithinPath(marker.position));
				this.mMarkers.splice(i, 1);
				this.writeInputElement();
			},

			onMarkerDragStart : function (event, marker){
				marker.originalLatLng = event.latLng;
			},

			onMarkerDragEnd : function (event, marker){
				if(marker.originalLatLng == null)return;
				this.mPath.setAt(
					this.getIndexWithinPath(marker.originalLatLng), 
					event.latLng
				);
				marker.originalLatLng = null;
				this.writeInputElement();
			},

			onMapClicked : function (event){
				var pnt = event.latLng;
				
				var leastDistance = 99999;
				var idx = -1;
				if(this.mMode == 'polygon'){
					for(var i=0;i<this.mPath.getLength();i++){
						var distance = parseInt(this.getDistanceBetweenPoints(pnt, this.mPath.getAt(i)), 10);
						if(leastDistance > distance){
							idx = i;
							leastDistance = distance;
						}
					};
				}
				this.addPoint(pnt, idx);
			},
			
			getDistanceBetweenPoints : function (point_1, point_2){
				rad = function(x) {return x*Math.PI/180;};
				distHaversine = function(p1, p2) {
					var R = 6371; // earth's mean radius in km
					var dLat  = rad(p2.lat() - p1.lat());
					var dLong = rad(p2.lng() - p1.lng());
					var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
							Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
					var d = R * c;
					return d.toFixed(3);
				};
				return distHaversine(point_1, point_2);
			},

			
			onModeSelectChanged : function(){
				
				var mode = this.mDomMode.val();

				if(this.mMapElement){
					this.mMapElement.setMap(null);
					this.mMapElement = null;
				}
				
				switch(mode){
					case 'point':
						this.mMode = mode;
					break;

					case 'polyline':
						this.mMode = mode;
						this.mMapElement = new google.maps.Polyline({
							path: this.mPath,
							strokeColor: this.settings.strokeColor,
							strokeOpacity: this.settings.strokeOpacity,
							strokeWeight: this.settings.strokeWeight
						});
						this.mMapElement.setMap(this.mMapObject);
					break;
					
					case 'polygon':
						this.mMode = mode;
						this.mMapElement = new google.maps.Polygon({
							strokeWeight: this.settings.strokeWeight,
							strokeColor: this.settings.strokeColor,
							strokeOpacity: this.settings.strokeOpacity,
							fillColor: this.settings.fillColor,
							fillOpacity: this.settings.fillOpacity
						});
						this.mMapElement.setMap(this.mMapObject);
						this.mMapElement.setPaths(new google.maps.MVCArray([this.mPath]));
					break;
				}
				
				this.writeInputElement();

			},

			setMode : function (mode){
				var mode = ("" + mode).toLowerCase();
				
				switch(mode){
					case 'point':
					case 'polyline':
					case 'polygon':
					break;
					default:
						mode = 'point';
				}

				this.mDomMode.val(mode);
				this.mDomMode.change();
				
			}
	
		});
	
		var publicMethods = {
		
			toggleFullscreen : function(enabled){
				this.toggleFullscreen(enabled);
			},
			
			setMode : function(mode){
				this.setMode(mode);
			},
			
			getData : function(){
				return this.getData();
			}
		}

		$.fn[ pluginName ] = function ( methodOrOptions ) {
			var args = arguments;
			if ( typeof publicMethods[methodOrOptions] == 'function' ) {
				var firstElement = this.get(0);
				var p = $.data( firstElement, "plugin_" + pluginName);
				return publicMethods[ methodOrOptions ].apply(p, Array.prototype.slice.call( args, 1 ));
			} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
				this.each(function() {
					if(this.tagName != 'TEXTAREA'){
						$.error(pluginName + ' only works with textareas!');
						return;
					}
					if ( !$.data( this, "plugin_" + pluginName ) ) {
						$.data( this, "plugin_" + pluginName, new Plugin( this, methodOrOptions ) );
					}
				});
			} else {
				$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.' + pluginName );
			}    

	
			return this;
		};

})( jQuery, window, document );