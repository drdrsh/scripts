**Khareta** (خريطة) means "Map" in Arabic, It is a jQuery plugin that transforms your average textarea into a Google Maps Input component.

Features
---

* Allows the user to draw point/lines/polygons on the map
* The component can "pop-out" to give the user more space to plot his points without disrupting the layout of your form.
* Built around an input element so that any changes to the data in the textarea are reflected to the map and vice-versa. This feature can come in handy for forms that are submitted to the server as these forms can be submitted out of the box without additional javascript code to serialize the map data.

You can see [the plugin in action here](http://alfehrest.org/sub/khareta/index.html)


Usage
---


This plugin depends on Google Maps V3, It assumes that the necessary google maps dependencies are loaded so you will need to load it yourself by doing something like this
```html
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=[YourAPIKey]"></script>	
```

it also depends on jQuery so you'll need to load that as well

Then include the Javascipt and CSS of the plugin
```html
	<script src="jquery.khareta.js"></script>
	<link href="jquery.khareta.css" media="all" rel="stylesheet" type="text/css" />
```
To attach the plugin to a textarea do this
```javascript
$('#textarea_1').khareta({/*options*/});
```

# Plugin Options
---

**strFullscreen** _(string)_ String for (Full Screen). __default__: "Full Screen"

**strPoints** _(string)_  String for (Points). __default__: "Points"

**strPolyline** _(string)_ String for (Polyline). __default__: "Polyline"

**strPolygon** _(string)_ String for (Polygon). __default__: "Polygon"

**mapTypeId** _(string)_ Google Maps [MapType](https://developers.google.com/maps/documentation/javascript/maptypes) . __default__: "google.maps.MapTypeId.TERRAIN"

**strokeColor** _(string)_ Stroke Color value for lines/strokes. __default__: #FF0000

**strokeOpacity** _(float)_ Stroke opacity (0.0 to 1.0). __default__: 1.0

**strokeWeight** _(integer)_ stroke width. __default__: 3

**fillColor** _(string)_ Fill color for polygons. __default__: #5555FF

**fillOpacity** _(float)_ Fill opacity for polygons. __default__: 1.0

**initialZoom** _(integer)_ initial zoom level for the map. __default__: 4

**initialCenter** [_(LatLng)_](https://developers.google.com/maps/documentation/javascript/reference#LatLng) The center of the map. __default__: new google.maps.LatLng(33.358062, 9.755859)

**initialMode** _(string)_ Startup plotting mode , 3 modes are supported which are ('point', 'polyline', 'polygon'). __default__: polygon

**maxCount** _(integer)_ maximum number of points allowed, 0 for no limit. __default__: 0

**codec** _(string)_ The format in which the data are serialized and stored in the textarea , currently supported are:
* **json: **   json text.
* **base64: ** json text that is base64 encoded.

__default__: json

# Plugin Methods
---

### toggleFullscreen(isEnabled)
Enables/Disables fullscreen mode.
	
#### Example
```javascript
	$('#textarea_1').khareta('toggleFullscreen', false);
```

### setMode
Sets the plotting mode for the map, supported modes are 'point', 'polyline', 'polygon'.
#### Example
```javascript
	$('#textarea_1').khareta('setMode', 'polygon');
```

### getData
Retrieves the internal data structure representing the current state of the map.

The data structures looks like this
```json
	{
		mode : 'point',
		points : [ [13.000, 14.000], [12.0000, 4.0000], ...]
	}
```
#### Example
```javascript
	var componentData = $('#textarea_1').khareta('getData');
```			



End user Guide
----

Pick a mode from the lower left corner of the map and click the map to add points, to remove points just click the markers again, to move existing points drag the point's marker around. 

To allow yourself more freedom click the **"Full Screen"** button on the upper right corner of the screen to go in Fullscreen mode that will allow you more space to place your points. to go back to the normal mode click the **"Full Screen"** button again.

Why a Textarea?
----

Well, This a kind of hack that I picked up during a project somewhere and it stuck with me
* It automatically benefits out-of-the-box from any browser feature that maintains the user input across navigation "e.g. back/forward". 
* Reading from and writing to the internal state of the component is as simple as accessing textarea value. No need to call plugin specific methods.
* Submitting data to the server requires no additional work since the data in the textarea are always up-to-date with the map. Also there is no hassle in rebuilding the component state from server data, simply putting the serialized data back in the textarea will restore the saved state without the need for any Javascript code.

I believe I could use a hidden input element but for historical reasons I stuck with a textarea


About
---
This is a somewhat cleaned up version of the code that I built during my work on [Alfehrest.Org](alfehrest.org), It is an early attempt of mine on building jQuery plugins, Also I haven't thoroughly tested this plugin to work on all platforms so I'd appreciate any any comments/suggestion/corrections.


Author
---
[Mostafa Abdelraouf](https://twitter.com/droushi)

License
---

MIT
