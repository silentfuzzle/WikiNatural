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
    siteDictionary: {},      // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
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
        this.animationManager = new AnimationManager();
        this.mapManager = new MapManager(scene);

        this.currentScene = scene;
        this.currentCamera = camera;

        /*Initializes the first page*/
        if(startURL)
            this.startPage = startURL;
        this.loadPage(this.startPage);
    },
	
	/**
	* @author Adam McManigal
	* @description Loads a page and displays it in a scene
	* @param {string} url The Wikipedia page to load.
	*/
    loadPage: function(url){

        /*Check if the page has already been loaded. Otherwise load the page.*/
        if(this.siteDictionary[url]){

            this.activatePage(this.siteDictionary[url]);
        }
        else{

            /*Load URL information into the page*/
            var page = new PageManager(this.eventHandler);
            this.siteDictionary[url] = page;
            this.webContentManager.getHTML(url, page);
            this.waitForLoad(page, this);
        }
    },

	/**
	* @author Adam McManigal
	* @description Ensure that a page has been loaded before it is displayed
	* @param {PageManager} page The PageManager that holds the info.
	* @param {function} callback The method to call when the page has loaded.
	*/
    waitForLoad: function(page, callback){

        if(!page.allGroupsCreated){
            setTimeout(function(){
                callback.waitForLoad(page, callback);
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
            this.activatePage(page);
        }
    },

	/**
	* @author Adam McManigal & Emily Palmieri
	* @description Displays the information in a PageManager object
	* @param {PageManager} page The PageManager that holds the info.
	*/
    activatePage: function(page){

        /*Removes current page*/
        if(this.activePage && this.activePage !== page){
             this.deactivatePage(this.activePage);
        }

        /*Displays new page*/
        page.addFramesToScene(this.currentScene);
        this.activePage = page;

        // Change the map position so that users begin facing this page's node
        var mapNode = this.mapManager.rootNode.findIcon(page.pageIcon);
        this.mapManager.setCurrPosition(mapNode);

        // Change the camera's FOV so that the panels don't disappear
        var index = page.groupList.length;
        if (index >= this.FOVCalculations.length)
            index = this.FOVCalculations.length - 1;
        this.currentCamera.fov = this.FOVCalculations[index];

        // Make sure the web page controls are initialized
        initializeControls();
    },

	/**
	* @author Adam McManigal
	* @description Deactivates all frames belonging to the page manager
	* @param {PageManager} page The PageManager to deactivate.
	*/
    deactivatePage: function(page){

        /*Removes the CSS3DObjects from the scene*/
        page.removeFramesFromScene(this.currentScene);
    },

	/**
	* @author Adam McManigal & Emily Palmieri
	* @description Displays or hides the map.
	*/
    displayMap: function(){

        if(this.mapDisplayed){

            // Hide the map and display the active web page
            this.mapManager.deactivateMap();
            this.activatePage(this.activePage);
            this.mapDisplayed = false;
        }
        else{

            // Display the map and hide the active web page
            this.mapManager.activateMap(this.scene);
            this.currentCamera.fov = 60;
            this.mapManager.setPositionVec(this.animationManager);
            this.deactivatePage(this.activePage);
            this.mapDisplayed = true;
        }
    }
});
