jQuery.moveSelect
=================

jQuery plugin that moves options between multi-select HTML elements


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

```javascript
<script type="text/javascript">
  	$(function() {
			$('#permissions').moveSelect({btn_save: $('#group-save'), filter: false});
		});
	</script>
```
