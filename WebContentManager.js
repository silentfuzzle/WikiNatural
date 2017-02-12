/**
 * @author Adam McManigal & Kyle Doyle
 * @class Retrieves HTML from the internet and loads it into the DOM.
 * @default If a different method for retrieving Wiki HTML is not defined YQL is used.
 */
var WebContentManager = new Class({

    webRequestApproach: undefined,
    elementsBuilder: undefined,

    /*If a handler is not defined, use the default YQLHTMLRequest*/
    initialize: function(webRequestApproach){
        "use strict";
        if(!webRequestApproach){
            this.webRequestApproach = this.getYQLHTMLRequest;
        }
            /*TODO: Consider adding support for another HTML get method (like CURL)*/
            this.webRequestApproach = this.getYQLHTMLRequest;
            this.elementsBuilder = new WikiElementsBuilder();

    },

    /**
	* @author: Adam McManigal
	* @description Gets the html using the selected method.
	* @param {string} url An HTTP URL to a Wikipedia page.
	* @param {PageManager} pageManager A PageManager object to store processed HTML in. 
	*/
    getHTML: function(url, pageManager){
        "use strict";
        this.webRequestApproach(url, pageManager, this);

    },

    /** 
	 * @author: Adam McManigal
     * @description: Retrieves html using the Yahoo Query Language service.
	 * @param {string} plain_url An HTTP URL to a Wikipedia page.
	 * @param {PageManager} pageManager A PageManager object to store processed HTML in. 
	 * @param {function} caller Callback that begins processing once the HTML has been retrieved
	 */
    getYQLHTMLRequest: function(plain_url, pageManager, caller){
        "use strict"

        /*Sets up the XMLHttpRequest object*/
        var YQLurl = this.URLtoYQL(plain_url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', YQLurl, true);

        /*Waits for request to finish and returns either the page HTML or the request object*/
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4){
                /*If the response is valid...*/
                if (xhr.status >= 200 && xhr.status < 300){
					
					/*Holds the HTML while needed*/
                    var tempElement = new Element('div', {
                        'id': 'temp_html',
                        'class': 'web_content_util',
                        'html': xhr.responseText
                    });

                    /*Injects the html into a special area of the DOM to ensure that nothing in our
                     * program is overwritten*/
                    tempElement.inject('remote_html');

                    /*TODO: Testing purposes only*/
                    console.log(tempElement);

                    /*Configures the current PageContentManager*/
                    if(caller)
                        caller.finishElements(plain_url, pageManager);

                }else {
                    console.log("Unsuccessful Request for " + plain_url);
                }
            }
        };

        // Timeout for request
        setTimeout(function(){
            xhr.abort();
        }, 5000);

        xhr.setRequestHeader('Accept', 'text/html');
        xhr.send();

    },

	/** 
	 * @author: Adam McManigal
     * @description: Finalizes Configuration of the PageManager.
	 * @param {string} plain_url An HTTP URL to a Wikipedia page.
	 * @param {PageManager} pageManager A PageManager object to store processed HTML in. 
	 */
    finishElements: function(plain_url, pageManager){
        this.elementsBuilder.buildWikiElements(pageManager.elementList, pageManager.pageIcon);
        pageManager.pageURL = plain_url;
        pageManager.pageIcon = this.elementsBuilder.pageIcon;
        pageManager.allElementsLoaded = true;
        pageManager.generateFrameGroups();
		
		/*Removes YQL information from the DOM*/
        $('temp_html').destroy();
    },

    /**
	 * @author Kyle Doyle
     * @description Changes a conventional http url into a YQL request
	 * @param {string} url_input An HTTP URL to a Wikipedia page.
	 * @returns {string} The YQL query url. 
	 */
    URLtoYQL: function(url_input){
        "use strict";

        var basic_string = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22';
        if(url_input.charAt(url_input.length-1) == '/')
        {
            url_input = url_input.slice(0,url_input.length-1);
        }
        url_input = url_input.replace(/\//g,'%2F');
        url_input = url_input.replace(':','%3A');
        url_input = url_input.replace('(','%2528');
        url_input = url_input.replace(')','%2529');
        url_input = url_input.replace('%28','%2528');
        url_input = url_input.replace('%29','%2529');
        url_input = url_input.replace('#','%23');

        var url_string = url_input + '%22';

        return basic_string + url_string;
    }

});