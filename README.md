jQuery.moveSelect
=================

jQuery plugin that moves options between multi-select HTML elements.

Comes with keyboard control in the select elements (right/left arrow will move the selected element)

Optionally fill the select elements with JSON data loaded through AJAX.

##Example

This is an example of how yout HTML could look like (styled with bootstrap 2.3.2):
```html
<div class="control-group">
  <label class="control-label">Permissions</label>
	<div class="controls">
		<div class="row-fluid" id="permissions">
			<div class="row-fluid">
				<div class="span5">
					<select multiple="multiple" class="span12" id="move-select-base" size="8">
							<option value="1">groups.delete</option>
							<option value="2">groups.edit</option>
							<option value="3">groups.add</option>
					</select>
				</div>
				<div class="span2 pagination-centered" style="padding-top: 60px;">
					<a class="btn btn-small btn-primary" id="move-select-in">>></a><br />
					<a class="btn btn-small btn-primary" id="move-select-out"><<</a>
				</div>
				<div class="span5"><select multiple="multiple" class="span12" id="move-select-container" size="8" name="permissions[]"></select></div>
			</div>
			<div class="row-fluid">
				<div class="span5"><a href="#" class="btn btn-mini btn-success" id="move-select-fill">Move all</a></div>
				<div class="span2" style="padding-top: 20px; padding-left: 15px"></div>
				<div class="span5"><a href="#" class="btn btn-mini btn-danger pull-right" id="move-select-empty">Remove all</a></div>
			</div>
		</div>
	</div>
</div>
<div class="control-group">
  <div class="controls">
		<input type="submit" class="btn btn-success" id="permissions-save" value="Create group" />
	</div>
</div>

```

All that's left is to initialise the plugin.

Since our submit button falls outside of ```div#permissions``` we'll define it when initialising:

```javascript
<script type="text/javascript">
	$(function() {
		$('#permissions').moveSelect({btn_save: $('#permissions-save'), filter: false});
	});
</script>
```

##Plugin parameters
These can be passed as parameters when calling the plugin, you can define an ID ```'#move-select-base'``` or 
pass along a jQuery object ```$('#move-select-base')```:

```javascript
// Plugin defaults
	$.fn.moveSelect.defaults = {
		prefix: '#move-select-'
		base: 'base', //select[multiple='multiple'] element
		container: 'container', //select[multiple='multiple'] element
		btn_in: 'in', //button or a element
		btn_out: 'out', //button or a element
		btn_save: 'save', //button or a element
		btn_empty: 'empty', //button or a element
		btn_fill: 'fill', //button or a element
		filter: { //if you set filter to false both will be false
			base: false, //false or input[type='text'] element
			container: false //false or input[type='text'] element
		},
		redisplay: { //if you set redisplay to false or true both container and base will be counted as false
			base: true, //should the base element re-render after options were moved?
			container: true //should the container element re-render after options were moved?
		}
	};
```

##Plugin events
```save (e, selected_options, unselected_option)```

Fired when the save button or link is clicked.

```option_in (e, options, base_el, container_el, cache)```

Fired when your moving the selected options from the base element to the container element.

```option_out (e, options, base_el, container_el, cache)```

Fired when your moving the selected options from the container element to the base element.

```fill (e, base_el, container_el, cache)```

Fired when you want to send all options from the base element to the container element.

```empty (e, base_el, container_el, cache)```

Fired when you want to send all options from the container element to the base element.

```ajax_error (e, error, ajaxData)```

Fired when the returned data doesn't contain both a 'base' key of a 'container' key
