/**
 * @author Emily Palmieri
 * @class
 * Responsible for placing objects such as FrameGroups where they need to be
 * at the start and end of animations
 */

var AnimationManager = new Class({

    /** Returns the radius of the room
     * @param {FrameGroup[]|MapManager[]} objList - An array of objects
     * @return {Number} radius - The radius of a polygon containing the objects
     */
    getRadius: function(objList) {
        var radius;

        // Prevent division by 0 with one frame
        if (objList.length === 1) {
            radius = objList[0].frameWidth+100;
        }
        else {
            radius = (objList[0].frameWidth+100)/
                (2*Math.sin(Math.PI/objList.length));
        }

        return radius;
    },

    /** Determines how the frames should be positioned around the user
     * @param {FrameGroup[]|MapManager[]} objList = An array of objects
     */
    calculateFramePositions: function(objList){

        // Calculates polygon radius
        var radius = this.getRadius(objList);
        var length = objList.length;

        for(var i = 0; i < length; i++)
        {

            // Fits any number of frames in a polygonal-shape
            var object = objList[i];
            object.position = this.calculateOnePosition(radius, 150, i,
                length);

            object.setObjectPositions();
        }
    },

    /** Calculate the position of one object placed on a polygon edge
     * @param {Number} radius - The radius of the polygon
     * @param {Number} y - The y position of the object
     * @param {Number} objNum - The number of the current object in the list
     * @param {Number} numObjs - The number of objects
     * @return {THREE.Vector3} vector - The new x, y, z-position of the object
     */
    calculateOnePosition: function(radius, y, objNum, numObjs) {
        var vector = new THREE.Vector3();
        var phi = 2*Math.PI * objNum/numObjs;

        vector.x = radius * Math.cos( phi );
        vector.y = y;
        vector.z = radius * Math.sin( phi );

        return vector;
    },

    /** Position an object at the edge of a polygon so that the top of it
     *  is parallel to the user and
     *  close enough to the camera to roughly match the width of the screen
     * @param {Number} objNum - The number of the current object in the list
     * @param {FrameGroup[]|MapManager[]} objList - The list of objects
     * @return {THREE.Vector3} - The new x, y, z-position of the object
     */
    getFrameTopInFocusPos: function(objNum, objList) {
        return this.getFrameInFocusPos (objNum, objList,
            -objList[objNum].frameHeight/3);
    },

    /** Position an object so that its width roughly fits the width of the screen
     *  and so that it is placed at the edge of a polygon
     * @param {Number} objNum - The number of the current object in the list
     * @param {FrameGroup[]|MapManager[]} objList - The list of objects
     * @param {Number} y - The y-position of the object
     * @return {THREE.Vector3} focusPos - The new x, y, z-position of the object
     */
    getFrameInFocusPos: function(objNum, objList, y) {
        var framePush = objList[objNum].frameWidth/window.innerWidth *
            renderer.getFOV(camera) * 1.1;
        var focusPos = this.calculateOnePosition(framePush,
            y, objNum, objList.length);

        return focusPos;
    }
});