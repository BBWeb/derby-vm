# derby-vm
Derby plugin for making a better distinction between vm (component's scoped model) and model (model.root). 

vm refers to ViewModel, e.g. the model pertaining to a specific (component's) view/template. This is oddly named in Derby to model, which makes it difficult to separate the two. Thus, the need for this plugin.

How to use
==========

Add the plugin:
```javascript
derby.use(require('derby-vm'));
```

In any init method of any component, you get two arguments instead of one:
```javascript
MyComponent.prototype.init = function (vm, model) {
  // vm === old model - i.e. the component's scoped model
  // model === old model.root - i.e. the root of all model data
};
MyComponent.prototype.components = [require('subcomponent')]
```

Added to every component is two additional variables, vm and root: 
```javascript
MyComponent.prototype.myMethod = function () {
  // New style === Old style
  // this.vm === this.model
  // this.root === this.vm.root
};
```
