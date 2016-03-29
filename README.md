<img src="https://cdn.rawgit.com/adamaveray/featherbox/master/logo.svg" alt="Featherbox" width="150" height="150" />  
Featherbox
==========

A lightweight, simple to customise modal/lightbox jQuery plugin with arguably aesthetically-pleasing default styles.

[View Demo](https://adamaveray.github.io/featherbox/)

Usage
-----

Load jQuery, the Featherbox script and stylesheet on the page. Then, in your script, call:

```js
var $content	= $('...');	// The content for the modal

$content.featherbox();	// Creates and opens the modal
```

### Open on Click

The plugin does not handle monitoring other elements for clicks. To open a modal on click, place the call to `$.featherbox` in a `click` handler:

```js
var $content	= $('...');

$('.link-selector').on('click', function(){
	$content.featherbox();
});
```


Features
--------

- Modern default design
- Full HTML customisation
- Closes on button click, background click or escape key


Options
-------

- **bool `autoShow`:** [default: `true`] Whether to launch the modal upon creation

- **string `transitionOpenClass`:** [default: `__transitioning`] A class applied to new modals, then removed to trigger entrance transition

- **string `transitionCloseClass`:** [default: `__transitioning`] A class applied to modals before removing to trigger exit transition

- **string `extraClass`:** [default: `null`] Classes to add to the containing modal element

- **string `templateModal`:** A HTML template for the entire modal

- **string `templateClose`:** A HTML template for a modal close button

- **string `selectorInsertContent`:** [default: `.modal`]: A selector for the parent element in `templateModal` to append the modal content to

- **string `selectorInsertClose`:** [default: `.modal`]: A selector for the parent element in `templateModal` to append the modal close button to

- **string `selectorLoadElements`:** [default: `img,iframe`]: A selector for elements within the modal to wait for a `load` event on before triggering `featherboxLoad`



Events
------

All events will be passed the Featherbox instance as their custom parameter.

- `featherboxLoad`:			Called when all loadable elements in modal (`<img>`, `<iframe>`, etc) have loaded, or immediately if none exist
- `featherboxOpen`:			Called when opening the modal, _before_ showing
- `featherboxOpenFinish`:	Called when opening the modal, _after_ showing
- `featherboxClose`:			Called when closing the modal, _after_ hiding
- `featherboxCloseStart`:	Called when closing the modal, _before_ hiding


Advanced Usage
--------------

After calling `.featherbox()` on an element, the data value `featherbox` is set to an object providing an API 

### Manually Opening

```js
var featherbox	= $content.data('featherbox');

featherbox.open();		// Transition in
featherbox.open(false);	// Open immediately (no transition)
```


### Manually Closing

```js
var featherbox	= $content.data('featherbox');

featherbox.close();		// Transition out
featherbox.close(false);	// Close immediately (no transition)
```


### Setting Default Options

The default options are stored in `$.featherbox.defaults`.


### Removing Modal Completely


```js
var featherbox	= $content.data('featherbox');

featherbox.destroy();
```


License
-------

[MIT](LICENSE)
