/**
 * moveSelect jQuery plugin
 * -----------------+
 * v 0.2b 08/08/2013
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
			init: function(element) {
				var id = element.attr('id');
				BOX.cache[id] = new Array();

				var cache = BOX.cache[id];
				element.find('option').each(function(){
					cache.push({value: $(this).val(), text: $(this).text(), displayed: 1});
				});
			},
			redisplay: function(element) {
				var id = element.attr('id');
				// Repopulate HTML select box from cache
				var select = document.getElementById(id);

				select.options.length = 0; // clear all options

				var cacheLength = BOX.cache[id].length;
				for (var i = 0, j = cacheLength; i < j; i++) {
					var node = BOX.cache[id][i];
					if (node.displayed) {
						select.options[select.options.length] = new Option(node.text, node.value, false, false);
					}
				}
			},
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
			add_to_cache: function(element, option) {
				var id = element.attr('id');
				BOX.cache[id].push({value: option.value, text: option.text, displayed: 1});
			},
			cache_contains: function(element, value) {
				var id = element.attr('id');
				// Check if an item is contained in the cache
				var node;
				for (var i = 0; (node = BOX.cache[id][i]); i++) {
					if (node.value == value) {
						return true;
					}
				}
				return false;
			},
			move: function(from, to) {
				var from_box = document.getElementById(from.attr('id'));
				var to_box = document.getElementById(to.attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (option.selected && BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}
				BOX.sort(from).redisplay(from);
				BOX.sort(to).redisplay(to);
			},
			move_all: function(from, to) {
				var from_box = document.getElementById(from.attr('id'));
				var to_box = document.getElementById(to.attr('id'));
				var option;
				for (var i = 0; (option = from_box.options[i]); i++) {
					if (BOX.cache_contains(from, option.value)) {
						BOX.add_to_cache(to, {value: option.value, text: option.text, displayed: 1});
						BOX.delete_from_cache(from, option.value);
					}
				}
				BOX.sort(from).redisplay(from);
				BOX.sort(to).redisplay(to);
			},
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

		btn_save.click(function(e){
			//unset any selected options in the base element, just in case
			base.find('option').each(function(){
				$(this).attr('selected', false);
			});

			//select all options in the container element
			container.find('option').each(function(){
				$(this).attr('selected', true);
			});
		});

		//check btn_in and add handler
		var btn_in = setupElement(opts.btn_in);

		btn_in.click(function(e) {
			e.preventDefault();
			base.find('option:selected').each(function(){
				//remove the role from the select list
				BOX.move(base, container);
			});
		});

		//check btn_out and add handler
		var btn_out = setupElement(opts.btn_out);

		btn_out.click(function(e) {
			e.preventDefault();
			container.find('option:selected').each(function(){
				//add the role from the select list
				BOX.move(container, base);
			});
		});

		//check btn_empty and add handler (empties the container)
		var btn_empty = setupElement(opts.btn_empty);

		btn_empty.click(function(e){
			e.preventDefault();
			BOX.move_all(container, base);
		});

		//check btn_fill and add handler (fills the container with all base's options)
		var btn_fill = setupElement(opts.btn_fill);

		btn_fill.click(function(e){
			e.preventDefault();
			BOX.move_all(base, container);
		});

		//Set up some keyboard controls
		var setupControl = function (from_el, to_el, reverse) {
			var arrowCode = 37; //left arrow

			if(typeof reverse == 'undefined')
			{
				arrowCode = 39; //right arrow
			}

			from_el.keydown(function(e){
				var from = from_el.attr('id');
				// right|left arrow -- move across
				if ((e.which && e.which == arrowCode) || (e.keyCode && e.keyCode == arrowCode)) {
					e.preventDefault();
					var old_index = from.selectedIndex;
					BOX.move(from_el, to_el);
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

		setupControl(base, container);
		setupControl(container, base, true);

		if(typeof opts.filter == Object)
		{
			var setupFilter = function(filter, source, destination) {
				filter.keyup(function(e){
					var from = source.attr('id');
					// don't submit form if user pressed Enter
					if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
						e.preventDefault();
						from.selectedIndex = 0;
						BOX.move(source, destination);
						from.selectedIndex = 0;
					}
					var temp = from.selectedIndex;
					BOX.filter(base, filter.val());
					from.selectedIndex = temp;
					return true;
				});

				filter.keydown(function(e){
					var from = source.attr('id');
					// right arrow -- move across
					if ((e.which && e.which == 39) || (e.keyCode && e.keyCode == 39)) {
						e.preventDefault();
						var old_index = from.selectedIndex;
						BOX.move(source, destination);
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
			}

			//check if we are offering filtering on the base
			if(opts.filter.base != false)
			{
				setupFilter(setupElement(opts.filter.base), base, container);
			}
			if(opts.filter.container != false)
			{
				setupFilter(setupElement(opts.filter.container), container, base);
			}
		}
		return this;
	};

	// Plugin defaults
	$.fn.moveSelect.defaults = {
		base: '#move-select-base', //select[multiple='multiple'] element
		container: '#move-select-container', //select[multiple='multiple'] element
		btn_in: '#move-select-in', //button or a element
		btn_out: '#move-select-out', //button or a element
		btn_save: '#move-select-save', //button or a element
		btn_empty: '#move-select-empty', //button or a element
		btn_fill: '#move-select-fill', //button or a element
		filter: {
			base: false, //false or input[type='text'] element
			container: false //false or input[type='text'] element
		}
	};

// End of closure.
})( jQuery );