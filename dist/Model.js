/**
 * @author Mithat Konar
 */

/* global mk */

// namespaces
if (typeof mk === 'undefined') {
    var mk = {};
} else {
    throw new Error("'mk' alredy defined.");
}

/**
 * Basis for a Model.
 * @param {string} apiUrl  the URL for this model's API endpoint (not required).
 * @returns {mk.Model}
 */
mk.Model = function (apiUrl) {
    this.apiUrl = apiUrl;
    this.widgetList = []; // list of controllers listening for changes.
};

// ==== methods ================================================================
/**
 * Add a widget to the list of widgets to be notified about changes. Chainable.
 * @param {Widget} widget
 * @returns {Model}
 */
mk.Model.prototype.registerWidget = function (widget) {
    this.widgetList.push(widget);
    return this;
};

/**
 * Notify a controller of a parameter's value. Optionally force a view update.
 * @param {string} param  the property to get. If undefined, get all.
 * @param {Controller} origin  the controller that instigated the change.
 * @param {boolean} isForceViewUpdate  true to force view to reflect param value.
 * @param {string} url  the api endpoint to send {param:val}; defaults to this.apiUrl.
 */
mk.Model.prototype.get = function (param, origin, isForceViewUpdate, url) {
    var _this = this;
    var apiUrl = typeof url === 'undefined' ? this.apiUrl : url;
    var dat;
    if (param) {
        dat = {};
        dat[param] = true;
    }

    $.ajax({
        type: "GET",
        dataType: 'json', //Evaluates the response as JSON and returns a JavaScript object.
        url: apiUrl,
        data: dat,
        success: function (data) {
            var st = {};
            if (param) {
                st[param] = data[param];
            } else {
                st.isRaw = true;
                st.data = data;
            }
            origin.onModelSuccess(st, isForceViewUpdate);
        },
        error: _this.ajaxError
    });
};


/**
 * Send a model property to an API endpoint and notify controllers.
 * @param {string} param  the property to change.
 * @param {mixed} val  the new property value.
 * @param {Controller} origin  the controller that instigated the change.
 * @param {string} url  the api endpoint to send {param:val}; defaults to this.apiUrl.
 * @returns {undefined}
 */
mk.Model.prototype.set = function (param, val, origin, url) {
    var _this = this;
    var apiUrl = typeof url === 'undefined' ? this.apiUrl : url;
    var s = {};
    s[param] = val;
    var json = JSON.stringify(s);

    $.ajax({
        type: "PUT",
        contentType: "application/json",
        data: json,
        url: apiUrl,
        success: function (data) {
            console.log('written to api:', data);
            // notify registered controllers:
            var arryLen = _this.widgetList.length;
            for (var i = 0; i < arryLen; i += 1) {
                var ct = _this.widgetList[i].controller;
                if (origin === ct) { // do non-forced update to origin
                    ct.onModelSuccess(data);
                }
                else {  // do forced update to everyone else
                    ct.onModelSuccess(data, true);
                }
            }
        },
        error: function (request, status, error) {
            // pretty sure we only need to notify the origin of the fail
            origin.onModelFail(error, request.responseText);
        }
    });
};
