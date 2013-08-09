jQuery.moveSelect
=================

jQuery plugin that moves options between multi-select HTML elements

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
							<option value="sentry.groups.delete">groups.delete</option>
							<option value="sentry.groups.edit">groups.edit</option>
							<option value="sentry.groups.permissions.add">groups.add</option>
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

##Plugin defaults
These can be passed as parameters when calling the plugin, you can define an ID '#move-select-base' or 
pass along a jQuery object $('#move-select-base'):

```javascript
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
```
