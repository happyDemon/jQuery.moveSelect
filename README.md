jQuery.moveSelect
=================

jQuery plugin that moves options between multi-select HTML elements.

Comes with keyboard control in the select elements (right/left arrow will move the selected element)

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
		<input type="submit" class="btn btn-success" id="group-save" value="Create group" />
	</div>
</div>

```

All that's left is to initialise the plugin:
```javascript
<script type="text/javascript">
	$(function() {
		$('#permissions').moveSelect({btn_save: $('#group-save'), filter: false});
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
		filter: {
			base: false, //false or input[type='text'] element
			container: false //false or input[type='text'] element
		}
	};
```
