/**
 * moveSelect jQuery plugin
 * -----------------+
 * v 0.3b 10/08/2013
 *
 * Move options from one multi-select box to another (with key controls)
 *
 */
(function( $ ) {

	$.fn.moveSelect = function( options ) {
		var El = this;

		// Extend our default options with those provided.
		var opts = $.extend( {}, $.fn.moveSelect.defaults, options );

		/**
		 * Box class
		 *
		 * caches all the options.
		 *
		 * by converting the jquery elements to their ids and making use of native
		 * javascript speeds things up a bit.
		 *
		 * @type {Object}
		 */
		var BOX = {
			cache: new Object(),
			/**
			 * Initiate a cache for the provided element
			 * @param element jQuery
			 */
			init: function(element) {
				var id = element.attr('id');
				BOX.cache[id] = new Array();

				var cache = BOX.cache[id];
				element.find('option').each(function(){
					cache.push({value: $(this).val(), text: $(this).text(), displayed: 1});
				});
			},
			/**
			 * Re-render a jQuery element's options
			 * @param element jQuery
			 */
			redisplay: function(element) {
				var id = element.attr('id');
				var select = document.getElementById(id);

				select.options.length = 0; // clear all options

				var cacheLength = BOX.cache[id].length;

				// Repopulate HTML select box from cache
				for (var i = 0, j = cacheLength; i < j; i++) {
					var node = BOX.cache[id][i];
					if (node.displayed) {
						select.options[select.options.length] = new Option(node.text, node.value, false, false);
					}
				}
			},
			/**
			 * Filter options based on the provided text (AND search)
			 * @param element jQuery Element to filter options on
			 * @param text string Text to filter the element's options with
			 */
			filter: function(element, text) {
				var id = element.attr('id');
				// Redisplay the HTML select box, displaying only the choices containing ALL
				// the words in text. (It's an AND search.)
				var tokens = text.toLowerCase().split(/\s+/);
				var node, token;
				for (var i = 0; (node = BOX.cache[id][i]); i++) {
					node.displayed = 1;
					for (var j = 0; (token = tokens[j]); j++) {
						if (node.text.toLowerCase().indexOf(token) == -1) {
							node.displayed = 0;
						}
					}
				}
				BOX.redisplay(id);
			},
			/**
			 * Delete an option from the cache.
			 *
			 * @param element jQuery Element to delete option from
			 * @param value string Option value to delete
			 */
			delete_from_cache: function(element, value) {
				var id = element.attr('id');
				var node, delete_index = null;
				for (var i = 0; (node = BOX.cache[id][i]); i++) {
					if (node.value == value) {
						delete_index = i;
						break;
					}
				}
				var j = BOX.cache[id].length - 1;
				for (var i = delete_index; i < j; i++) {
					BOX.cache[id][i] = BOX.cache[id][i+1];
				}
				BOX.cache[id].length--;
			},
			/**
			 * Add an option to the cache
			 *
			 * @param element jQuery Element to add the option for
			 * @param option string Option to add
			 */
			add_to_cache: function(element, option) {
				var id = element.attr('id');
				BOX.cache[id].push({value: option.value, text: option.text, displayed: 1});
			},
			/**
			 * Check if an item is contained in the cache
			 * @param element jQuery source element
			 * @param value Value to check the cache for
			 * @return {Boolean}
			 */
			cache_contains: function(element, value) {
				var id = element.attr('id');
				var node;
				for (var i = 0; (node = BOX.cache[id][i]); i++) {
					if (node.value == value) {
						return true;
					}
				}
				return false;
			},
			/**
			 * Move an option from one element to another.
			 *
			 * @param from jQuery From which element are we taking an option
			 * @param to jQuery Which element are we sending the option to
			 * @param redisplay boolean Should we re-render those elements with the new option
			 */
			move: function(from, to, redisplay) {
				var from_box = document.getElementById(from.attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (option.selected && BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}
				BOX.sort(from);
				BOX.sort(to);

				if(typeof redisplay != 'undefined') {
					BOX.redisplay(from);
					BOX.redisplay(to);
				}
			},
			/**
			 * Move all options from one element to another.
			 *
			 * @param from jQuery From which element are we taking options
			 * @param to jQuery Which element are we sending the options to
			 * @param redisplay boolean Should we re-render those elements with the new options
			 */
			move_all: function(from, to, redisplay) {
				var from_box = document.getElementById(from.attr('id'));
				var to_box = document.getElementById(to.attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}
				BOX.sort(from);
				BOX.sort(to);

				if(typeof redisplay != 'undefined') {
					BOX.redisplay(from);
					BOX.redisplay(to);
				}
			},
			/**
			 * Sort the cache alphabetically.
			 * @param element jQuery Element for which we're sorting the cache
			 * @return integer|this
			 */
			sort: function(element) {
				var id = element.attr('id');
				BOX.cache[id].sort( function(a, b) {
					a = a.text.toLowerCase();
					b = b.text.toLowerCase();
					try {
						if (a > b) return 1;
						if (a < b) return -1;
					}
					catch (e) {
						// silently fail on IE 'unknown' exception
					}
					return 0;
				} );
				return this;
			}
		};

		var eventHandlers = {
			//When saving we'll need to at least select all the options in container
			save: function(e, selected_options, unselected_options) {
				selected_options.each(function(){
					$(this).attr('selected', true);
				});
				/*
				unselected_options.each(function(){
					$(this).attr('selected', false);
				});*/
			},
			//Move selected options in to the container and re-render the element
			option_in: function(e, options, base_el, container_el, cache) {
				e.preventDefault();
				options.each(function(){
					//remove the element from the select list
					cache.move(base_el, container_el, true);
				});
			},
			//Move selected options out of the container and re-render the element
			option_out: function(e, options, base_el, container_el, cache) {
				e.preventDefault();
				options.each(function(){
					//add the element to the select list
					cache.move(container_el, base_el, true);
				});
			},
			empty: function(e, base_el, container_el, cache) {
				e.preventDefault();
				cache.move_all(container_el, base_el, true);
			},
			fill: function(e, base_el, container_el, cache) {
				e.preventDefault();
				cache.move_all(base_el, container_el, true);
			}
		};

		/**
		 * If a string is provided look through El for that element and make a jQuery object,
		 * otherwise a jQuery object was provided, just return it.
		 *
		 * @param element string|jQuery
		 * @return jQuery
		 */
		var setupElement = function (element) {
			if(element instanceof jQuery)
			{
				return element;
			}
			else {
				if(opts.prefix != false)
				{
					return El.find(opts.prefix+element);
				}
				return El.find(element);
			}
		};

		//check base and container, initialise them
		var base = setupElement(opts.base);
		BOX.init(base);

		var container = setupElement(opts.container);
		BOX.init(container);

		//check save btn and attach save handler
		var btn_save = setupElement(opts.btn_save);

		El.on('save', function(e, selected_options, unselected_options){
			eventHandlers.save(e, selected_options, unselected_options);
		});

		btn_save.click(function(e){
			El.trigger('save', container.find('option'), base.find('option'));
		});

		//check btn_in and add handler
		var btn_in = setupElement(opts.btn_in);

		El.on('option_in', function(e, options, base_el, container_el, cache) {
			eventHandlers.option_in(e, options, base_el, container_el, cache);
		});

		btn_in.click(function(e) {
			El.trigger('option_in', base.find('option:selected'), base, container, BOX);
		});

		//check btn_out and add handler
		var btn_out = setupElement(opts.btn_out);

		El.on('option_out', function(e, options, base_el, container_el, cache){
			eventHandlers.option_out(e, options, base_el, container_el, cache);
		});

		btn_out.click(function(e) {
			El.trigger('option_out', container.find('option:selected'), base, container, BOX);
		});

		//check btn_empty and add handler (empties the container)
		var btn_empty = setupElement(opts.btn_empty);

		El.on('empty', function(e, base_el, container_el, cache){
			eventHandlers.empty(e, base_el, container_el, cache);
		});

		btn_empty.click(function(e){
			El.trigger('empty', container, base, BOX);
		});

		//check btn_fill and add handler (fills the container with all base's options)
		var btn_fill = setupElement(opts.btn_fill);

		El.on('fill', function(e, base_el, container_el, cache){
			eventHandlers.fill(e, base_el, container_el, cache);
		});

		btn_fill.click(function(e){
			El.trigger('fill', container, base, BOX);
		});

		//Set up some keyboard controls
		var setupArrowControl = function (from_el, to_el, reverse, controlEl) {
			var arrowCode = 37; //left arrow

			if(typeof reverse == 'undefined' || reverse == false)
			{
				arrowCode = 39; //right arrow
			}

			if(typeof controlEl == 'undefined')
			{
				controlEl = from_el;
			}

			controlEl.keydown(function(e){
				var from = from_el.attr('id');
				// right|left arrow -- move across
				if ((e.which && e.which == arrowCode) || (e.keyCode && e.keyCode == arrowCode)) {
					e.preventDefault();
					var old_index = from.selectedIndex;
					BOX.move(from_el, to_el, true);
					from.selectedIndex = (old_index == from.length) ? from.length - 1 : old_index;
				}
				// down arrow -- wrap around
				if ((e.which && event.which == 40) || (e.keyCode && e.keyCode == 40)) {
					from.selectedIndex = (from.length == from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
				}
				// up arrow -- wrap around
				if ((e.which && e.which == 38) || (e.keyCode && e.keyCode == 38)) {
					from.selectedIndex = (from.selectedIndex == 0) ? from.length - 1 : from.selectedIndex - 1;
				}
				return true;
			});
		};

		setupArrowControl(base, container);
		setupArrowControl(container, base, true);

		if(typeof opts.filter == Object)
		{
			var setupFilter = function(filter, source, destination, reverse) {
				filter.keyup(function(e){
					var from = source.attr('id');
					// don't submit form if user pressed Enter
					if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
						e.preventDefault();
						from.selectedIndex = 0;
						BOX.move(source, destination, true);
						from.selectedIndex = 0;
					}
					var temp = from.selectedIndex;
					BOX.filter(base, filter.val());
					from.selectedIndex = temp;
					return true;
				});

				//Setup arrow control
				setupArrowControl(base, container, reverse, filter);
			}

			//check if we are offering filtering on the base
			if(opts.filter.base != false)
			{
				setupFilter(setupElement(opts.filter.base), base, container, false);
			}
			if(opts.filter.container != false)
			{
				setupFilter(setupElement(opts.filter.container), container, base, true);
			}
		}
		return this;
	};

	// Plugin defaults
	$.fn.moveSelect.defaults = {
		prefix: '#move-select-', //if not false it will prefix all the defined ids
		base: 'base', //select[multiple='multiple'] element
		container: 'container', //select[multiple='multiple'] element
		btn_in: 'in', //button or a element
		btn_out: 'out', //button or a element
		btn_save: 'save', //button or a element
		btn_empty: 'empty', //button or a element
		btn_fill: 'fill', //button or a element
		filter: {
			base: false, //false or input[type='text'] element
			container: false //false or input[type='text'] element
		}
	};

// End of closure.
})( jQuery );