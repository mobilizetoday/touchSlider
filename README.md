[TouchSlider jQuery Plugin](http://widgets.mobilizetoday.com/widgets/image-gallery.html) - Mobile/Tablet/Desktop browsers touch slider
================================================================================================================================

As part of ongoing development of the MobilizeToday platform [widgets](http://widgets.mobilizetoday.com/), we'd like to share our touch slider jQuery plugin that works across different mobile/tablet browsers as well as desktop ones. [Blog post](http://www.mobilizetoday.com/blog/touchslider-jquery-plugin/). 

Features
========
Three possible options for animation:

* Automatic (3D CSS transition is used if detected)
* JavaScript (jQuery methods will be used for animation)
* No Animation (slider will work with no animation, useful for browsers with poor support of JavaScript like BlackBerry OS 5)

Three sliding modes:

* Fixed value scrolling. The value can be set in pixels or has percentage value relative to the available width.
* Per item scrolling.
* Automatic mode. When it automatically detects how many items can be placed within the available width. See example below.

Using callback functions you may build custom designed controls like 

* Previous/next slide 
* Navigate to particular slide by index
* Display current slide index 
* and so on ...

Ho to use
=========
Include the jquery and touchslider scripts to your <head> tag:
	
<script type="text/javascript" src="/path/jquery-1.6.2.min.js"/>
<script type="text/javascript" src="/path/jquery.touchslider-1.0.js"/>

Add below HTML structure with relevant image URLs:

<div class="holder">
	<div class="list">
		<div class="item"><div class="ibox"><img src="assets/tmb1.jpg" alt="" /></div></div>
		<div class="item"><div class="ibox"><img src="assets/tmb2.jpg" alt="" /></div></div>
		<div class="item"><div class="ibox"><img src="assets/tmb3.jpg" alt="" /></div></div>
	</div>
</div>

Demo
====
Please take a look at the examples folder at [GitHub](https://github.com/mobilizetoday/touchSlider/tree/master/examples) and below online demos:
* [Animation modes](http://www.mobilizetoday.com/touchSlider/test1.html)
* [onStart + onChange Callback](http://www.mobilizetoday.com/touchSlider/test12-3.html)
* [Widget demo](http://widgets.mobilizetoday.com/widgets/image-gallery.html)

Tested
=============
TouchSlider has been tested and compatible with:

* iOS (iPhone, iPad, iPod Touch)
* Android (all versions)
* BlackBerry OS 6 (Torch)
* WebOS 2 (Palm Pre/Pixi)
* Desktop browsers

Roadmap
=======
Our future plans on improving this plugin include:

* Adding autoscroll option that allows automatically scroll content when it’s loaded.
* Adding speed acceleration for touch events.

Questions?
----------
Feel free to give us your feedback on what options you’d like to see in the new version of TouchSlider plugin. 
Your feedback on bugs (if any) also appreciated. Don’t forget to provide us with screenshots.


Enjoy using MobilizeToday TouchSlider plugin in your mobile web projects!
