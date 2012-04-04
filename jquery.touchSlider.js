/**
 * Copyright (c) 2011-2012 Mobile Web Solutions Inc, d/b/a MobilizeToday.com
 * All rights reserved.
 *
 * License: MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Version: 1.1
 */
;(function($) {
	$.fn.reverse = [].reverse;
	
	$.fn.touchSlider = function(options){
		
		var options = $.extend({
			item: 'div.item',
			holder: 'div.holder',
			box: 'div.list',
			debug: false,
			mode: 'shift',
			shift: '80%',
			delta: 40,
			single: false,
			center: false,
			animation: 'auto',
			touch: true,
			duration: 500,
			prevLink: null,
			nextLink: null,
			onChange: null,
			onStart: null,
			onCheckItems: null,
			lockScroll: false,
			hideClass: 'mt-hidden',
			activeClass: 'active'
		}, options);
		
		this.each(function() {
			var $this = jQuery(this);

			if(options.debug) $('body').append('<div id="console"></div>');

			var events =  [{start: 'mousedown', end: 'mouseup', move: 'mousemove', leave: 'mouseout'}, {start: 'touchstart', end: 'touchend', move: 'touchmove', leave: 'touchend'}];
			var eventIndex = "ontouchend" in document ? 1 : 0;

			var items = $(options.item, this);
			if (!items.length) return;

			var holder = $(options.holder, this).first();
			if (!holder.length) return;

			var box = $(options.box, this).first();
			if (!box.length) return;

			var cssTransitionsSupported = false;

			if (options.animation && options.animation != 'js') {
				var body = document.body || document.documentElement;
				var bodyStyle = body.style;
				
				var transitionEndEvent = (bodyStyle.WebkitTransition !== undefined) ? "webkitTransitionEnd" : "transitionend";
				cssTransitionsSupported = bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.transition !== undefined;

				if (cssTransitionsSupported && options.animation == 'auto') {
					debug('Detected Transitions Support', '');
					box.css({
						'-webkit-transition-property': '-webkit-transform',
						'-webkit-transition-timing-function': 'ease',
						'-moz-transition-property': '-moz-transform',
						'-moz-transition-timing-function': 'ease',
						'transition-property': 'transform',
						'transition-timing-function': 'ease'
					});
					box.unbind(transitionEndEvent);
					box.bind(transitionEndEvent, endAnimation);
				}

				var has3D = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
				if (has3D) {
					debug('Detected 3D Support', '');
				}
			}

			var currentIndex = null;
			var currentOffset = null;

			var graphRealIndex = 0;
			var graphItems = [];
			var currentSubOffset = 0;

			var previousIndex = null;
			var previousOffset = null;
			var touchOffset = 0;

			var hasChanges = false;
			
			setCurrentIndex(0);
			setCurrentOffset(0);

			if(options.touch) {
				box.bind(events[eventIndex]['start'], this, touchEvent);
				box.bind(events[eventIndex]['end'], this, touchEvent);
				box.bind(events[eventIndex]['leave'], this, touchEvent);
				box.bind(events[eventIndex]['move'], this, touchEvent);
			}

			if(options.prevLink) {
				$(options.prevLink, $this).bind('click', function(){
					
					$this.get(0).movePrev();
					return false;
				});
			}

			if(options.nextLink) {
				$(options.nextLink, $this).bind('click', function(){
					$this.get(0).moveNext();
					return false;
				});
			}

			$(window).bind("onorientationchange" in window ? "orientationchange" : "resize", this, resizeEvent);
			$(window).bind("load", this, resizeEvent);

			function resizeEvent() {
				setTimeout(initPosition, 200);
			}

			var isTouching = false;
			var startX = 0;
			var width = holder.width();
			debug('Current width:', width);

			this.getCount = function() {
				return options.mode == 'auto' ? graphItems.length : $(items).length;
			};

			this.moveNext = function() {
				switch(options.mode)
				{
					case 'index': moveNextIndex();
						break;
					case 'shift': moveNextOffset();
						break;
					case 'auto': moveNextAuto();
						break;
				}
			};

			this.movePrev = function() {
				switch(options.mode)
				{
					case 'index': movePrevIndex();
						break;
					case 'shift': movePrevOffset();
						break;
					case 'auto': movePrevAuto();
						break;
				}
			}

			this.moveTo = function(i) {
				switch(options.mode)
				{
					case 'index': moveToIndex(i);
						break;
					//case 'auto': moveToAuto(i);
						//break;
				}
			}
			
			this.refresh = function() {
				initPosition();
			}

			initPosition(true);
			

			function initPosition(init) {
				width =  holder.width();
				touchOffset = 0;
				var init = typeof(init) == 'undefined' ? false: init;

				if (init && $.isFunction(options.onStart)) {
					options.onStart();
				}
				switch(options.mode)
				{
					case 'index':
						if (options.single) {
							var itemsWidth = 0;
							if (init) {
								resizeItems();

							} else {
								$(items[currentIndex]).css('width', width);

								setTimeout(delayResizeItems, 100);
							}
							moveIndex();
						}
						else if(options.center) {
							moveIndex();
						}
						break;
					case 'shift':
						moveShift();
						break;
					case 'auto':
						graphItems = [];
						if (options.single) resetGraphItems();
						showLink('both');

						items.each(function(i, el) {
							var w = this.offsetWidth;
							var l = graphItems.length;
							if (i == 0) {
								if (w > width){
									graphItems.push([w, new Array(new Array(i, w)), 0]);
								} else {
									graphItems.push([w, new Array(new Array(i, w))]);
								}
								detectGraphIndex(i);
							} else {
								if (graphItems[l-1][0] + w <= width) {
									graphItems[l-1][0] += w;
									graphItems[l-1][1].push(new Array(i, w));
									detectGraphIndex(i);
								} else {
									if (w > width){
										graphItems.push([w, new Array(new Array(i, w)), 0]);
									} else {
										graphItems.push([w, new Array(new Array(i, w))]);
									}
									detectGraphIndex(i);
								}
							}
						});

						if (currentIndex >= graphItems.length) setCurrentIndex(graphItems.length-1);

						if (options.single) resizeGraphItems();

						if ($.isFunction(options.onCheckItems)) options.onCheckItems();

						moveAuto();
						break;
				}
			};

			function resetGraphItems() {
				$(items).css('width', '');
			}

			function detectGraphIndex(i) {
				if (i == graphRealIndex) {
					setCurrentIndex(graphItems.length-1);
				}
			}

			function resizeItems() {
				$.each(items, function() {
					$(this).css('width', '');

					var _w = $(this).width();
					if (_w < width) {
						$(this).css('width', width);
					}
				});
			}

			function resizeGraphItems() {
				$.each(graphItems, function(i, el) {
					
					if (el[0] < width) {
						var orig =  el[0];
						el[0] = width;

						$(el[1]).each(function(k, item){
							item[1] = parseInt(width*item[1]/orig);
							$(items[item[0]]).css('width', item[1]);
						})
					}
				});
			}

			function delayResizeItems() {
				resizeItems();
				moveIndex(true);
			}
			

			function touchEvent(e) {
				var touch = (eventIndex) ? e.originalEvent.touches[0] : e;
				
				switch(e.type)
				{
					case events[eventIndex]['move']:
						touchMove(e, touch);
						break;
					case events[eventIndex]['start']:
						touchStart(e, touch);
						break;
					case events[eventIndex]['end']:
					case events[eventIndex]['leave']:
						touchEnd(e);
						break;
				}
			};

			function touchMove(e, touch) {
				if (isTouching) {
					
					if (options.lockScroll && e.type != 'click') e.preventDefault();
					touchOffset = startX - touch.pageX;
					if (touchOffset != 0) {
						moveTo(currentOffset - touchOffset, true);
					}
				}
			};

			function touchStart(e, touch) {
				if (!isTouching) {
					hasChanges = false;
					//if (options.lockScroll && e.type != 'click') e.preventDefault();
					debug('Touch Start');
					isTouching = true;
					touchOffset = 0;

					startX = (eventIndex) ? touch.pageX : e.clientX;
				}
			};

			function touchEnd(e, touch) {
				if (isTouching) {
					debug('Touch End');
					isTouching = false;
					startX = 0;
					
					if (touchOffset != 0) {
						if (touchOffset > options.delta || touchOffset < (0 - options.delta)) {
							detectMove();
						} else {
							moveTo(currentOffset);
						}
						
					}
				}

				touchOffset = 0;
			};

			function detectMove() {
				switch(options.mode)
				{
					case 'shift':
						moveShift();
						break;
					case 'index':
						moveIndex();
						break;
					case 'auto':
						moveAuto();
						break;
				}
			};

			function moveIndex(now) {
				var itemsWidth = 0;
				var itemsBeforeWidth = 0;
				
				$.each(items, function(i){
					if (i < currentIndex) {
						itemsBeforeWidth += this.offsetWidth;
					}
					itemsWidth += this.offsetWidth;
				});

				if(itemsWidth <= width) {hideLink('both');return;}else{showLink('both');}
				
				var possibleOffset = 0;
				if (touchOffset > 0) {
					if (options.center) {
						possibleOffset = 0 - (itemsBeforeWidth + $(items[currentIndex]).width() + $(items[currentIndex+1]).width()/2) + width/2;

						if(currentIndex < items.length-1) {
							setCurrentIndex(currentIndex+1);
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							moveTo(currentOffset);
						}
					} else {
						possibleOffset = 0 - (itemsBeforeWidth + $(items[currentIndex]).width());

						if(itemsWidth + possibleOffset > width) {
							setCurrentIndex(currentIndex+1);
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							setCurrentIndex(items.length - 1);
							setCurrentOffset(0 - (itemsWidth - width));
							moveTo(currentOffset);
						}
					}
					
				} else if (touchOffset < 0) {
					if (options.center) {
						possibleOffset = 0 - (itemsBeforeWidth - $(items[currentIndex-1]).width()/2) + width/2;

						if(currentIndex > 0) {
							setCurrentIndex(currentIndex-1);
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							moveTo(currentOffset);
						}
					} else {
						possibleOffset = 0 - (itemsBeforeWidth - $(items[currentIndex]).width());
						if(possibleOffset < 0) {
							setCurrentIndex(currentIndex-1);
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							setCurrentIndex(0);
							setCurrentOffset(0);
							moveTo(currentOffset);
						}
					}
					

				} else {
					if (options.center) {
						possibleOffset = 0 - (itemsBeforeWidth + $(items[currentIndex]).width()/2)  + width/2;
						setCurrentOffset(possibleOffset);

						if (typeof(now) == 'undefined') {
							moveTo(currentOffset);
						}else {
							moveTo(currentOffset, true);
						}
					} else {
						possibleOffset = 0 - itemsBeforeWidth;
						setCurrentOffset(possibleOffset);

						if (typeof(now) == 'undefined') {
							moveTo(currentOffset);
						}else {
							moveTo(currentOffset, true);
						}
						
					}
				}
			};

			function moveAuto() {
				var itemsWidth = 0;
				var itemsBeforeWidth = 0;

				width = holder.width();

				$.each(graphItems, function(i){
					if (i < currentIndex) {
						itemsBeforeWidth += this[0];
					}
					itemsWidth +=  this[0];
				});

				var _long = graphItems[currentIndex].length > 2 ? true : false;

				if(itemsWidth <= width) {hideLink('both');}else{showLink('both');}

				if (options.center && itemsWidth < width) {
					possibleOffset = width/2 - itemsWidth/2;
					setCurrentOffset(possibleOffset);
					moveTo(currentOffset);
					return;
				}

				var possibleOffset = 0;
				if (touchOffset > 0) {
					if(currentIndex < graphItems.length-1 || (currentIndex >= graphItems.length-1 && _long)) {

						if (_long && graphItems[currentIndex][0] - width > graphItems[currentIndex][2]) {

							graphItems[currentIndex][2] += width;

							if (graphItems[currentIndex][0] - graphItems[currentIndex][2] > width) {
								setCurrentOffset(currentOffset - width);
								moveTo(currentOffset);
							} else {
								setCurrentOffset(currentOffset - (graphItems[currentIndex][0] - graphItems[currentIndex][2]));
								graphItems[currentIndex][2] += graphItems[currentIndex][0] - graphItems[currentIndex][2];
								graphItems[currentIndex][2] -= width;
								moveTo(currentOffset);
							}
						}
						else {
							if(typeof(graphItems[currentIndex+1]) != 'undefined') {
								if( graphItems[currentIndex+1].length > 2) {
									possibleOffset = 0 - (itemsBeforeWidth + graphItems[currentIndex][0]);
								} else {
									possibleOffset = 0 - (itemsBeforeWidth + graphItems[currentIndex][0] + graphItems[currentIndex+1][0]/2) + width/2;
								}

								if(itemsWidth + possibleOffset > width) {
									setCurrentIndex(currentIndex+1);
									setCurrentOffset(possibleOffset);
									moveTo(currentOffset);
								} else {
									setCurrentIndex(graphItems.length - 1);
									setCurrentOffset(0 - (itemsWidth - width));
									moveTo(currentOffset);
								}
							} else {
								moveTo(currentOffset);
							}
						}
					} else {
						moveTo(currentOffset);
					}

				} else if (touchOffset < 0) {
					if(currentIndex > 0 || (currentIndex <= 0 && _long)) {

						if (_long && graphItems[currentIndex][2] > 0) {

							graphItems[currentIndex][2] -= width;

							if (graphItems[currentIndex][2] >= 0) {
								setCurrentOffset(currentOffset + width);
								moveTo(currentOffset);
							} else {
								setCurrentOffset(currentOffset + (graphItems[currentIndex][2] + width));
								graphItems[currentIndex][2] = 0;
								moveTo(currentOffset);
							}
							
						}
						else {
							if(typeof(graphItems[currentIndex-1]) != 'undefined' ) {
								if (graphItems[currentIndex-1].length > 2) {
									possibleOffset = 0 - (itemsBeforeWidth - width);
									graphItems[currentIndex-1][2] = graphItems[currentIndex-1][0] - width;
								} else {
									possibleOffset = 0 - (itemsBeforeWidth - graphItems[currentIndex-1][0]/2) + width/2;
								}

								if(possibleOffset < 0) {
									setCurrentIndex(currentIndex-1);
									setCurrentOffset(possibleOffset);
									moveTo(currentOffset);
								} else {
									setCurrentIndex(0);
									setCurrentOffset(0);
									moveTo(currentOffset);
								}
							} else {
								moveTo(currentOffset);
							}
						}
					} else {
						moveTo(currentOffset);
					}
				}  else {
					if (_long) {
						possibleOffset = 0 - itemsBeforeWidth;
					} else {
						possibleOffset = 0 - (itemsBeforeWidth + graphItems[currentIndex][0]/2)  + width/2;
					}

					if (possibleOffset >= 0) {
						setCurrentOffset(0);
						moveTo(currentOffset);
					} else if (itemsWidth + possibleOffset <= width) {
						setCurrentOffset(0 - (itemsWidth - width));
						moveTo(currentOffset);
					} else {
						setCurrentOffset(possibleOffset);
						moveTo(currentOffset);
					}
				}
			};

			function hideLink(name) {
				switch(name) {
					case "both":
						if(options.prevLink) $(options.prevLink, $this).addClass(options.hideClass);
						if(options.nextLink) $(options.nextLink, $this).addClass(options.hideClass);
						break;
					case "prev":
						if(options.prevLink) $(options.prevLink, $this).addClass(options.hideClass);
						break;
					case "next":
						if(options.nextLink) $(options.nextLink, $this).addClass(options.hideClass);
						break;
				}

				width = holder.width();
			}

			function showLink(name) {
				switch(name) {
					case "both":
						if(options.prevLink) $(options.prevLink, $this).removeClass(options.hideClass);
						if(options.nextLink) $(options.nextLink, $this).removeClass(options.hideClass);
						break;
					case "prev":
						if(options.prevLink) $(options.prevLink, $this).removeClass(options.hideClass);
						break;
					case "next":
						if(options.nextLink) $(options.nextLink, $this).removeClass(options.hideClass);
						break;
				}

				width = holder.width();
			}

			function moveShift() {
				var itemsWidth = 0;
				$.each(items, function(){
					itemsWidth += this.offsetWidth;
				});

				if (itemsWidth < width && !options.center) {return;}

				var shift = options.shift+'';
				var possibleOffset = 0;

				if(shift.indexOf('%') != -1) {
					shift = parseInt(width*options.shift.substr(0, options.shift.length-1)/100);
				} else {
					shift = parseInt(options.shift);
				}

				if (options.center && itemsWidth < width) {
					possibleOffset = width/2 - itemsWidth/2;
					setCurrentOffset(possibleOffset);
					moveTo(currentOffset);
				} else {
					if (touchOffset > 0) {
						possibleOffset = currentOffset - shift;

						if(itemsWidth + possibleOffset > width) {
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							setCurrentOffset(0 - (itemsWidth - width));
							moveTo(currentOffset);
						}
					} else {

						possibleOffset = currentOffset + shift;
						if(possibleOffset < 0) {
							setCurrentOffset(possibleOffset);
							moveTo(currentOffset);
						} else {
							setCurrentOffset(0);
							moveTo(currentOffset);
						}
					}
				}
			};

			function moveNextOffset() {
				touchOffset = 1;
				moveShift();
			}

			function movePrevOffset() {
				touchOffset = -1;
				moveShift();
			}

			function debug(msg, param) {
				if (typeof(param) == 'undefined') {
					param = '';
				}
				if (options.debug) {
					var d = new Date();
					$('#console').prepend('<div class="debug-item"><strong>'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds()+'</strong> '+ msg+' '+param+'</div>');
				}
			};

			function setCurrentIndex(index) {
				if (index != currentIndex) {
					hasChanges = true;
					previousIndex = currentIndex;
					currentIndex = index;

					if (options.mode == 'auto' && graphItems.length) {
						graphRealIndex = graphItems[currentIndex][1][0][0];
					} else {
						$(items).removeClass(options.activeClass);
						$(items[currentIndex]).addClass(options.activeClass);
					}
					debug('Setting up current index:', index);

				} else {
					hasChanges = true;
				}
			};

			function setCurrentOffset(offset) {
				offset = parseInt(offset, 10);
				if (offset != currentOffset) {
					previousOffset = currentOffset;
					currentOffset = offset;
					debug('Setting current offset:', offset);
				}
			};

			function moveToIndex(index) {
				if (typeof(items[index]) != 'undefined') {
					setCurrentIndex(parseInt(index));
					touchOffset = 0;
					moveIndex();
				}
			}

			function moveNextIndex() {
				touchOffset = 1;
				moveIndex();
			};

			function movePrevIndex() {
				touchOffset = -1;
				moveIndex();
			};

			function moveNextAuto() {
				touchOffset = 1;
				moveAuto();
			};

			function movePrevAuto() {
				touchOffset = -1;
				moveAuto();
			};

			function moveTo(coord, now) {
				var delay = typeof(now) == 'undefined' ? options.duration : 0;

				if (typeof(now) == 'undefined' && $.isFunction(options.onChange) && hasChanges) {
					options.onChange(previousIndex, currentIndex);
				}

				if (!options.animation) {
					if (delay) {
						startAnimation();
						box.css({
							'margin-left': coord+'px'
						});
						endAnimation();
					}
					
				} else {
					startAnimation();
					var delayTransition = typeof(now) == 'undefined' ? options.duration/1000+'s' : '0';

					if (cssTransitionsSupported) {
						box.css({
							'-webkit-transition-duration': delayTransition,
							'-moz-transition-duration': delayTransition,
							'transition-duration': delayTransition
						});
						
						if(has3D) {
							debug('CSS 3D Transition To:', coord);
							box.css({
								'-webkit-transform': 'translate3d('+coord+'px,0,0)',
								'transform': 'translate3d('+coord+'px,0,0)'
							});
						}else {
							debug('CSS Transition To:', coord);
							box.css({
								'-webkit-transform': 'translate('+coord+'px,0)',
								'-moz-transform': 'translate('+coord+'px,0)',
								'transform': 'translate('+coord+'px,0)'
							});
						}

					} else {
						debug('jQuery Animate To:', coord);
						box.animate({
							'margin-left': coord+'px'
						},{
							queue: false,
							duration: delay,
							easing: 'swing',
							complete: endAnimation
						});
					}
				}
			};

			function startAnimation() {
				box.addClass("moving");
				debug('Animation start', '');
			}

			function endAnimation() {
				box.removeClass("moving");
				debug('Animation end', '');
			}

		});

		return this;
	};
	
})(jQuery);