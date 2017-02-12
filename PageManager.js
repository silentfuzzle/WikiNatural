/**
 * @author Adam McManigal & Emily Palmieri
 * @class
 * Responsible for managing and organizing high level content on a single Wikipedia
 * page including: <ol>
 * <li>Creating CSS3D frames that can be displayed in a 3D environment.</li>
 * <li>Altering the dimensions of the frames.</li>
 * <li>Organizing frames into display groups.</li>
 * <li>Determining frame display order using the FrameGroup class.</li>
 * 
 */

var PageManager = new Class({

    pageURL: "",

    /*DOM Element Names & Types*/
    htmlPageContainer: 'pages',
    pageClassName: 'page_container',
    frameClassName: 'frame',
    frameElType: 'div',
    frameContCName: 'frame_cont',
    switchLeftCName: 'frame_left',
    switchRightCName: 'frame_right',

    /*Content Lists*/
    groupList: [],
    elementList: [],
    elementsProcessed: 0,
    numberOfGroups: 0,
    currentGroup: undefined,
    currentFrame: undefined,
    currentFrameContainer: undefined,
    pageIcon: undefined,
    frameScale: 1,

    /*Concurrency Management*/
    allElementsLoaded: false,
    allGroupsCreated: false,

    /*Location Parameters*/
    defaultFrameHeight: 5250,
    maxPageIconPics: 3,
    currentIconPics: 0,

    /*User Interaction*/
    eventHandler: null,
	
	/** 
	 * @author: Adam McManigal
     * @description Retrieves HTML using the Yahoo Query Language service
	 * @param {NWEventHandler} eventHandle The object containing needed event handling methods.
	 * @constructor
	 */
    initialize: function(eventHandle){

        this.eventHandler = eventHandle;
    },

    /*
     * Frame Creation Methods
     */
	/** 
	 * @author: Adam McManigal
     * @description Builds the elements for the CSS3D frames
	 * @param {NWEventHandler} eventHandle The object containing needed event handling methods.
	 */
    generateFrameGroups: function(){

        this.allGroupsCreated = false;
        this.elementsProcessed = 0;

        if(this.allElementsLoaded){

            /*Add url to page icon*/
            if(this.pageIcon){
                this.pageIcon.setAttribute('pageURL', this.pageURL);
                this.pageIcon.addEvent('click', this.eventHandler.activateMapLink);
            }

            /*Creates the first FrameGroup*/
            this.currentGroup = new FrameGroup(this.defaultFrameHeight);

            this.createFrameContainer();


            for(var i = 0; i < this.elementList.length; i++){

                this.elementsProcessed++;
                this.processElement(this.elementList[i]);
            }

            /*Adds the last frame to the current group*/
            this.currentGroup.addCSS3DObject(new THREE.CSS3DSprite(this.currentFrameContainer));
            this.groupList.push(this.currentGroup);
            this.currentGroup.addFrameElement(this.currentFrameContainer);
            this.currentFrameContainer.dispose();

            for(i = 0; i < this.groupList.length; i++)
            {
                this.updateGroupPageNumbers(i);
            }

            /*Adds the selected link handler to the links*/
            var links = this.currentFrame.getElements('a');
            links.addEvent('click', this.eventHandler.handleLink);

            this.allGroupsCreated = true;
        }

    },
	/** 
	 * @author: Adam McManigal
     * @description Uses placement rules to determine how elements are added to frames.
	 * @param {Element} element The current MooTools Element bing added.
	 */
    processElement: function(element){

        if(this.isInfobox(element)){
            this.addInfobox(element);
        }
        else if(this.isH2Header(element)){
            this.addNewGroup(element);
        }
		else if(this.isReflist(element)){
            this.addRefList(element);
        }
        else{
            this.addElement(element);
        }
    },
	/** 
	 * @author: Adam McManigal
     * @description Adds an infobox to the current frame.
	 * @param {Element} element A wiki_infobox HTML element.
	 */
    addInfobox: function(element){

        this.currentFrame.appendChild(element);

    },

	/** 
	 * @author: Adam McManigal
     * @description Adds a reference list to the current frame.
	 * @param {Element} element A wiki_reflist HTML element.
	 */
	addRefList: function(element){
        this.currentFrame.appendChild(element);
    },

	/** 
	 * @author: Adam McManigal
     * @description Creates a new frame group.
	 * @param {Element} element The current HTML element being added to the frames.
	 */
    addNewGroup: function(element){

		/*Updates frameGroup information*/
        this.numberOfGroups++;
        this.swapCurrentFrame();

        for(i = 0; i < this.currentGroup.length; i++)
        {
            this.currentGroup[i].frustumCulled = false;
        }

        /*Swap the group*/
        this.groupList.push(this.currentGroup);
        this.currentGroup = new FrameGroup(this.defaultFrameHeight);

        /*Adds the new element to the frame*/
        this.currentFrame.appendChild(element);
    },

	/** 
	 * @author: Adam McManigal
     * @description Adds page numbers to all the frames of the group.
	 * @param {Number} groupNum Which FrameGroup to update.
	 */
    updateGroupPageNumbers: function(groupNum){

        var list = this.groupList[groupNum].frameElementList;
        var temp;
        for(var i = 0; i < list.length; i++){
            temp = list[i].getElement('.group_status_text');
            temp.innerText = "Page " + (i+1) + "/" + (list.length);
        }
    },

	/** 
	 * @author: Adam McManigal
     * @description Adds a regular element to the current frame if there's enough room.
	 * @param {Element} element The current HTML element being added to the frames.
	 */
    addElement: function(element){

        var extraHeader = undefined;

        /*Add the child to the current frame*/
        this.currentFrame.appendChild(element);

        /*If the content is outside the frame's lower bound*/
	    if(element.getBoundingClientRect().bottom > this.currentFrame.getBoundingClientRect().bottom - 200){

            /*Remove the last element added*/
            element.dispose();

            /*Make sure that there isn't a header at the bottom of the frame*/
            if(this.elementsProcessed > 1 && this.isHeader(this.elementList[this.elementsProcessed - 2])){

                this.elementList[this.elementsProcessed - 2].dispose();
                extraHeader = this.elementList[this.elementsProcessed - 2];
            }

            this.swapCurrentFrame();

            /*If the element before this element was a header, add it to the new frame*/
            if(extraHeader){
                this.currentFrame.appendChild(extraHeader);
            }
            this.currentFrame.appendChild(element);
        }

    },
	/** 
	 * @author: Adam McManigal
     * @description Creates a new frame container.
	 */
    swapCurrentFrame: function(){

        /*Adds the selected link handler to the links*/
        var links = this.currentFrame.getElements('a');
        links.addEvent('click', this.eventHandler.handleLink);

        /*Create CSS3D object*/
        this.currentGroup.addCSS3DObject(new THREE.CSS3DSprite(this.currentFrameContainer));
        this.currentGroup.addFrameElement(this.currentFrameContainer);
        this.currentFrameContainer.dispose();

        this.createFrameContainer();
    },

	/** 
	 * @author: Adam McManigal
     * @description Creates a new frame container to hold the different page sections.
	 */
    createFrameContainer: function(){

        /*Creates the element that holds the frame and frame-switching buttons*/
        this.currentFrameContainer = new Element( 'div', {
           'class': this.frameContCName
        });

        var frameTop = this.createNavBar();

        /*Creates the buttons for changing frames*/
        var switchLeft = new Element( 'div',{
            'class': this.switchLeftCName,
            'mainUrl': this.pageURL,
            'groupNumber': this.numberOfGroups
        });
        switchLeft.addEvent('click', this.eventHandler.handleSwapLeft);

        /*The element that indicates what the switchLeft button is used for*/
		var leftIndicate = new Element ('span', {
            'class': 'left',
            text: 'PREVIOUS'
        });

        leftIndicate.inject(switchLeft);

        var switchRight = new Element( 'div',{
            'class': this.switchRightCName,
            'mainUrl': this.pageURL,
            'groupNumber': this.numberOfGroups
        });
        switchRight.addEvent('click', this.eventHandler.handleSwapRight);

        /*The element that indicates what the switchRight button is used for*/
        var rightIndicate = new Element ('span', {
            'class': 'right',
            text: 'NEXT'
        });

        rightIndicate.inject(switchRight);

        /*Add the element to a new, empty frame*/
        this.currentFrame = new Element( this.frameElType , {
            'class': this.frameClassName,
            'mainUrl': this.pageURL,
            'groupNumber': this.numberOfGroups
        });

        this.currentFrame.addEvent('click', this.eventHandler.handleTransition);
        /*Adds the elements to the container*/
        this.currentFrameContainer.inject(this.htmlPageContainer);
		frameTop.inject(this.currentFrameContainer);
        
        switchLeft.inject(this.currentFrameContainer);
        this.currentFrame.inject(this.currentFrameContainer);
        switchRight.inject(this.currentFrameContainer);
    },
	/** 
	 * @author Adam McManigal
     * @description Creates a new navigation bar for each new frame container.
	 * @returns {HTMLElement} The nav bar for the new page.
	 */
    createNavBar: function(){
        /*Creates the top div elements that links to navigation*/
        var frameTop = new Element( 'div', {
            'class': 'nav_header'
        });

        /*Lets the user activate the map*/
        var mapButton = new Element( 'div', {
            'class': 'map_button'
        });
        var mapButtonText = new Element('span', {
            'class': 'map_button_text',
            text: 'Map'
        });
        mapButtonText.inject(mapButton);
        mapButton.addEvent('click', this.eventHandler.activateMap);

        /*Lets the user go to the original wiki page.*/
        var wikiPageLink = new Element( 'div', {
            'class': 'wiki_page_link'
        });
        var wikiPageLinkText = new Element('span', {
            'class': 'wiki_page_link_text',
            text: ''
        });
        wikiPageLinkText.inject(wikiPageLink);


        /*Lets the user know how many pages are in the frame, and what page they're on*/
        var wikiGroupStatus = new Element( 'div', {
            'class': 'group_status'
        });
        var wikiGroupStatusText = new Element('span', {
            'class': 'group_status_text',
            text: 'Page 1/8'
        });
        wikiGroupStatusText.inject(wikiGroupStatus);


        /*Combine the elements into a header*/
        mapButton.inject(frameTop);
        wikiPageLink.inject(frameTop);
        wikiGroupStatus.inject(frameTop);

        return frameTop;
    },

	/** 
	 * @author Emily Palmieri
     * @description Searches for any frames that were previously in focus and shouldn't be.
	 * @param {FrameGroup} newFocusFrame The frame that should be in focus.
	 */
    unfocusPrevFrame: function(newFocusFrame) {
        for (var i=0; i < this.groupList.length; i++) {
            var group = this.groupList[i];
            if(i !== newFocusFrame && group.focus === true) {
                group.toggleFocus(new THREE.Vector3());
            }
        }
    },
	/** 
	 * @author Adam McManigal
     * @description Adds the current frame of all the FrameGroups to the scene.
	 * @param {THREE.scene} scene The THREE.js scene to add the frame to.
	 */
    addFramesToScene: function(scene){
        for(var i = 0; i < this.groupList.length; i++){
            console.log("Added Frame to Scene");
            var temp = this.groupList[i].displayCurrentFrame(scene, this.frameScale);
        }

    },

	/** 
	 * @author Adam McManigal
     * @description Removes the current frame of all the FrameGroups to the scene.
	 * @param {THREE.scene} scene The THREE.js scene to add the frame to.
	 */
    /*Make all visible frames invisible*/
    removeFramesFromScene: function(scene){

        for(var i = 0; i < this.groupList.length; i++){

            var temp = this.groupList[i].getCurrentFrame();
            temp.element.style.display = "none";
            temp.visible = false;
        }
    },

    scrollHandler: function(wheelDelta, group) {

        var frameGroup = this.groupList[group];
        if (frameGroup.focus === true) {

            var moveFrame = frameGroup.CSS3DObjectList[frameGroup.currentFrame];
            var testPosition = moveFrame.position.y - wheelDelta;

            if (Math.abs(testPosition) > frameGroup.frameHeight/2) {
                if (testPosition < 0) {
                    testPosition = -frameGroup.frameHeight/2;
                }
                else {
                    testPosition = frameGroup.frameHeight/2;
                }
            }
            moveFrame.position.y = testPosition;
        }
    },

        /*Check whether the element is an infobox*/
        isInfobox:function(element){

            var name = element.className;
            if(name === 'wiki_infobox'){
                return true;
            }
            else{
                return false;
            }
        },

		isReflist: function(element){
            var name = element.className;
            if(name === 'wiki_reflist'){
                return true;
            }
            return false;
        },

        isHeader: function(element){
            var name = element.localName;
            if(name === 'h3' || name === 'h4'){
                return true;
            }
            return false;
        },

        isH2Header: function(element){
            var name = element.localName;
            if(name === 'h2')
                return true;
            else
                return false;
        }

    });

