/**
 * moveSelect jQuery plugin
 * -----------------+
 * v 0.3b 10/08/2013
 *
 * Move options from one multi-select box to another (with key controls)
 *
 */
(function( $ ) {

	$.fn.moveSelect = function( options, ajax ) {
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
			elements: {
				base: null,
				container: null
			},
			/**
			 * Initiate a cache for the provided element
			 * @param element jQuery
			 */
			init: function(base, container) {
				BOX._init(base, 'base');
				BOX._init(container, 'container');
			},
			_init: function(element, type) {
				//set the type (base or container) to this element
				BOX.elements[type] = element;

				//setup the cache
				BOX.cache[type] = new Array();

				//store the options
				element.find('option').each(function(){
					BOX.cache[type].push({value: $(this).val(), text: $(this).text(), displayed: 1});
				});
			},
			/**
			 * Re-render a jQuery element's options
			 * @param element jQuery
			 */
			redisplay: function(type) {
				var select = document.getElementById(BOX.elements[type].attr('id'));

				select.options.length = 0; // clear all options

				var cacheLength = BOX.cache[type].length;

				// Repopulate HTML select box from cache
				for (var i = 0, j = cacheLength; i < j; i++) {
					var node = BOX.cache[type][i];
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
			filter: function(type, tokens, redisplay) {
				// Redisplay the HTML select box, displaying only the choices containing ALL
				// the words in text. (It's an AND search.)
				var node, token;
				for (var i = 0; (node = BOX.cache[type][i]); i++) {
					node.displayed = 1;
					for (var j = 0; (token = tokens[j]); j++) {
						if (node.text.toLowerCase().indexOf(token) == -1) {
							node.displayed = 0;
						}
					}
				}
				BOX._do_redisplay(redisplay, type);
				return BOX.cache[type];
			},
			/**
			 * Add options to the cache an redisplay the element if needed
			 *
			 * @param type string
			 * @param options array
			 * @param redisplay bool|object
			 */
			add_options: function(type, options, redisplay) {
				var length = options.length;

				for(var i=0; i<length;i++)
				{
					BOX.cache[type].push({value: options[i].value, text: options[i].text, displayed: 1});
				}

				BOX.sort(type);

				BOX._do_redisplay(redisplay, type);
			},
			/**
			 * Delete an option from the cache.
			 *
			 * @param element jQuery Element to delete option from
			 * @param value string Option value to delete
			 */
			delete_from_cache: function(type, value) {
				var node, delete_index = null;
				for (var i = 0; (node = BOX.cache[type][i]); i++) {
					if (node.value == value) {
						delete_index = i;
						break;
					}
				}
				var j = BOX.cache[type].length - 1;
				for (var i = delete_index; i < j; i++) {
					BOX.cache[type][i] = BOX.cache[type][i+1];
				}
				BOX.cache[type].length--;
			},
			/**
			 * Add an option to the cache
			 *
			 * @param element jQuery Element to add the option for
			 * @param option string Option to add
			 */
			add_to_cache: function(type, option) {
				BOX.cache[type].push({value: option.value, text: option.text, displayed: 1});
			},
			/**
			 * Check if an item is contained in the cache
			 * @param element jQuery source element
			 * @param value Value to check the cache for
			 * @return {Boolean}
			 */
			cache_contains: function(type, value) {
				var node;
				for (var i = 0; (node = BOX.cache[type][i]); i++) {
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
				var from_box = document.getElementById(BOX.elements[from].attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (option.selected && BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}

				BOX.sort(from);
				BOX.sort(to);

				BOX._do_redisplay(redisplay);
			},
			/**
			 * Move all options from one element to another.
			 *
			 * @param from jQuery From which element are we taking options
			 * @param to jQuery Which element are we sending the options to
			 * @param redisplay boolean Should we re-render those elements with the new options
			 */
			move_all: function(from, to, redisplay) {
				var from_box = document.getElementById(BOX.elements[from].attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}
				BOX.sort(from);
				BOX.sort(to);

				BOX._do_redisplay(redisplay);
			},
			/**
			 * Sort the cache alphabetically.
			 * @param element jQuery Element for which we're sorting the cache
			 * @return integer|this
			 */
			sort: function(element) {
				BOX.cache[element].sort( function(a, b) {
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
			},
			/**
			 * Check which type(s) to redisplay and do so accordingly
			 *
			 * @param boolean|Object option {base: bool, container: bool} or just true|false
			 * @private
			 */
			_do_redisplay: function(option, element) {
				if(option instanceof Object) {
					if(option.base == true)
					{
						if(typeof element == 'undefined' || element == 'base')
						{
							BOX.redisplay('base');
						}
					}
					if(option.container == true)
					{
						if(typeof element == 'undefined' || element == 'container')
						{
							BOX.redisplay('container');
						}
					}
				}
				else if(typeof option != 'undefined' && option == true)
				{
					if(typeof element == 'undefined' || element == 'base')
					{
						BOX.redisplay('base');
					}
					if(typeof element == 'undefined' || element == 'container')
					{
						BOX.redisplay('container');
					}
				}
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
		var container = setupElement(opts.container);

		BOX.init(base, container);

		//check if we need to load JSON data through AJAX
		if(typeof ajax != 'undefined')
		{
			var ajaxData = {};

			if(ajax instanceof Object)
			{
				//seems like we need to send over data with the request
				$.getJSON(ajax.url, ajax.data, function(d){
					ajaxData = d;
				});
			}
			else if(ajax instanceof String)
			{
				//just send a get request to the URL
				$.getJSON(ajax, {}, function(d){
					ajaxData = d;
				});
			}

			//we do require options at least for 1 of the types (be it for the base element or for the container element)
			if(typeof ajaxData.base == 'undefined' && typeof ajaxData.container == undefined) {
				El.trigger('ajax_error', ['Either a base or a container key needs to be defined.', ajaxData]);
			}
			else {
				/**
				 * JSON should be returned as
				 *  {
				 *      base: [
				 *          {value: 'option'\'s value', text: 'actually displayed in option'},...
				 *      ],
				 *      container: [
				 *          {value: 'option'\'s value', text: 'actually displayed in option'},...
				 *      ],
				 *  }
				 */
				if(typeof ajaxData.base == 'undefined' && ajaxData.base.length > 0)
				{
					BOX.add_options('base', ajaxData.base, opts.redisplay);
				}
				if(typeof ajaxData.base == 'undefined' && ajaxData.base.length > 0)
				{
					BOX.add_options('container', ajaxData.container, opts.redisplay);
				}
			}
		}

		//check save btn and attach save handler
		var btn_save = setupElement(opts.btn_save);

		El.on('save', function(e, selected_options, unselected_options){
			$.fn.moveSelect.eventHandlers.save(e, selected_options, unselected_options);
		});

		btn_save.click(function(e){
			El.trigger('save', [container.find('option'), base.find('option')]);
		});

		//check btn_in and add handler
		var btn_in = setupElement(opts.btn_in);

		btn_in.on('click', function(e) {
			e.preventDefault();
			El.trigger('option_in', [base.find('option:selected'), base, container, BOX, opts.redisplay]);
		});

		El.on('option_in', function(e, options, base_el, container_el, cache, redisplay) {
			$.fn.moveSelect.eventHandlers.option_in(e, options, base_el, container_el, cache, redisplay);
		});

		//check btn_out and add handler
		var btn_out = setupElement(opts.btn_out);

		El.on('option_out', function(e, options, base_el, container_el, cache, redisplay){
			$.fn.moveSelect.eventHandlers.option_out(e, options, base_el, container_el, cache, redisplay);
		});

		btn_out.click(function(e) {
			e.preventDefault();
			El.trigger('option_out', [container.find('option:selected'), base, container, BOX, opts.redisplay]);
		});

		//check btn_empty and add handler (empties the container)
		var btn_empty = setupElement(opts.btn_empty);

		El.on('empty', function(e, base_el, container_el, cache, redisplay){
			$.fn.moveSelect.eventHandlers.empty(e, base_el, container_el, cache, redisplay);
		});

		btn_empty.click(function(e){
			e.preventDefault();
			El.trigger('empty', [base, container, BOX, opts.redisplay]);
		});

		//check btn_fill and add handler (fills the container with all base's options)
		var btn_fill = setupElement(opts.btn_fill);

		El.on('fill', function(e, base_el, container_el, cache, redisplay){
			$.fn.moveSelect.eventHandlers.fill(e, base_el, container_el, cache, redisplay);
		});

		btn_fill.click(function(e){
			e.preventDefault();
			El.trigger('fill', [base, container, BOX, opts.redisplay]);
		});

		//Set up some keyboard controls
		var setupArrowControl = function (from_el, to_el, reverse, controlEl) {

			//Use right or left arrow to move the options
			var arrowCode = (typeof reverse == 'undefined' || reverse == false) ? 39 : 37;

			controlEl.keydown(function(e){
				var from = document.getElementById(BOX.elements[from_el].attr('id'));

				// right|left arrow -- move across
				if ((e.which && e.which == arrowCode) || (e.keyCode && e.keyCode == arrowCode)) {
					e.preventDefault();
					var old_index = from.selectedIndex;
					BOX.move(from_el, to_el, true);
					from.selectedIndex = (old_index == from.length) ? from.length - 1 : old_index;
				}

				// down arrow -- wrap around
				if ((e.which && event.which == 40) || (e.keyCode && e.keyCode == 40)) {
					e.preventDefault();
					from.selectedIndex = (from.length == from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
				}

				// up arrow -- wrap around
				if ((e.which && e.which == 38) || (e.keyCode && e.keyCode == 38)) {
					e.preventDefault();
					from.selectedIndex = (from.selectedIndex == 0) ? from.length - 1 : from.selectedIndex - 1;
				}

				return true;
			});
		};

		setupArrowControl('base', 'container', false, base);
		setupArrowControl('container', 'base', true, container);

		if(opts.filter instanceof Object)
		{
			var setupFilter = function(filter, source, reverse) {
				var destination = (source == 'base') ? 'container' : 'base';
				filter.keyup(function(e){
					var from = document.getElementById(BOX.elements[source].attr('id'));

					// don't submit form if user pressed Enter
					if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
						e.preventDefault();

						from.selectedIndex = 0;
						BOX.move(source, destination, opts.redisplay);
						from.selectedIndex = 0;
					}

					var temp = from.selectedIndex;
					var tokens = filter.val().toLowerCase().split(/\s+/);

					//this does an AND search
					var cache = BOX.filter(source, tokens, opts.redisplay);

					//trigger a filter_[base|container] event
					El.trigger('filter_'+source, [BOX.elements[source], cache, tokens, opts.redisplay]);

					from.selectedIndex = temp;
					return true;
				});

				//Setup arrow control
				setupArrowControl(source, destination, reverse, filter);
			}

			//check if we are offering filtering on the base
			if(opts.filter.base != false)
			{
				setupFilter(setupElement(opts.filter.base), 'base', false);
			}
			if(opts.filter.container != false)
			{
				setupFilter(setupElement(opts.filter.container), 'container', true);
			}
		}
		return this;
	};

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
			base: 'filter-base', //false or input[type='text'] element
			container: 'filter-container' //false or input[type='text'] element
		},
		redisplay: {
			base: true,
			container: true
		}
	};
	// Default event handlers
	$.fn.moveSelect.eventHandlers = {
		//When saving we'll need to at least select all the options in container
		save: function(e, container_options, base_options) {
			container_options.each(function(){
				$(this).attr('selected', true);
			});
		},
		//Move selected options in to the container and re-render the element
		option_in: function(e, options, base_el, container_el, cache, redisplay) {
			if(typeof redisplay == 'undefined')
			{
				redisplay = true;
			}

			cache.move('base', 'container', redisplay);

		},
		//Move selected options out of the container and re-render the element
		option_out: function(e, options, base_el, container_el, cache, redisplay) {
			if(typeof redisplay == 'undefined')
			{
				redisplay = true;
			}

			cache.move('container', 'base', redisplay);
		},
		//Move all options from the container element to the base element and re-render both
		empty: function(e, base_el, container_el, cache, redisplay) {
			if(typeof redisplay == 'undefined')
			{
				redisplay = true;
			}

			cache.move_all('container', 'base', redisplay);
		},
		//Move all options from the container element to the base element and re-render both
		fill: function(e, base_el, container_el, cache, redisplay) {
			if(typeof redisplay == 'undefined')
			{
				redisplay = true;
			}

			cache.move_all('base', 'container', redisplay);
		}
	};

// End of closure.
})( jQuery );