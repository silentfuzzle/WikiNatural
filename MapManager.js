/**
 * @author Adam McManigal & Emily Palmieri
 * @class
 * Responsible for storing the position and facing of the map, displaying the
 * map, adding new icons to the map, and organizing the Elements on the map
 */

var MapManager = new Class({

    rootNode: null,
    frameWidth: 8300,
    frameHeight: 5000,
    // TODO: These values must to be adjusted for the fov,
    // TODO: frame size, and window size to compensate for camera bug
    minDistance: 1700,
    maxDistance: 5000,

    currXPosition: 0,
    currYPosition: 0,
    position: undefined,
    rotation: undefined,
    up: undefined,
    scale: undefined,

    iconMap: undefined,
    css3DMap: undefined,

    /** Setup the map, add it to the scene, and hide it
     * @param {THREE.Scene} scene - The scene to display the map in
     */
    initialize: function(scene){
        this.iconMap = new Element('div', {
            'class': 'wiki_map',
            styles: {
                width: String(this.frameWidth) + 'px',
                height: String(this.frameHeight) + 'px'
            }

        });

        this.up = new THREE.Vector3(0 , 1, 0);
        this.scale = new THREE.Vector3(2, 2, 2);

        this.css3DMap = new THREE.CSS3DSprite(this.iconMap);
        this.css3DMap.up = this.up;
        this.css3DMap.scale = this.scale;

        scene.add(this.css3DMap);
        this.deactivateMap(scene);
    },

    /** Set the map's position and face it at the user
     * @param {AnimationManager} animationManager - Provides functions for the
     *        MapManager to use in positioning the map
     */
    setPositionVec: function(animationManager) {
        var elemList = [];
        elemList.push(this);

        this.position = animationManager.getFrameInFocusPos(0, elemList,
            -this.frameHeight);
        this.position.x = this.maxDistance;
        this.css3DMap.position = this.position;

        var vector = new THREE.Vector3();
        vector.x = this.position.x;
        vector.y = this.position.y;
        vector.z = this.position.z;
        vector.x *= -1;
        vector.z *= -1;

        this.css3DMap.lookAt(vector);
    },

    /** Keeps the frame in the camera's view
     * @param {THREE.Vector3} cameraPos - The x, y, and z-position of the camera
     */
    checkPosition: function(cameraPos) {
        var frameFraction = this.frameWidth;
        if (Math.abs(this.position.z - cameraPos.z) > frameFraction) {
            if (this.position.z < cameraPos.z) {
                this.position.z = -frameFraction + cameraPos.z;
            }
            else {
                this.position.z = frameFraction + cameraPos.z;
            }
        }

        frameFraction = this.frameHeight;
        if (Math.abs(this.position.y - cameraPos.y) > frameFraction) {
            if (this.position.y < cameraPos.y) {
                this.position.y = -frameFraction + cameraPos.y;
            }
            else {
                this.position.y = frameFraction + cameraPos.y;
            }
        }

        this.position.x = Math.max(this.minDistance,
            Math.min(this.position.x, this.maxDistance));
    },

    /** Moves the map so that the user starts facing the node of the most
     *  recently visited page
     */
    animBeforeUser: function() {
        var endVector = new THREE.Vector3();
        endVector.set(this.position.x, this.currYPosition, this.currXPosition);

        new TWEEN.Tween( this.position )
            .to( { x: endVector.x, y: endVector.y, z: endVector.z }, 2000 )
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .start();
    },

    /** Set the position of the map so the user starts facing the node of
     *  the most recently visited page
     *  @param {MapNode} mapNode - The map node to face the camera at
     */
    setCurrPosition: function(mapNode) {
        if (mapNode.xPos <= this.frameWidth/2) {
            this.currXPosition = this.frameWidth/2 - mapNode.xPos;
        }
        else {
            this.currXPosition = -mapNode.xPos;
        }

        if (mapNode.yPos <= this.frameHeight/2) {
            this.currYPosition = -this.frameHeight/2 + mapNode.yPos;
        }
        else {
            this.currYPosition = mapNode.yPos;
        }
    },

    /** Adds a new page icon to the map
     * @param {Element} element - The page icon of the page to add to the map
     * @param {Element} par - The page icon of the current page
     */
    addIcon: function(element, par) {

        // If this is the first visited page, make it the root
        if (this.rootNode === null) {
            this.rootNode = new MapNode(element);
        }
        else {

            // Otherwise, make this page a child of the given parent page
            var parent = this.rootNode.findIcon(par);
            parent.addChild(element);
        }

        // Check that the map height is tall enough
        var testHeight = this.rootNode.getDiameter()+this.rootNode.yPos
            +this.rootNode.nodeDiameter;
        if (testHeight >= this.frameHeight) {
            this.frameHeight += this.rootNode.nodeDiameter*5;
            this.iconMap.style.height = String(this.frameHeight) + 'px';
        }

        // Check that the map width is wide enough
        var numLayers = this.rootNode.breadthFirstSearch(0);
        var testWidth = (numLayers*this.rootNode.nodeDiameter)
            + (numLayers*
            (this.rootNode.nodeChildDist-this.rootNode.nodeDiameter))
            + this.rootNode.xPos;
        if (testWidth >= this.frameWidth) {
            this.frameWidth += this.rootNode.nodeDiameter*5;
            this.iconMap.style.width = String(this.frameWidth) + 'px';
        }

        // Display the new node
        this.rootNode.draw(this.setPositions);
        element.inject(this.iconMap);
    },

    /** Displays the map
     */
    activateMap: function(){

        this.css3DMap.element.style.display = "";
        this.css3DMap.visible = true;
    },

    /** Hides the map
     */
    deactivateMap: function(){

        this.css3DMap.element.style.display = "none";
        this.css3DMap.visible = false;
    },

    /** Positions nodes in a tree structure, branching right and down
     * @param {MapNode} pNode - The root/parent of the current branch
     */
    setPositions: function (pNode) {
        var numNodes = pNode.children.length;
        var currYPos = pNode.yPos;

        for (var i = 0; i < numNodes; i++) {
            var child = pNode.children[i];
            child.yPos = currYPos;
            currYPos += child.getDiameter() + pNode.spacing;
            child.xPos = pNode.xPos + pNode.nodeChildDist;
        }
    }
});
