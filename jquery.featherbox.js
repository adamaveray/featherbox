/*! Featherbox 0.4 | github.com/adamaveray/featherbox | Adam Averay | MIT */
;(function($){
	var $window	= $(window),
		$body	= $('body');

	var Featherbox	= function(element, options){
		this.options	= $.extend({}, Featherbox.defaults, options);
		this.element	= element;
		this.$element	= $(element);

		this.create();
		if(this.options.autoShow){
			this.show();
		}
	};

	Featherbox.defaults	= {
		// Operation
		autoShow:	true,
		modal:		false,

		// Animation
		transitionOpenClass:	'__transitioning',
		transitionCloseClass:	'__transitioning',

		// Templating
		extraClass:		null,
		templateModal:	'<div class="modal-container"><div class="modal"></div></div>',
		templateClose:	'<button class="modal__close" type="button">Close</button>',
		selectorInsertContent:	'.modal',
		selectorInsertClose:	'.modal',

		// Operation
		selectorLoadElements:	'img,iframe'
	};

	$.extend(Featherbox.prototype, {
		options:	null,
		element:	null,

		$element:	null,
		$modal:		null,
		$close:		null,
		$templateModal:	null,
		$templateClose:	null,

		handlerClick:	null,
		handlerKeydown:	null,

		/**
		 * Builds the modal element (does not insert in document or display)
		 */
		create:	function(){
			var _this	= this;

			if(this.$modal){
				// Clean up existing
				this.close();
			}

			if(!this.$templateModal){
				this.$templateModal	= $($.parseHTML($.trim(this.options.templateModal)));
				this.$templateClose	= $($.parseHTML($.trim(this.options.templateClose)));

				if(this.options.extraClass !== null){
					this.$templateModal.addClass(this.options.extraClass);
				}
			}

			// Create modal
			this.$modal	= this.$templateModal.clone();
			this.$close	= this.$templateClose.clone();
			this.$modal.find(this.options.selectorInsertClose).append(this.$close);

			// Insert content
			this.$modal.find(this.options.selectorInsertContent).append(this.$element);

			// Monitor loading
			this._waitForLoad(this.$modal, this.options.selectorLoadElements, function(){
				_this._trigger('Load');
			});

			// Monitor close events
			var isModal	= this.options.modal;
			window.setTimeout(function(){
				_this._closeOnClick(!isModal);	// Only include background clicks when not modal
				if(!isModal){
					// Only allow closing on escape key when not modal
					_this._closeOnEscape();
				}
			}, 0);
		},

		/**
		 * Appends and shows the modal to the body, optionally transitioning in
		 *
		 * @param {bool} [animate=true]	Whether to trigger CSS classes for transitioning in
		 */
		show:	function(animate){
			(animate === undefined) && (animate = true);

			if(!this.$modal){
				// Nothing to show
				return;
			}

			var $modal	= this.$modal;
			var _this	= this;

			// Insert into page
			$modal
				.hide()
				.appendTo($body);

			var show	= function(){
				$modal.show();
				_this._trigger('OpenFinish');
			};
			this._trigger('Open');

			if(animate){
				// Animate in
				var className	= this.options.transitionOpenClass;

				$modal
					.addClass(className)
					.show();
				window.setTimeout(function(){
					$modal.removeClass(className);
					show();
				}, 0);
			} else {
				// No animation - display immediately
				show();
			}
		},

		/**
		 * Removes the modal from the document, optionally transitioning out before removal
		 *
		 * @param {bool} [animate=true]	Whether to trigger CSS classes for transitioning out
		 */
		close:	function(animate){
			(animate === undefined) && (animate = true);

			this._clearCloseOnClick();
			this._clearCloseOnEscape();

			if(!this.$modal){
				// Nothing to close
				return;
			}

			var $modal	= this.$modal;
			var _this	= this;

			this.$modal	= null;
			this.$close	= null;

			var remove	= function(){
				$modal.remove();
				_this._trigger('Close');
			};
			_this._trigger('CloseStart');

			if(animate){
				// Animate out
				var className	= this.options.transitionCloseClass;

				$modal.addClass(className);
				this._onTransitionEnd($modal, remove);
			} else {
				// No animation - remove immediately
				remove();
			}
		},

		/**
		 * Removes the modal from the document and clears any references to modal elements
		 */
		destroy:	function(){
			this._clearCloseOnClick();
			this._clearCloseOnEscape();

			this.$templateModal && this.$templateModal.remove();
			this.$templateClose && this.$templateClose.remove();

			this.$templateModal	= null;
			this.$templateClose	= null;

			this.$modal && this.$modal.remove();
			this.$modal	= null;
			this.$close	= null;

			this.element	= null;
			this.$element	= null;
		},

		/**
		 * Executes a function after CSS transitions have completed on the given modal element
		 *
		 * @param {$} $modal	The element to wait for transition end
		 * @param {Function} fn	A function to call after transitioning has completed
		 * @private
		 */
		_onTransitionEnd:		function($modal, fn){
			var event	= this._getTransitionEvent($modal[0]);
			if(!event){
				// No transition support
				fn();
				return;
			}

			$modal.one(event, function(){
				fn();
			});
		},
		/**
		 * Detects the transition-end event name for the current browser if supported
		 *
		 * @param {Element} element	A HTML element
		 * @return {string|null}	The transition-end event name, or null if not supported
		 * @private
		 */
		_getTransitionEvent:	function(element){
			var transitions = {
				'transition':		'transitionend',
				'OTransition':		'oTransitionEnd',
				'MozTransition':	'transitionend',
				'WebkitTransition':	'webkitTransitionEnd'
			};

			// Find supported event
			for(t in transitions){	if(!transitions.hasOwnProperty(t)){ continue; }
				if(element.style[t] !== undefined){
					return transitions[t];
				}
			}

			// Transition events not supported
			return null;
		},

		/**
		 * Triggers a jQuery event on the original content element
		 *
		 * @param {string} event	The name of the event (will be prefixed with 'featherbox')
		 * @param {Array} [params]	Additional custom params to pass to event listeners (`this` will be the prepended)
		 * @private
		 */
		_trigger:	function(event, params){
			event	= 'featherbox'+event;
			params	= params || [];

			params.unshift(this);

			this.$element.trigger(event, params);
		},

		/**
		 * Executes a function after all specified descendant elements have finished loading
		 *
		 * @param {$} $element			The jQuery element
		 * @param {string} selector		The selector for elements capable of triggering a 'load' event
		 * @param {Function} callback	A function to execute after all found elements have loaded
		 * @private
		 */
		_waitForLoad:		function($element, selector, callback){
			// Locate loadable elements
			var $loadable	= this.$modal.find(selector)
										 .add(this.$modal.filter(selector));	// Include container if loadable

			var total		= $loadable.length,
				progress	= 0;

			if(total === 0){
				// Nothing to load - trigger immediately
				window.setTimeout(function(){
					callback();
				}, 0);
			}

			$loadable.on('load', function(){
				progress++;

				if(progress >= total){
					// Loaded
					callback();
				}
			});
		},
		/**
		 * Sets up event handlers for dismissing the modal on overlay background or close button click
		 *
		 * @param {bool} [includeBackground=true]	Whether clicks on the background should close the modal
		 * @see _clearCloseOnClick
		 * @private
		 */
		_closeOnClick:		function(includeBackground){
			var _this	= this;

			this._clearCloseOnClick();

			var handler	= function(e){
				if(!_this.$modal){
					// Nothing to show
					return;
				}

				if(!includeBackground || e.target !== _this.$modal[0]){
					// Not a background click or background click ignored - test for close button click
					if(e.target !== _this.$close[0]){
						// Not clicking on close button - clicking on modal content - ignore click
						return;
					}
				}

				e.preventDefault();
				e.stopPropagation();

				_this.close();
			};
			this.handlerClick	= handler;

			$body.on('click', handler);
		},
		/**
		 * Clears handlers set by `_closeOnClick`
		 *
		 * @see _closeOnClick
		 * @private
		 */
		_clearCloseOnClick:	function(){
			if(!this.handlerClick){
				// Nothing to clear
				return;
			}

			var handler	= this.handlerClick;

			this.handlerClick	= null;

			$body.off('click', handler);
		},
		/**
		 * Sets up event handlers for dismissing the modal on escape key presses
		 *
		 * @see _clearCloseOnEscape
		 * @private
		 */
		_closeOnEscape:			function(){
			var keyCode	= 27;	// Escape key

			// Clear any existing handlers
			this._clearCloseOnEscape();

			var _this	= this;
			var handler	= function(e){
				if(e.keyCode === keyCode){
					_this.close();
				}
			};

			this.handlerKeydown	= handler;

			$window.on('keydown', handler);
		},
		/**
		 * Clears handlers set by `_closeOnEscape`
		 *
		 * @see _closeOnEscape
		 * @private
		 */
		_clearCloseOnEscape:	function(){
			if(!this.handlerKeydown){
				// Nothing to clear
				return;
			}

			var handler	= this.handlerKeydown;

			this.handlerKeydown	= null;

			$window.off('keydown', handler);
		}
	});

	$.featherbox		= Featherbox;
	$.fn.featherbox	= function(options){
		var modal	= new Featherbox(this, options);
		return $(this).data('featherbox', modal);
	};
}(window.jQuery));
