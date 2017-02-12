/**
 * @author Adam McManigal & Emily Palmieri
 * @class
 * These are the event handlers used to handle links and frame switches.
 */

var NWEventHandler = new Class({
    lastCamera: null,

    /** Adds global event listeners
     * @constructor
     */
    initialize: function(){
        document.addEventListener( 'keydown', this.handleKeys, false);
        document.addEventListener( 'mousewheel', this.handleWheel, false );
        document.addEventListener( 'DOMMouseScroll', this.handleWheel, false );

    },

    /** Handles clicked links on frames
     * @param event - mouse click
     */
    handleLink: function(event){
        event.preventDefault();
        event.stopPropagation();

        var newURL = this.href;
        var citCheck = newURL.search(/#cite_note/);
        var wikiCheck = newURL.search(/wiki\//);

        if(citCheck > 0) {}
        else if(wikiCheck > 0)
        {
            newURL = newURL.replace(/^.*?(?=wiki)/, 'http://en.wikipedia.org/');
            browserManager.loadPage(newURL, scene, camera);
        }
        else{
            window.open(this.href);
        }

        // Unlock the controls if the user is in frame view
        if (controls === null) {
            controls = browserManager.eventHandler.lastCamera;
            browserManager.activePage.unfocusPrevFrame(-1);
        }
    },

    /** Brings a frame into and out of focus
     * @param event - mouse click
     */
    handleTransition: function(event){
        event.preventDefault();
        event.stopPropagation();
        var groupNum = Number(this.getAttribute('groupNumber'));
        var page = browserManager.activePage;

        // Transition from frame in focus to movement controls
        if (page.groupList[groupNum].focus === true) {
            controls = browserManager.eventHandler.lastCamera;
        }

        // Transition from movement controls to frame in focus
        else {
            var group = page.groupList[groupNum];
            var lookAtVec = group.CSS3DObjectList[group.currentFrame].position;
            browserManager.eventHandler.faceCameraAnim(lookAtVec);

            page.unfocusPrevFrame(groupNum);
        }

        var focusPos = browserManager.animationManager.getFrameTopInFocusPos(
            groupNum, page.groupList);
        page.groupList[groupNum].toggleFocus(focusPos);
    },

    /** Swaps the current frame in the frame group to the next frame
     * @param event - mouse click or key press
     */
    handleSwapRight: function(event) {
        event.preventDefault();
        event.stopPropagation();

        var groupNum = Number(this.getAttribute('groupNumber'));
        browserManager.eventHandler.handleSwap(groupNum, true);
    },

    /** Swaps the current frame in the frame group to the previous frame
     * @param event - mouse click or key press
     */
    handleSwapLeft: function(event) {
        event.preventDefault();
        event.stopPropagation();

        var groupNum = Number(this.getAttribute('groupNumber'));
        browserManager.eventHandler.handleSwap(groupNum, false);
    },

    /** Changes the frame in a given frame group
     * @param {Number} groupNum - The number of the group to manipulate
     * @param {Boolean} next - Swap to the next frame? Otherwise swap to previous
     */
    handleSwap: function(groupNum, next) {
        var page = browserManager.activePage;
        var animManager = browserManager.animationManager;
        var object = page.groupList[groupNum];
        var groupList = page.groupList;
        var newPos = new THREE.Vector3();

        if (object.focus === true) {
            newPos = animManager.getFrameTopInFocusPos(groupNum, groupList);
        }
        else {
            newPos = animManager.calculateOnePosition(animManager.getRadius(
                groupList) - 500,
                object.position.y, groupNum, groupList.length);
        }
        object.swapFrameAnim(newPos, scene, next);
    },

    /** Toggles the map on or off with the mouse
     * @param event - mouse click
     */
    activateMap: function(event){
        event.preventDefault();
        event.stopPropagation();

        browserManager.eventHandler.toggleMap();
    },

    /** Toggles the map visible and sets the control scheme to navigate it
     *  Also, toggles the map invisible, displays the current web page,
     *  and sets the control scheme to view it
     */
    toggleMap: function() {
        browserManager.displayMap();

        if (browserManager.mapDisplayed === false) {
            initializeControls();
        }
        else {
            // Position the map
            var lookAt = new THREE.Vector3();
            var mapPos = browserManager.mapManager.position;
            lookAt.set(mapPos.x, camera.position.y, mapPos.z);
            browserManager.eventHandler.faceCameraAnim(lookAt);
            browserManager.mapManager.animBeforeUser();

            initializeSlideControls();

            // Unfocus all frame groups on the current page
            browserManager.activePage.unfocusPrevFrame(-1);
        }
    },

    /** Handles switching between pages after clicking page icons on the map
     * @param event - mouse click
     */
    activateMapLink: function(event){
        event.preventDefault();
        event.stopPropagation();

        var url = String(this.getAttribute('pageurl'));
        browserManager.displayMap();
        browserManager.loadPage(url, scene, camera);
    },

    /** Swap between frames in a frame group and toggle the map on and off
     *  with keyboard shortcuts
     * @param event - key pressed
     */
    handleKeys: function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.keyCode === 77) {
            browserManager.eventHandler.toggleMap();
        }
        else {
            var groupList = browserManager.activePage.groupList;
            for (var i=0; i < groupList.length; i++) {

                // Swap to next frame if right arrow and frame in focus
                if (event.keyCode === 39 && groupList[i].focus === true) {
                    browserManager.eventHandler.handleSwap(i, true);
                }

                // Swap to previous frame if left arrow and frame in focus
                else if (event.keyCode === 37 && groupList[i].focus === true) {
                    browserManager.eventHandler.handleSwap(i, false);
                }
            }
        }
    },

    /** Smoothly remove the control scheme and face the camera at a given
     *  point
     * @param {THREE.Vector3} lookAtVec - The position to face the camera at
     */
    faceCameraAnim: function(lookAtVec) {

        // Save current camera rotation
        var startVector = new THREE.Vector3();
        startVector.copy(camera.rotation);

        // Face camera at frame
        var endVector = new THREE.Vector3();
        camera.lookAt(lookAtVec);
        endVector.copy(camera.rotation);

        // Disable the controls
        if (controls !== null) {
            browserManager.eventHandler.lastCamera = controls;
            controls = null;
        }

        // Tween the camera to face the frame
        camera.rotation = startVector;
        new TWEEN.Tween( camera.rotation )
            .to( { x: endVector.x, y: endVector.y, z: endVector.z }, 2000 )
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .start();
    },

    /** Move the frame that's in focus up and down
     * @param event - mouse wheel
     */
    handleWheel: function(event) {
        event.preventDefault();
        event.stopPropagation();
        var page = browserManager.activePage;
        for (var i=0; i < page.groupList.length; i++) {
            page.scrollHandler(event.wheelDelta, i);
        }
    }
});