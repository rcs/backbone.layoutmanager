/* 
 * Test Module: Configure
 * Ensures that configuration settings have correct defaults, initialization,
 * overriding, and functionality.
 *
 */
module("configure", {
  setup: function() {
    // Backbone.LayoutManager constructor.
    this.Layout = Backbone.Layout;

    // Normal Backbone.View.
    this.View = Backbone.View.extend({
      initialize: function(options) {
        // Set up this View with LayoutManager.
        Backbone.LayoutManager.setupView(this, options);
      }
    });
  },

  teardown: function() {
    // Ensure the prefix object is restored correctly.
    this.Layout.prototype.options.prefix = "";

    // Remove `manage: true`.
    delete this.Layout.prototype.options.manage;
    delete Backbone.View.prototype.manage;
  }
});

// Ensure the correct defaults are set for all Layout and View options.
test("defaults", 16, function() {
  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new Layout to test.
  var view = new this.View();

  // Paths should be an empty object.
  deepEqual(layout.options.prefix, "", "Layout: No prefix");
  // The deferred property should be a function.
  ok(_.isFunction(layout.options.deferred), "Layout: deferred is a function");
  // The fetch property should be a function.
  ok(_.isFunction(layout.options.fetch), "Layout: fetch is a function");
  // The partial property should be a function.
  ok(_.isFunction(layout.options.partial), "Layout: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(layout.options.html), "Layout: html is a function");
  // The append property should be a function.
  ok(_.isFunction(layout.options.append), "Layout: append is a function");
  // The when property should be a function.
  ok(_.isFunction(layout.options.when), "Layout: when is a function");
  // The render property should be a function.
  ok(_.isFunction(layout.options.render), "Layout: render is a function");
  // Paths should be an empty object.
  deepEqual(view.options.prefix, "", "View: No prefix");
  // The deferred property should be a function.
  ok(_.isFunction(view.options.deferred), "View: deferred is a function");
  // The fetch property should be a function.
  ok(_.isFunction(view.options.fetch), "View: fetch is a function");
  // The partial property should be a function.
  ok(_.isFunction(view.options.partial), "View: partial is a function");
  // The html property should be a function.
  ok(_.isFunction(view.options.html), "View: html is a function");
  // The append property should be a function.
  ok(_.isFunction(view.options.append), "View: append is a function");
  // The when property should be a function.
  ok(_.isFunction(view.options.when), "View: when is a function");
  // The render property should be a function.
  ok(_.isFunction(view.options.render), "View: render is a function");
});

// Do not allow invalid option assignments to go through.
test("invalid", 2, function() {
  // Configure an invalid property.
  Backbone.LayoutManager.configure("key", "val");

  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new View to test.
  var view = new this.View();

  // The assignment should yield undefined since it was invalid inside all
  // Layouts.
  equal(layout.options.key, undefined, "Layout: Invalid assignment");
  // The assignment should yield undefined since it was invalid inside all
  // Views.
  equal(view.options.key, undefined, "View: Invalid assignment");
});

// Test overriding a single property to ensure propagation works as expected.
test("global", 4, function() {
  // Configure prefix property globally.
  Backbone.LayoutManager.configure({
    prefix: "/templates/",

    manage: true
  });

  // Create a new Layout to test.
  var layout = new this.Layout();
  // Create a new View to test.
  var view = new this.View();

  // The template property set inside prefix should be default for all new
  // Layouts.
  equal(layout.options.prefix, "/templates/",
    "Layout: Override paths globally for Layouts");
  // The template property set inside paths should be default for all new
  // Views.
  equal(view.options.prefix, "/templates/",
    "View: Override paths globally for Views");
  // Ensure the global configuration was updated to reflect this update.
  equal(this.Layout.prototype.options.prefix, "/templates/",
    "Override globals");
  // Ensure that `manage: true` works.
  ok(this.Layout.prototype.options.manage, "Manage was set.");
});

// Ensure that options can be overwritten at an instance level and make sure
// that this does not impact the global configuration.
test("override at invocation", 3, function() {
  // Create a new Layout to test.
  var layout = new this.Layout({
    prefix: "/templates/layouts/"
  });
  // Create a new View to test.
  var view = new this.View({
    prefix: "/templates/raw/"
  });

  // The prefix property should be successfully overwritten for the
  // Layout instance.
  equal(layout.options.prefix, "/templates/layouts/",
    "Override paths locally");
  // The paths.template property should be successfully overwritten for the
  // View instance.
  equal(view.options.prefix, "/templates/raw/",
    "Override paths locally");
  // Ensure the global configuration was NOT updated, local change only.
  notEqual(Backbone.LayoutManager.prototype.options.prefix,
    "/templates/", "Do not override globals");
});

// Render broke in 0.5.1 so this test will ensure this always works.
test("override render", 1, function() {
  var hit = false;
  var layout = new Backbone.Layout({
    template: "#main",

    render: function() {
      hit = true;
    }
  });

  layout.render().then(function() {
    ok(hit, "The render method was hit correctly");
  });
});

test("Fetch works on a View during definition", 1, function() {
  var hit = false;

  var View = Backbone.LayoutView.extend({
    // A template is required to hit fetch.
    template: "a",

    fetch: function() {
      hit = true;
    }
  });
  
  new View().render().then(function() {
    ok(hit, "Fetch gets called on a View.");
  });
});

test("Fetch works on a View during invocation", 1, function() {
  var hit = false;

  new Backbone.LayoutView({
    // A template is required to hit fetch.
    template: "a",

    fetch: function() {
      hit = true;
    }
  }).render().then(function() {
    ok(hit, "Fetch gets called on a View.");
  });
});

test("Collection should exist on the View", 1, function() {
  var m = new Backbone.Collection();
  var D = Backbone.LayoutView.extend({
    initialize: function() {
      this.collection.reset([]);
      ok(true, "This works!");
    }
  });

  var V = Backbone.LayoutView.extend({
    template: "<p></p>",

    fetch: function(path) { return _.template(path); },

    initialize: function() {
      this.setViews({
        p: new D({ collection: this.collection })
      });
    }
  });

  var v = new V({
    collection: m
  });

  v.render();
});

test("Custom template function", 1, function() {
  var T = Backbone.LayoutView.extend({
    fetch: function(template) {
      return template;
    },

    template: function(contents) {
      return contents;
    },

    data: "hi"
  });

  new T().render().done(function() {
    equal($.trim(this.$el.text()), "hi", "Correct text");
  });
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/201
test("Options passed at instance level overwritten by class level options.", 2, function() {
  var layout = new Backbone.Layout();
  var TestView = Backbone.View.extend({
    template: "template-one",
    lol: "test",

    manage: true
  });

  layout.setView("", new TestView({ template: "template-two", lol: "hi" }));

  equal(layout.getView("").options.template, "template-two", "Property overwritten properly");
  equal(layout.getView("").options.lol, "hi", "Property overwritten properly");
});

// https://github.com/tbranyen/backbone.layoutmanager/issues/209
test("If you use 'data' as a variable in a view it won't render", 1, function() {
  var Test = Backbone.View.extend({
    manage: true,

    data: {},
    serialize: { name: "test" },
    fetch: _.identity,
    template: _.template("<%=name%>")
  });

  new Test().render().done(function() {
    equal(this.el.innerHTML, "test", "Correct proeprty set.");
  });
});
