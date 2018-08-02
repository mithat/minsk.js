/**
 * @author Mithat Konar
 */

/* global mk */

/**
 * The visual representation of a Widget. Owned by a Widget.
 * @param {string} uiId  jQuery selector string of widget's HTML element.
 * @param {Widget} owner  this view's owner. 
 * @returns {app.VolumeWidget}
 */
mk.View = function (uiId, owner) {
    this.$ui = $(uiId);
    this.owner = owner;
    this.initShadowState();
    this.controller = {}; // initialize after the controller is instatiated.
};

// ---- methods ----------------------------------------------------------------
/**
 * Add a state object for this View with the state properties specifed in the owner.
 * This is meant to shadow (more correctly foreshadow) the controller's state.
 * When update the state whenever the user updates the view.
 * @returns {undefined}
 */
mk.View.prototype.initShadowState = function () {
    this.state = {};
    // intialize state parameters:
    this.stateParams = this.owner.stateParams; // list of state params from owner
    for (var i = 0; i < this.stateParams.length; i += 1) {
        this.state[this.owner.stateParams[i]] = null;
    }
};

/**
 * Set the controller for this view. Chainable.
 * @returns {mk.View} this
 */
mk.View.prototype.connectController = function () {
    this.controller = this.owner.controller;
    return this;
};

/**
 * Send view state change(s) to the controller iff it's clear to send.
 * @param {type} newState  the new state to send.
 * @returns {undefined} this
 */
mk.View.prototype.sendToController = function (newState) {
    if (this.controller.cts || this.controller.modelFailure) {
        this.controller.change(newState);
    }
};

/**
 * Check that current view state and controller state; if they don't match, resend view state to controller.
 * @param {object} receivedState  the state sent by the controller.
 * @returns {undefined}
 */
mk.View.prototype.updateFromController = function (receivedState) {
    for (var prop in receivedState) {
        if (this.state.hasOwnProperty(prop) && receivedState[prop] !== this.state[prop]) { // check prop is valid, doesn't matches.
            this.sendToController(this.state); // send latest view state back to controller.
            break; // no need to check more props to know we need to resend.
        }
    }
};

/**
 * Update the view's appearance and state to reflect given state. **Override** in derived objects. Chainable.
 * @param {object} state  the state to update the widget to.
 * @returns {app.VolumeWidget} this
 */
mk.View.prototype.updateForced = function (state) {
    console.log('Someone needs to override a View.updateForced() method.');
    return this;
};
