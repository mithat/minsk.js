Minsk
=====

Minsk is a tiny front end JavaScript (ES5) library for building MVC-ish widgets against API endpoints. It's especially well-suited for implementing realtime UIs.

Copyright © 2016-2018 Mithat Konar

License
-------
Minsk is released under the [GNU Lesser General Public License version 3](https://www.gnu.org/licenses/lgpl-3.0.en.html).

Overview
--------
A Minsk **Widget** aggregates a **View** and a **Controller**. Minsk **Model**s wrap REST API endpoints and are free-standing to allow them to be shared across Widgets.  Communication between Views and Controllers and Controllers and Models is facilitated by a state object.

Use
----
Minsk's only dependency is jQuery (tested against 2.2.4).

In the following example, we create and use a `VolumeWidget` and `MuteWidget` that are both bound to the same `VolumeModel`.

### HTML

Load jQ, Minsk, your models and widgets, and your app in your HTML. Load Minsk files in the order shown.

```html
    <!-- jQ -->
    <script src="//code.jquery.com/jquery-2.2.4.min.js"></script>

    <!-- load Minsk -->
    <script src="js/minsk/dist/inherits.js"></script>
    <script src="js/minsk/dist/Model.js"></script>
    <script src="js/minsk/dist/View.js"></script>
    <script src="js/minsk/dist/Controller.js"><script>
    <script src="js/minsk/dist/Widget.js"></script>
    
    <!-- models -->
    <script src="js/models/VolumeModel.js"></script> 
    
    <!-- widgets -->
    <script src="js/widgets/VolumeWidget.js"></script>
    <script src="js/widgets/MuteWidget.js"></script>

    <!-- go! -->
    <script src="js/app.js"></script>
```

### Main app

The main app should instantiate the Model(s) with the associated API endpoint(s), create the Widgets, and bind Widgets to their Model. 

A Widget is bound to exactly one Model, however multiple widgets can bind to the same model.

```javascript
$(function () {
    // Create models before widgets:
    app.volumeModel = new mk.Model("/api/v1/audio");

    // Create widgets:
    app.volumeWidget = new app.VolumeWidget('#volumeKnob');
    app.muteWidget = new app.MuteWidget('#muteBtn');

    // Bind widgets to models:
    app.volumeModel
            .registerWidget(app.volumeWidget)
            .registerWidget(app.muteWidget);    
});
```

Models
------
If the API endpoint returns GET (`Model.get`) and PUT (`Model.set`) values in the same `{key: value, key: value, ...}` format used in the Widget (see below) then no further model configuration is needed. `Model.set` returns the updated state, hence a PUT against the  API endpoint should do the same.

If the API endpoint adheres to the above format and behavior, then all that's needed is:

```javascript
app.modelName = new mk.Model("/api/endpoint");
```

If the API endpoint doesn't adhere to the above format and behavior natively, then you can derive a new Model that overrides API request and result processing. 

Widgets
-------
Widgets should define the widget's state parameters in the `stateParams` property, instantiate the Controller and View, and then initialize the Controller and View.

```javascript
/**
 * Volume control widget ctor.
 * @param {string} uiId  jQuery selector string of widget's HTML element.
 * @returns {app.VolumeWidget}
 */
app.VolumeWidget = function (uiId) {
    this.stateParams = ['level', 'isMute'];
    this.view = new app.VolumeView(uiId, this);
    this.controller = new app.VolumeController(this);

    // Call parent ctor after basic params are defined.
    app.Widget.call(this);

    // Init state from model (async).
    app.volumeModel.get("level", this.controller, true);
    app.volumeModel.get("isMute", this.controller, true);
}; inherits(app.VolumeWidget, app.Widget);
```

Views
-----
Views should configure their corresponding HTML element(s), define element change handlers,  and override the `View.updateForced(state)` method.

Element change handlers should update the View's shadow state and then `sendToController(state)`.

```javascript
/**
 * Volume control (knob) view ctor.
 * @param {string} uiId  jQuery selector string of widget's HTML element.
 * @param {Widget} owner  this view's owner. 
 * @returns {app.VolumeView}
 */
app.VolumeView = function (uiId, owner) {
    mk.View.call(this, uiId, owner);

    var _this = this;
    this.oldLevel = null; // used to see if level has changed.

    // knob config descriptors
    this.knobConfigBase = {
        inputColor: '#eee',
        min: 0,
        max: 63,
        angleArc: 300,
        angleOffset: -150,
        change: function (val) {
            _this.onKnobChange(val);
        },
        release: function (val) {
            setTimeout(function () {
                // reassign controller on release and reset Tx status to work around some serverside errors.
                _this.controller = _this.owner.controller;
                _this.controller.clearTx();
            }, 200);
        }
    };
    this.knobConfigUnmute = {
        fgColor: '#2a9fd6'
    };
    this.knobConfigMute = {
        fgColor: '#888'
    };

    // ==== Misc. setup =====
    // configure the knob
    this.$ui.knob(this.knobConfigBase);

    // update knob to initial state.
    this.$ui.val(this.state.level).trigger('change');
    this.$ui.trigger('configure', this.knobConfigUnmute);
}; inherits(app.VolumeView, mk.View);
```

Controllers
-----------
Controllers should define a change handler for each state property.

```javascript
/**
 * Volume control (knob) controller ctor.
 * @param {Widget} owner  this controller's owner. 
 * @returns {app.VolumeController}
 */
app.VolumeController = function (owner) {
    mk.Controller.call(this, owner);
}; inherits(app.VolumeController, mk.Controller);

// ---- Change handlers (one per state property) -------------------------------
app.VolumeController.prototype.changeLevel = function (level) {
    app.volumeModel.set("level", level, this);
};

app.VolumeController.prototype.changeIsMute = function (isMute) {
    app.volumeModel.set("isMute", isMute, this);
};
```
