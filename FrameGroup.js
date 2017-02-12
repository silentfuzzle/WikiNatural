/**
 * @author Adam McManigal & Emily Palmieri
 * @class
 * This is the internal class used by the page content manager to group and
 * display the CSS3D frames in the PageContentManager.
 */

var FrameGroup = new Class({

    //Location Information
    position: new THREE.Vector3(),
    frameWidth: 3000,
    frameHeight: 5250,

    // Animation
    focus: false,
    canFlip: true,

    //The list of objects in this group
    CSS3DObjectList: [],
    frameElementList: [],

    //Attributes that manage the state of the FrameGroup
    currentFrame: 0,


    /** Sets the height of all frames in the group
     * @constructor
     * @param {Number} fHeight - The given height
     */
    initialize: function(fHeight) {
        this.frameHeight = fHeight;
    },

    /** Adds a CSS3DObject to the FrameGroup
     * @param {THREE.CSS3DObject} obj - The frame to add to the group
     */
    addCSS3DObject: function(obj){

        this.CSS3DObjectList.push(obj);
    },

    /** Adds the HTML element for a frame to the list
     * @param {Element} element - The frame element to add
     */
    addFrameElement: function(element){

        this.frameElementList.push(element);
    },

    /** Places all frames at the same starting position
     */
    setObjectPositions: function(){

        // Keep the frame perpendicular to the floor
        var vector = new THREE.Vector3();
        vector.x = this.position.x;
        vector.y = this.position.y;
        vector.z = this.position.z;
        vector.x *= -1;
        vector.z *= -1;

        for(var i = 0; i < this.CSS3DObjectList.length; i++){
            this.CSS3DObjectList[i].position.x = this.position.x;
            this.CSS3DObjectList[i].position.y = this.position.y;
            this.CSS3DObjectList[i].position.z = this.position.z;
            this.CSS3DObjectList[i].lookAt(vector)
        }
    },

    /** Toggles this frame group in and out of focus
     * @param {THREE.Vector3} focusPos - The position to move this frame group
     *      to if it is in focus
     */
    toggleFocus: function(focusPos) {
        if (this.focus === false) {
            new TWEEN.Tween( this.CSS3DObjectList[this.currentFrame].position )
                .to( { x: focusPos.x, y: focusPos.y, z: focusPos.z }, 2000 )
                .easing( TWEEN.Easing.Sinusoidal.InOut )
                .start();
            this.focus = true;
        }
        else {
            new TWEEN.Tween( this.CSS3DObjectList[this.currentFrame].position )
                .to( { x: this.position.x, y: this.position.y, z: this.position.z }, 2000 )
                .easing( TWEEN.Easing.Sinusoidal.InOut )
                .start();
            this.focus = false;
        }
    },

    /** Swaps the current frame to the next or previous frame
     * @param {THREE.Vector3} newPos - The position to move the following
     *          frame to
     * @param {THREE.Scene} scene - The scene to display the following frame in
     * @param {Boolean} next - Display the next frame if true, and the previous
     *          frame otherwise
     */
    swapFrameAnim: function(newPos, scene, next) {
        if (this.canFlip === true) {

            // Save current frame
            var prevFrame = this.currentFrame;

            if (next === true) {
                this.displayNextFrame(scene);
            }
            else {
                this.displayLastFrame(scene);
            }

            // Move previous and current frame
            var animTime = 500;

            var prevObj = this.CSS3DObjectList[prevFrame];
            var currObj = this.CSS3DObjectList[this.currentFrame];
            var finPos = new THREE.Vector3();

            if (this.focus === false) {

                currObj.position.x = newPos.x;
                currObj.position.y = newPos.y;
                currObj.position.z = newPos.z;

                finPos.set(this.position.x, this.position.y, this.position.z);
            }
            else {
                prevObj.position.x = this.position.x;
                prevObj.position.y = this.position.y;
                prevObj.position.z = this.position.z;

                finPos = newPos;
            }
            new TWEEN.Tween( currObj.position )
                .to( { x: finPos.x, y: finPos.y, z: finPos.z }, animTime )
                .easing( TWEEN.Easing.Sinusoidal.InOut )
                .start();

            // Prevent user from switching frames again until animation is done
            this.canFlip = false;
            var that = this;
            setTimeout(function() {that.canFlip = true;}, animTime+10);
        }
    },

    /** Adds the current frame to the scene
     * @param {THREE.Scene} scene - The scene to display the frame in
     * @param {Number} scale - The value to scale the frame to
     */
    displayCurrentFrame: function(scene, scale){

        /*Makes current CSS3D object invisible*/
        this.CSS3DObjectList[this.currentFrame].element.style.display = "";
        this.CSS3DObjectList[this.currentFrame].visible = true;

        if(scale)
        {
            this.CSS3DObjectList[this.currentFrame].scale = new THREE.Vector3(scale, scale, 1);
        }
        scene.add( this.CSS3DObjectList[this.currentFrame] );
    },

    /**Exchanges the current frame for the previous one in the list
     * @param {THREE.Scene} scene - The scene to display the frame in
     */
    displayLastFrame: function(scene){

        /*Makes current CSS3D object invisible*/
        this.CSS3DObjectList[this.currentFrame].element.style.display = "none";
        this.CSS3DObjectList[this.currentFrame].visible = false;

        if(this.currentFrame === 0){
            this.currentFrame = this.CSS3DObjectList.length - 1;
        }
        else{
            this.currentFrame -= 1;
        }

        this.CSS3DObjectList[this.currentFrame].element.style.display = "";
        this.CSS3DObjectList[this.currentFrame].visible = true;
        scene.add( this.CSS3DObjectList[this.currentFrame] );
    },

    /**Exchanges the current frame for the next one in the list
     * @param {THREE.Scene} scene - The scene to display the frame in
     */
    displayNextFrame: function(scene){

        this.CSS3DObjectList[this.currentFrame].element.style.display = "none";
        this.CSS3DObjectList[this.currentFrame].visible = false;

        this.currentFrame = ( this.currentFrame + 1 ) % this.CSS3DObjectList.length;

        this.CSS3DObjectList[this.currentFrame].element.style.display = "";
        this.CSS3DObjectList[this.currentFrame].visible = true;
        scene.add( this.CSS3DObjectList[this.currentFrame] );
    },

    /**Returns the current frame
     * @return {THREE.CSS3DObject} - The current frame being displayed
     */
    getCurrentFrame: function(){

        return this.CSS3DObjectList[this.currentFrame];
    }
});
