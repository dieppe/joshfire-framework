/*

  A slide panel.

  A card panel with a slide transition.

*/

define(
[
  'joshlib!vendor/underscore',
  'joshlib!utils/dollar',
  'joshlib!ui/cardpanel',
],
function (_, $, UICardPanel) {

  var transitionEndEvent = (function () {
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'WebkitTransition':'webkitTransitionEnd',
      'transition':'transitionend',
    };

    for (t in transitions) {
      if (el.style[t] !== undefined){
        return transitions[t];
      }
    }
  })();

  (function () {
    // Defines prefixed versions of the
    // transitionEnd event handler
    var transitionFinishedEvents = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'transition'       : 'transitionEnd'
    };

    // Feature detect actual transitionEnd keyword by triggering an event
    window.setTimeout(function () {
      var div = document.createElement('div');
      div.id = "my-transition-test";
      div.style.position = 'absolute';
      div.style.zIndex = -10;
      div.style.bottom = '-1000px';
      div.style.height = '100px';
      div.style.width = '100px';
      div.style.background = 'yellow';
      div.style.display = 'hidden';
      window.document.body.appendChild(div);

      $('#my-transition-test').one(_.values(transitionFinishedEvents).join(" "), function (e) {
        if (transitionEndEvent !== e.type) {
          window.console.warn("Changing misconfigured transitionEndEvent to " + e.type + ". (Was " + transitionEndEvent + ")");
          transitionEndEvent = e.type;
        }
        window.document.body.removeChild(div);
      });

      window.setTimeout(function () {
        div.style['-webkit-transition'] = '0.1s';
        div.style['-webkit-transform'] = 'translate3d( 100px,0,0)';
      }, 25);

    }, 25);
  })();

  var SlidePanel = UICardPanel.extend({

    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options.
     */
    initialize: function(options) {
      this.cssTransition = options.cssTransition || '.4s ease-in-out all';

      UICardPanel.prototype.initialize.call(this, options);
    },

    prepareChildForTransition: function (name, transitionDirection) {
      this.transitionDirection = transitionDirection || 'none';

      // We should never go there...
      if(!this.transitionDirection || this.transitionDirection === 'none') {
        return;
      }

      // Hide and position target child on top/left corner
      var to = this.children[name];
      var from;

      var toClasses = '';
      var fromClasses = '';
      var direction = this.transitionDirection;

      // Position origin child to the right/left/top/bottom based on
      // requested parameter and move viewport there without transition
      if (this.currentChild) {
        from = this.children[this.currentChild];
        fromClasses = 'slide-transition-origin-' + direction;
        from.$el.addClass(fromClasses);
      }

      toClasses = 'slide-transition-destination-' + direction;
      to.$el.addClass(toClasses);


      this.trigger('view:prepared');
    },

    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     * @param {String} direction of the transition (left, right, up, down, none)
     */
    showChild: function(name, transitionDirection) {
      if (transitionDirection === 'none') {
        this.transitionDirection = 'none';
      }
      if (!this.transitionDirection || this.transitionDirection === 'none') {
        UICardPanel.prototype.transition.call(this, this.currentChild, name);
        this.currentChild = name;
      }
      else {
        UICardPanel.prototype.showChild.call(this, name);
      }
    },

    /**
     * Hides the current child and shows another one using a slide transition.
     *
     * @function
     * @param {String} the name of old visible child
     * @param {String} the name of new visible child
     */
    transition: function(fromChild, toChild) {
      // Hide and position target child on top/left corner
      var to = this.children[toChild];
      var from;

      var toClasses = '';
      var fromClasses = '';
      var direction = this.transitionDirection;

      // Position origin child to the right/left/top/bottom based on
      // requested parameter and move viewport there without transition
      if (fromChild) {
        from = this.children[fromChild];
        fromClasses = 'slide-transition-origin-' + direction;
      }

      toClasses = 'slide-transition-destination-' + direction;

      // Time to show the target child. It won't appear since it
      // is positioned off screen for the time being.
      // (Also take that opportunity to ensure that only origin and
      // target children are displayed)
      _.each(this.children, _.bind(function(child, childName) {
        if (childName === this.currentChild) {
          child.show();
        }
        else if (childName === toChild) {
          child.show();
          child.$el.hide().show(0);
        }
        else {
          child.hide();
        }
      }, this));

      setTimeout(function () {
        var didFinishTransitionTo = false;
        var didFinishTransitionFrom = false;
        var checkEvent = function (event, view) {
          // If the transitionEnd event does not come from the wrapper,
          // ignore it.
          return (event.originalEvent.propertyName === '-webkit-transform' ||
                  event.originalEvent.propertyName === 'transform') &&
                  event.target === view.el;
        };
        var transitionEnd = function (view, isOrigin) {
          // Hide from element after transition
          if (isOrigin) {
            view.$el.off(transitionEndEvent, transitionEndFuncFrom);
            view.trigger('hide:transitionend');
            view.$el.removeClass(fromClasses);
            view.hide();
            didFinishTransitionFrom = true;
          }
          else {
            view.$el.off(transitionEndEvent, transitionEndFuncTo);
            view.trigger('show:transitionend');
            view.$el.removeClass(toClasses);
            didFinishTransitionTo = true;
          }
        };

        var transitionEndFunc = function (view, isOrigin) {
          return function (event) {
            if (!checkEvent(event, view)) return;
            transitionEnd(view, isOrigin);
          };
        };

        var transitionEndFuncTo = transitionEndFunc(to, false);
        var transitionEndFuncFrom = transitionEndFunc(from, true);

        toClasses += ' slide-transition-run';
        to.$el.off(transitionEndEvent);
        to.$el.on(transitionEndEvent, transitionEndFuncTo);
        to.$el.addClass('slide-transition-run');
        to.trigger('show:transitionstart');

        if (from) {
          fromClasses += ' slide-transition-run';
          from.$el.off(transitionEndEvent);
          from.$el.on(transitionEndEvent, transitionEndFuncFrom);
          from.$el.addClass('slide-transition-run');
          from.trigger('hide:transitionstart');
        }

        // Watchdog: in case the transitionend event did not fire on some weird
        // platforms
        setTimeout (function () {
          if (!didFinishTransitionFrom && from) {
            transitionEnd(from, true);
          }
          if (!didFinishTransitionTo) {
            transitionEnd(to, false);
          }
        }, 600);

      }, 200);
    },

    enhance: function () {
      UICardPanel.prototype.enhance.call(this);

      // Set the wrapper as root for absolute positioning
      // of children views.
      this.$('.joshfire-wrapper').first().css({
        position: 'relative'
      });
    },

    scrollTop: function() {
      UICardPanel.prototype.scrollTop.call(this);
    }
  });

  return SlidePanel;
});