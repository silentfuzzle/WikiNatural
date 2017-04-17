/**
 * @author Adam McManigal & Heather Shadoan
 * @class Processes the elements contained in the Wiki page. Use buildWikiWlements to begin.
 * 
 */

var WikiElementsBuilder = new Class({

    wikiOriginalElements: [],//TODO: Testing purposes only
	
	/*Counters*/
    wikiElementCount: 0,
    wikiElementsProcessed: 0,
	maxPageIconPics: 3,
    currentIconPics: 0,
	
	/*Processing flags*/
    wikiElementsLoaded: false,

    
	/*Page Icon*/
    pageIcon: undefined,


    /*Search terms for DOM selection*/
    wikiHeaderName: '#firstHeading',
    wikiContentName: '#mw-content-text',
    wikiImageInner: 'div[class^=thumbinner]',
    wikiImageCaption: 'div[class=thumbcaption]',
    wikiInfoBox: 'table[class^=infobox]',
    wikiThumbnail: 'div[class^=thumb]',
    wikiMagnify: 'div[class=magnify]',

    /**
	* @author Adam McManigal
	* @description The primary function that starts processing the page.
	* @param {list} list A standard javascript list.
    */

     buildWikiElements: function(list){

        /*Resets page icon*/
        this.pageIcon = undefined;

        /*Gets the header, which is outside of the main contents section.*/
       this.getMainHeader(list);

        /*Makes the pageIcon*/
        this.pageIcon = new Element('div', {
            'class': 'page_icon',
            pageURL: 'url'

        });
        var iconHeader = new Element('h2', {
            'class': 'icon_header',
            html: list[0].innerHTML
        });

        this.currentIconPics = 0;
        iconHeader.inject(this.pageIcon);

        /*Finds out how many elements we need to process. This is used to count
        * how many elements have been processed so that we know when all the
        * operations have been completed.*/

         var mainContentEl = $$(this.wikiContentName).getChildren()[0];
        this.wikiElementCount = mainContentEl.length + 1;// +1 for header
        console.log(mainContentEl);

        /*Process all the child elements*/
        for(var i = 0; i < mainContentEl.length; i++){
            this.selectProcessingMethod(mainContentEl[i], list);
        }

    },

    /**
    * @author Adam McManigal
	* @description Factory method for selecting the right wiki object to build.
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
    */
    selectProcessingMethod: function(element, list){

        switch(element.localName){
            case 'h2':
                this.getHeader(element, list);
                break;
            case 'h3':
                this.getHeader(element, list);
                break;
            case 'h4':
                this.getHeader(element, list);
                break;
            case 'h5':
                this.getHeader(element, list);
                break;
            case 'p':
                this.getPlainTextElement(element, list);
                break;
            case 'ul':
                this.getListElement(element, list);
                break;
            case 'ol':
                this.getListElement(element, list);
                break;
            case 'a':
                this.getAnchorElement(element, list);
                break;
            case 'div':
                this.processSpecialDivElement(element, list);
                break;
            case 'table':
                this.processTableElement(element, list);
                break;
            default:
                this.getPlainTextElement(element, list);
        }
    },

    /**
	@author Adam McManigal
	@description Builds the header for the page since the header is outside of the wiki content div
	@param {list} list A generic javascript list.
	*/
      getMainHeader: function(list){

        var mainHeader = $$(this.wikiHeaderName);

		/*Grab main header*/
        if(!mainHeader)
            mainHeader = $$('h1');
		/*If the header exists, add it to the element list*/
        if(mainHeader[0])
        {
            var wikiEl = new Element(mainHeader[0].localName, {
                class: 'wiki_header',
                html: this.filterString(mainHeader[0].innerText),
                isDivisible: false

            });
            list.push(wikiEl);
        }
    },

	/**
	* @author Adam McManigal
	* @description Processes headers.
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    getHeader: function(element, list){

        var wikiEl = new Element(element.localName, {
            class: 'wiki_header_' + element.localName,
            html: this.filterString(element.innerText),
            isDivisible: false
        });

        list.push(wikiEl);
    },

	/**
	* @author Adam McManigal
	* @description Creates elements for p, h1, h2, h3 tags
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    getPlainTextElement: function(element, list){

        var wikiEl = new Element(element.localName, {
            class: 'wiki_text_' + element.localName,
            html: this.filterString(element.innerHTML),
            isDivisible: false
        });

        list.push(wikiEl);
    },

	/**
	* @author Adam McManigal
	* @description Creates elements for ol, ul tags
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    getListElement: function(element, list){

        var wikiEl = new Element(element.localName, {
            class: 'wiki_' + element.localName,
            html: this.filterString(String(element.innerHTML)),
            isDivisible: true
        });

        list.push(wikiEl);
    },

	/**
	* @author Adam McManigal
	* @description Creates elements for anchor tags
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    getAnchorElement: function(element, list){
        var wikiEl = new Element(element.localName, {
            class: 'wiki_' + element.localName,
            html: this.filterString(String(element.innerHTML)),
            isDivisible: false
        });

        list.push(wikiEl);
    },
	
	/**
	* @author Adam McManigal
	* @description Creates elements for table elements
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    processTableElement: function(element, list){

        var infoboxCheck = element.className.match(/infobox/);
        if(infoboxCheck){
            list.push(this.processInfobox(element));
        }
    },
	 
	/**
	* @author Adam McManigal
	* @description Processes Wikipedia div elements, which usually contain specialized content
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    processSpecialDivElement: function(element, list){

		/*Checks whether the div contains an infobox*/
        var infoboxCheck = element.getElements(this.wikiInfoBox);
        if(infoboxCheck.length > 0){
            list.push(this.processInfobox(infoboxCheck[0]));
        }

        /*Checks for a thumbnail image*/
        var imageCheck = element.className.match(/thumb/);
        if(imageCheck){
            this.processImgElement(element, list);
        }

        /*Checks for the references section*/
        var refCheck = element.className.match(/reflist/);
        if(refCheck){
            this.processRefList(element, list);
        }
    },
	
	/**
	* @author Adam McManigal
	* @description Processes a reference list
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
	processRefList: function(element, list){
	
        var wikiEl = new Element(element.localName, {
            class: 'wiki_reflist',
            html: this.filterString(String(element.innerHTML)),
            isDivisible: true
        });
        list.push(wikiEl);
    },

	/**
	* @author Adam McManigal and Heather Shadoan
	* @description Processes the infobox that appears on many Wikipedia articles.
	* @param {Element} element A MooTools Element object.
	* @returns {Element} Returns a refactored infobox as a MooTools Element
	*/
    processInfobox: function(element){

        /*Fixes image srcs and alters class name*/
        var linksToFix = element.getElements('img');

        for(var i = 0; i < linksToFix.length; i++)
        {
            this.fixImageSRC(linksToFix[i]);
            linksToFix[i].className = 'wiki_infobox_img';

			/*Adds the infobox pictures to the page icon*/
            this.addPictureToIcon(linksToFix[i]);
        }
		
		/*Resizes the timeline if it exists*/
        var timeLineStuff = element.getElementById('Timeline-row');

        if(timeLineStuff){
        var stuffT = timeLineStuff.getElements('div');

            var heightStr = timeLineStuff.getStyle('height');
            heightStr = heightStr.replace(/px/, '');

            var realHeight = Number(heightStr) * 5;
            timeLineStuff.setStyle('height' , String(realHeight) + 'px');

            var widthStr1 =timeLineStuff.getStyle('width');
            widthStr1 = widthStr1.replace(/px/, '');

            var realWidthTL = Number(widthStr1) * 5;
            timeLineStuff.setStyle('width' , String(realWidthTL) + 'px');


            for( var i = 0; i < stuffT.length; i++)
            {

                var widthStr = stuffT[i].getStyle('width');
                widthStr = widthStr.replace(/px/, '');

                var realWidth = Number(widthStr) * 5;
                stuffT[i].setStyle('width' , String(realWidth) + 'px');

                var leftStr = stuffT[i].getStyle('left');
                leftStr = leftStr.replace(/px/, '');

                var leftWidth = Number(leftStr) * 5;
                stuffT[i].setStyle('left' , String(leftWidth) + 'px');

                var TA = 'text-align';
                stuffT[i].setStyle(TA, 'justify');

            }

            var small = element.getElements('small');

            if(small[14]){
                small[14].setStyle('vertical-align', '-85px');
                small[14].setStyle('position', 'relative');
                small[14].setStyle('color','rgb(127, 255, 255);');
                small[14].setStyle('font-size','70px');
            }

        }
        
		/*Unifies background colors*/
        var stuff = element.getElements('tr,th');
        for( var i = 0; i < stuff.length; i++)
        {
            stuff[i].setStyle('background-color', 'rgb(0,0,0)')
        }

        /*Transfer needed information to the new element*/
        var newInfobox = new Element(element.localName, {
            class: 'wiki_infobox',
            html: this.filterString(element.innerHTML),
            isDivisible: false
        });

        /*Put the infobox table in a div, which will allow scrolling on frame overflow*/
        var infoboxHolder = new Element( 'div', {
            class: 'wiki_infobox'
        });

        newInfobox.inject(infoboxHolder);
        return infoboxHolder;
    },

	/**
	* @author Adam McManigal and Heather Shadoan
	* @description Refactors the image to display properly in 3D environment.
	* @param {Element} element A MooTools Element object.
	* @param {list} list A generic javascript list.
	*/
    processImgElement: function(element, list){

        var orientation = "";

        /*Determines if the image is part of the ugly HTML crap elements and ignores it if so*/
        var imageCheck = element.getElement(this.wikiImageInner);
        if(imageCheck && imageCheck.getChildren().length > 2)
            return;

        /*Determines whether the image should float left or right*/
        var orientLeft = element.className.match(/tleft/);
        if(orientLeft && orientLeft.length > 0)
            orientation = 'left';
        else{
            orientation = 'right';
        }

        /*Removes the magnifying glass icon*/
        var mag = element.getElement(this.wikiMagnify);
        if(mag)
            mag.destroy();

        var newDiv = new Element(element.localName, {
            class: 'wiki_img_' + orientation,
            isDivisible: false
        });

        /*Processes the picture*/
        var oldImage = element.getElements('img')[0];
        if(oldImage){
            this.fixImageSRC(oldImage);
            console.log(oldImage.width);
            console.log(oldImage.height);
        }
        else{
            return;
        }
        /*Resizes image to allow proper frame calculations
		  TODO: Take out magic numbers*/
        var multFactor = (3000 * 0.4)/oldImage.width;
        var newWidth = oldImage.width * multFactor;
        var newHeight = oldImage.height * multFactor;


        /*Creates and returns the new image*/
        var newImage = new Element(oldImage.localName, {
            class: 'wiki_img',
            html: this.filterString(oldImage.innerHTML),
            src: oldImage.src
        });

        /*Checks whether to add this image to the page manager*/
        this.addPictureToIcon(newImage, list);

        newImage.setStyles({
            'width': newWidth,
            'height': newHeight
        });

        /*Adds the caption to the image*/
        var oldCaption = element.getElement(this.wikiImageCaption);
        if(oldCaption){
            var newCaption = new Element(oldCaption.localName, {
                class: 'wiki_caption',
                html: this.filterString(oldCaption.innerHTML)
            });

            newCaption.setStyles({
                'width': newWidth
            });

            newCaption.inject(newDiv);
            newImage.inject(newDiv);
        }

        list.push(newDiv);
    },

	/**
	* @author Adam McManigal
	* @description Adds a picture to the PageIcon object.
	* @param {Element} element A MooTools Element object with a 'img' tag.
	* @param {list} list A generic javascript list.
	* @returns {Element} Returns a refactored infobox as a MooTools Element
	*/
    addPictureToIcon: function(element, list){

        if(this.currentIconPics < this.maxPageIconPics)
        {
            this.currentIconPics++;
            var newImage = new Element(element.localName, {
                'class': 'icon_img' + String(this.currentIconPics),
                html: this.filterString(element.innerHTML),
                src: element.src
            });

            newImage.inject(this.pageIcon);
        }
    },
	/**
	* @author Adam McManigal
	* @description Cleans artifacts left by YQL out of the HTML.
	* @param {string} string The string to remove extra spaces from.
	* @returns {string} Returns a refactored string
	*/
    filterString: function(e_text){
        "use strict"
        var tempString = e_text;
        tempString = tempString.replace(/[\n\r\t]/g,' ');
        tempString = tempString.replace(/ \[[^\]]*?\]/g,'');
        tempString = tempString.replace(/\( */g,'(');
        tempString = tempString.replace(/  */g, ' ');

        return tempString;
    },
	
	/**
	* @author Adam McManigal
	* @description If the program is being run on a local file system the file urls are changed to http urls, 
	* thereby allowing them to work.
	* @param {Element} element A MooTools Element object with a 'img' tag.
	*/
     fixImageSRC: function(element){

         var tempSrc = element.src;
         if(tempSrc){
             tempSrc = tempSrc.replace(/file/, 'http');
             element.src = tempSrc;
         }
    },

	/**
	* @author Adam McManigal
	* @description Determines whether the element is of a certain class or tag type.
	* @param {Element} element A MooTools Element object.
	* @param {string} cName The class name to check the element for.
	* @param {string} eTag The type of HTML tag you want to check the element for.
	*/
    elementIs: function(element, cName, eTag){
        var elName = element.className;
        var elTag = element.localName;
        if(elName && elName.match(cName) > 0 && elTag.match(eTag) > 0){
            return true;
        }
        else{
            return false;
        }

    }

});
