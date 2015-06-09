module.exports = function (derby, options) {
  var derbyTemplates = require('derby/node_modules/derby-templates');
  var templates = derbyTemplates.templates;

  var Component = require('derby/lib/components').Component;
  var Controller = require('derby/lib/Controller');
  var ComponentFactory = require('derby/lib/components').ComponentFactory;

  ComponentFactory.prototype.init = function(context) {
    var component = new this.constructor();

    var parent = context.controller;
    var id = context.id();
    var scope = ['$components', id];
    var model = parent.model.root.eventContext(component);
    model._at = scope.join('.');
    model.set('id', id);
    setAttributes(context, model);
    // Store a reference to the component's scope such that the expression
    // getters are relative to the component
    model.data = model.get();
    parent.page._components[id] = component;

    return initComponent(context, component, parent, model, id, scope);
  };

  function setAttributes(context, model) {
    if (!context.attributes) return;
    // Set attribute values on component model
    for (var key in context.attributes) {
      var attribute = context.attributes[key];
      var segments = (
        attribute instanceof templates.ParentWrapper &&
        attribute.expression &&
        attribute.expression.pathSegments(context)
      );
      if (segments) {
        model.root.ref(model._at + '.' + key, segments.join('.'), {updateIndices: true});
      } else {
        model.set(key, attribute);
      }
    }
  }

  function initComponent(context, component, parent, model, id, scope) {
    // Do generic controller initialization
    var componentContext = context.componentChild(component);
    Controller.call(component, parent.app, parent.page, model);
    Component.call(component, parent, componentContext, id, scope);

    // Do the user-specific initialization. The component constructor should be
    // an empty function and the actual initialization code should be done in the
    // component's init method. This means that we don't have to rely on users
    // properly calling the Component constructor method and avoids having to
    // play nice with how CoffeeScript extends class constructors
    emitInitHooks(context, component);
    component.emit('init', component);

    // Add vm as a synonym to model. In a long term view this should probably be dealt with at core, but I'm uncomfortable doing that atm. because I bet a lot of stuff relies on .model existing on components and pointing to the vm, rather than the root model
    component.vm = model;
    // As a turnaround, add .root as model.root meanwhile
    component.root = model.root;

    if (component.init) component.init(model, model.root);

    return componentContext;
  }

  function emitInitHooks(context, component) {
    if (!context.initHooks) return;
    // Run initHooks for `on` listeners immediately before init
    for (var i = 0, len = context.initHooks.length; i < len; i++) {
      context.initHooks[i].emit(context, component);
    }
  }
}