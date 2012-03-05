define(["joshlib!vendor/backbone","joshlib!vendor/underscore","joshlib!utils/dollar"], function(Backbone, _, $) {

	var newView = Backbone.View.extend({

		compileTemplate:_.template,

		initialize:function(options){
			if(options) {
				this.data = options.data || {};
			} else {
				this.data = {};
			}
		},

		render:function() {

			var self = this;
			this.generate(function(err,html) {
				if (html!==false) self.setContent(html);
				self.enhance();
			});
		},

		setContent:function(html) {
			$(this.el).html(html);
		},

		generate:function(cb) {
			cb(null,"");
		},

		hide:function() {
			$(this.el).hide();
		},

		show:function() {
			$(this.el).show();
		},

		enhance:function() {

		}
	});

	return newView;

});