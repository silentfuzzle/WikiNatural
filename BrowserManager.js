/**
 * Created with JetBrains WebStorm.
 * @author Adam McManigal, Emily Palmieri, and Heather Shadoan
 * @class
 * Manages all the pages the user has navigated. A cache, stores previously
 * visited pages in case the user returns and loading new pages that have not been visited. 
 * A global instance of it is used in the NWEventHandler.
 * @default If a different method for retrieving Wiki HTML is not defined YQL is used.
 */

var BrowserManager = new Class({

    /*Element Names*/
    frameClassName: 'frame',
    defaultFrameType: 'div',
    defaultFrameID: 'simpleSearch',
    defaultTextboxID: 'searchInput',
    searchTitle: "Search Wikipedia",
    searchButtonType: 'submit',
    defaultPageManagerName: 'wikiStart',
    activePage: undefined,
	
	/*Default Start Page*/
	startPage: "http://en.wikipedia.org/wiki/Ada_Lovelace",


    /*Uses the page url as a key to retrieve different PageManager objects*/
    siteDictionary: {},
    FOVSettings: [],         // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
    FOVCalculations: new Array(60,60,65,95,75,75,55,45,40,46,42,40,35,33,33,30,25,25),

    /*The main event handler object for the program*/
    eventHandler: undefined,

    /*State Management*/
    mapDisplayed: false,
	
	/*Dependent Objects*/
    webContentManager: undefined,
    mapManager: undefined,
    currentScene: undefined,
    currentCamera: undefined,
    animationManager: undefined,

 /**
	* @author: Adam McManigal
	* @param {THREE.scene} scene A Three.js scene.
	* @param {THREE.camera} camera A Three.js camera.
	* @param {string} startURL The Wikipedia page to start on. 
	* @constructor
	*/
    initialize: function(scene, camera, startURL){

        /*Initializes utility objects*/
            this.eventHandler = new NWEventHandler(this);
            this.webContentManager = new WebContentManager();
            console.log("Event Check");
            console.log(this.eventHandler.browserManager);

        if(!scene)
            console.log("Please include a scene.");
        if(!camera)
            console.log("Please include a camera.");
		if(startURL)
			this.startPage = startURL;

        this.currentScene = scene;
        this.currentCamera = camera;

        this.animationManager = new AnimationManager();

        /*Builds Map*/
        this.initFOVArray();
        this.mapManager = new MapManager(scene);

        /*Initializes the first page*/
        this.loadPage(this.startPage, scene, camera);
    },
	
	/**
	* @author Adam McManigal
	* @description Loads a page and displays it in a scene
	* @param {string} url The Wikipedia page to load. 
	* @param {THREE.scene} scene A Three.js scene.
	* @param {THREE.camera} camera A Three.js camera.
	*/
    loadPage: function(url, scene, camera){
        console.log("load page");

        /*Check if the page has already been loaded. Otherwise load the page.*/
        if(this.siteDictionary[url]){

            this.activatePage(this.siteDictionary[url], scene, camera);
        }
        else{

            /*Load URL information into the page*/
            var page = new PageManager(this.eventHandler);
            this.siteDictionary[url] = page;
            this.webContentManager.getHTML(url, page);
            this.waitForLoad(page, scene, camera, this);
        }
    },

	/**
	* @author Adam McManigal
	* @description Ensure that a page has been loaded before it is displayed
	* @param {PageManager} page The PageManager that holds the info. 
	* @param {THREE.scene} scene A Three.js scene.
	* @param {THREE.camera} camera A Three.js camera.
	* @param {function} callback The method to call when the page has loaded.
	*/
    waitForLoad: function(page, scene, camera, callback){

        if(!page.allGroupsCreated){
            setTimeout(function(){
                callback.waitForLoad(page, scene, camera, callback);
            }, 500);
        }
        else{
            if (this.activePage === undefined) {
                this.mapManager.addIcon(page.pageIcon, null);
            }
            else {
                this.mapManager.addIcon(page.pageIcon, this.activePage.pageIcon);
            }

            this.animationManager.calculateFramePositions(page.groupList);
            this.activatePage(page, scene, camera);

        }

    },

	/**
	* @author Adam McManigal & Emily Palmieri
	* @description Displays the information in a PageManager object
	* @param {PageManager} page The PageManager that holds the info. 
	* @param {THREE.scene} scene A Three.js scene.
	* @param {THREE.camera} camera A Three.js camera.
	*/
    activatePage: function(page, scene, camera){
        console.log("activate page");

        /*Removes current page*/
        if(this.activePage && this.activePage !== page){
             this.deactivatePage(this.activePage, scene);
        }
        /*Displays new page*/
        page.addFramesToScene(scene);

        this.adjustCamera(camera, page.groupList.length);
        this.activePage = page;

        // TODO: Added
        // Change the map position so that users begin facing this page's node
        var mapNode = this.mapManager.rootNode.findIcon(page.pageIcon);
        this.mapManager.setCurrPosition(mapNode);

        initializeControls();
    },
	/**
	* @author Adam McManigal
	* @description Deactivates all frames belonging to the page manager
	* @param {PageManager} page The PageManager to deactivate. 
	* @param {THREE.scene} scene A Three.js scene.
	*/
    deactivatePage: function(page, scene){

        /*Removes the CSS3DObjects from the scene*/
        page.removeFramesFromScene(scene);

    },
	/**
	* @author Adam McManigal & Emily Palmieri
	* @description Displays the map.
	*/
    /*Displays the map object*/
    displayMap: function(){
        if(this.mapDisplayed){
            this.mapManager.deactivateMap(this.scene);
            this.activatePage(this.activePage, this.currentScene, this.currentCamera)
            this.mapDisplayed = false;
        }
        else{
            this.mapManager.activateMap(this.scene);


            //TODO: Make this use the adjustCamera function.
            this.currentCamera.fov = 60;
            this.deactivatePage(this.activePage, this.currentScene);
            this.mapManager.setPositionVec(this.animationManager);
            this.mapDisplayed = true;
        }
    },
	
	/**
	* @author: Heather Shadoan
	* @description Initialize the fields of view
	*/
    initFOVArray: function(){
	
        this.FOVSettings[0] = 60;
        for(var frames = 1; frames < this.FOVCalculations.length; frames++)
        {
            var setFov = this.FOVCalculations[frames];
            this.FOVSettings[frames] = setFov ;
        }

    },
	/**
	* @author: Heather Shadoan
	* @description Sets the camera field of view to match the number of frames in the scene 
	* @param {THREE.scene} scene A Three.js scene.
	* @param {Number} numOfFrames The number of frames in the scene.
	*/
    adjustCamera: function(camera, numOfFrames){

        camera.fov = this.FOVSettings[numOfFrames];


    }


});
