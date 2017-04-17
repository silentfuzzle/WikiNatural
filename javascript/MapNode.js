/**
 * @author Emily Palmieri
 * @class
 * Stores information needed to position page icon elements on the map
 */

var MapNode = new Class({
    xPos: 300,
    yPos: 100,

    nodeChildDist: 0,       // distance between this node and its children
    // TODO: Make sure this matches CSS
    nodeDiameter: 600,      // diameter of this node
    childrenDiameter: 0,    // total diameter of children including spaces
    spacing: 0,             // spacing between children

    children: [],
    parent: null,
    pageIcon: null,

    /** 
     * Sets up a new MapNode
     * @param {Element} curr - The icon for a page on the map
	 * @constructor
     */
    initialize: function(curr) {
        this.nodeChildDist = 2 * this.nodeDiameter;
        this.spacing = this.nodeDiameter;
        this.pageIcon = curr;
        this.parent = null;
    },

    /** Sets a new position for this page icon and all its children on the map
     * @param {function} orgFunction - The algorithm for placing icons
     */
    draw: function(orgFunction) {
        orgFunction(this);
        this.pageIcon.setStyles({
            top: String(this.yPos) + 'px',
            left: String(this.xPos) + 'px'
        });

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw(orgFunction);
        }
    },

    /** Returns the greatest diameter between self and all children
     * @return {Number}
     */
    getDiameter: function() {
        if (this.childrenDiameter > this.nodeDiameter) {
            return this.childrenDiameter;
        }
        else {
            return this.nodeDiameter;
        }
    },

    /** Updates children diameter recursively when a new child is added
     */
    updateDiameter: function() {
        // Recalculate children diameter
        this.childrenDiameter = 0;
        for (var i=0; i < this.children.length; i++) {
            if (i !== 0) {
                this.childrenDiameter += this.spacing;
            }
            this.childrenDiameter += this.children[i].getDiameter();
        }

        // Update the parent's children diameter
        if (this.parent !== null) {
            this.parent.updateDiameter();
        }
    },

    /** Add a new child
     * @param {Element} childIcon - The page icon of the new child
     * @return {MapNode} - The new child
     */
    addChild: function(childIcon) {
        // Create child
        var newChild = new MapNode(childIcon);
        newChild.parent = this;
        this.children.push(newChild);

        // Update self
        this.childrenDiameter += newChild.getDiameter();
        if (this.children.length !== 1) {
            this.childrenDiameter += this.spacing;
        }
        if (newChild.nodeChildDist > this.nodeChildDist) {
            this.nodeChildDist = newChild.nodeChildDist;
        }

        // Update parent
        if (this.parent !== null) {
            this.parent.updateDiameter();
        }

        return newChild;
    },

    /** Searches through the tree of nodes for the one with the given page icon
     * @param {Element} pageIcon - The page icon to search for
     * @return {MapNode} - The MapNode with the given page icon
     */
    findIcon: function(pageIcon) {
        var found = null;
        if (this.pageIcon === pageIcon) {
            found = this;
        }
        else {
            for (var i=0; i < this.children.length; i++) {
                var temp = this.children[i].findIcon(pageIcon);
                if (temp !== null) {
                    found = temp;
                }
            }
        }

        return found;
    },

    /** Returns the deepest layer of the tree
     * @param {Number} lastLayer - The previous level
     * @return {Number} - The deepest level
     */
    breadthFirstSearch: function(lastLayer) {
        var deepestLayer = 0;
        for (var i=0; i < this.children.length; i++) {
            deepestLayer = this.children[i].breadthFirstSearch(lastLayer+1);
        }

        return Math.max(lastLayer+1, deepestLayer);
    }
});