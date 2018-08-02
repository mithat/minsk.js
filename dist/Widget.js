/**
 * @author Mithat Konar
 */

/**
 * A Widget encapsulates a View, Controller, and Model(s) for UI elements.
 * 
 * Define the View, Controller, and Model(s) in derived objects.
 * A View has one Controller and a Controller one View. The Controller can
 * access any number of Models. A derived Widget should define stateParams,
 * and instantiate the View and Controller (and Model(s) if not already
 * existing).
 * 
 * @returns {app.VolumeWidet}
 */
app.Widget = function () {
    this.stateParams = this.stateParams ? this.stateParams : undefined;
    this.view = this.view ? this.view : undefined;
    this.controller = this.controller ? this.controller : undefined;

    // Connect view and controller once both exist.
    this.connect();
};
// ---- methods ----------------------------------------------------------------
/**
 * Connect view to controller and controller to view.
 * @returns {undefined}
 */
app.Widget.prototype.connect = function () {
    this.view.connectController(); // view has a controller
    this.controller.connectView(); // controller has a view
};
