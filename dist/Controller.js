/**
 * @author Mithat Konar
 */

/* global mk */

/**
 * Controller for a Widget.
 * @param {Widget} owner  this controller's owner. 
 * @returns {mk.Controller}
 */
mk.Controller = function (owner) {
    this.owner = owner;
    this.view = {}; // set after view has been instantiated.
    this.state = {}; // initialize from model.

    this.stateParams = owner.stateParams; // !!list of state params
    // intialize state parameters:
    for (var i = 0; i < this.stateParams.length; i += 1) {
        this.state[owner.stateParams[i]] = null;
    }
    this.cts = undefined; // clear-to-send (for view)
    this.modelFailure = undefined;
    this.clearTx();
};

// ---- methods ----------------------------------------------------------------
/**
 * Set the view associated with this controller. Chainable.
 * @returns {mk.Controller}
 */
mk.Controller.prototype.connectView = function () {
    this.view = this.owner.view;
    return this;
};

/**
 * Return the state.
 * @returns {mk.Controller.state}
 */
mk.Controller.prototype.get = function () {
    return this.state;
};

/**
 * Set the controller to the given state and update view unconditionally.
 * @param {object} state
 * @returns {undefined}
 */
mk.Controller.prototype.set = function (state) {
    var _this = this;
    var hasUpdate = false;
    for (var prop in state) {
        if (state.hasOwnProperty(prop) &&
            //                    _this.stateParams.indexOf(prop >= 0) && // check stateParams for valid parameter keys
            _this.state.hasOwnProperty(prop) && // check this.state properties for valid parameter keys
            _this.state[prop] !== state[prop] && _this.state[prop] !== state[prop]) {
            _this.state[prop] = state[prop];
            hasUpdate = true;
        }
    }
    // update view only if something changed:
    if (hasUpdate) {
        this.view.updateForced(state);
    }
};
//
/**
 * Process a change that originated in the view.
 * Clear model failure status and unset clear-to-send.
 * @param {object} state object with change(s).
 * @returns {undefined}
 */
mk.Controller.prototype.change = function (state) {
    this.modelFailure = false;
    this.cts = false;

    // parse out what's changed and call change methods.
    for (var prop in state) {
        if (this.state.hasOwnProperty(prop) && state[prop] !== this.state[prop]) {
            // mangle to get handler name:
            var handlerName = 'change' + prop.charAt(0).toUpperCase() + prop.slice(1);
            this[handlerName](state[prop]);
        }
    }
};

/**
 * Handler for successful model transaction.
 * Update controller state and forward or force change to view.
 * @param {object} state
 * @param {bool} isForceViewUpdate  true to force update the view, defaults to false.
 * @returns {undefined}
 */
mk.Controller.prototype.onModelSuccess = function (state, isForceViewUpdate) {
    this.cts = true;
    this.modelFailure = false;
    
    if (state.isRaw) {
        this.handleRawData(state, isForceViewUpdate);
        return;
    }
    
    for (var prop in state) {
        // TODO: check for changes and update view only if needed.
        if (this.state.hasOwnProperty(prop)) {
            this.state[prop] = state[prop];
        }
    }

    if (typeof isForceViewUpdate === 'undefined' || !isForceViewUpdate) {
        this.view.updateFromController(this.state);
    } else {
        this.view.updateForced(this.state);
    }
};

/**
 * Handler for failed model transaction.
 * @param {string} status  the status.
 * @param {string} error  the error thrown.
 */
mk.Controller.prototype.onModelFail = function (error, message) {
    this.modelFailure = true;
    console.log('AJAX error!');
    // TODO: Is it ok to leak the following?
    console.log('error:', error);
    console.log('message:', message);
};

/**
 * Reset errors, etc. so view events can be processed.
 */
mk.Controller.prototype.clearTx = function () {
    this.modelFailure = false;
    this.cts = true;
};

/**
 * Handle raw data returned by the model. Override this if you need it.
 * The expeced data format is rawData.isRaw == true and rawData.data is the, er, data.
 * @param {mixed} rawData  the raw data returned by the model.
 * @param {bool} isForceViewUpdate  true to force update the view, defaults to false.
 */
mk.Controller.prototype.handleRawData = function (rawData, isForceViewUpdate) {
    console.log("Someone needs to override a Controller.handleRawData() method.");
};
