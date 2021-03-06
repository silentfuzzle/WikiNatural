# WikiNatural
WikiNatural, the brainchild of Adam McManigal, is a 3D web browser for Wikipedia. In theory, users can browse through information faster when it is spread over the X- and Y-plane as opposed to one long page. WikiNatural also provides a map that tracks what pages you've visited and in what order.

This was my capstone project as an undergraduate Computer Science student. I co-developed it with Adam McManigal, Heather Shadoan, and Kyle Doyle at the University of Montana in 2013. At the time, we called it Natural Web, but that name is quite common, so I renamed it. At the time, I created the map layout, panel layout, user interface controls, and animations. Recently, I implemented retrieving Wikipedia pages with PHP and AJAX.

You can find WikiNatural live [here](http://wikinatural.opengatesmedia.com/). WikiNatural works best in Google Chrome.

You can send requests, bug reports, questions, comments, etc. via my website [here](https://opengatesmedia.com/about/contact-me/).

## Controls

WikiNatural displays Wikipedia pages as a circular set of panels placed around the camera. Each panel displays a section from the original web page. Click and drag the mouse to look around.

You can click on a panel to bring it into focus. In this view, scrolling the mouse wheel scrolls through the panel's content. Click the panel again to return it to its original position, or click another panel in the background to bring it into focus.

The section of the Wikipedia page displayed on each panel can be interacted with like a normal webpage. You can click hyperlinks to other Wikipedia pages to navigate to that page in WikiNatural. Hyperlinks to other websites will open in a separate tab in your browser.

Each panel also has a set of controls separate from the Wikipedia content. If the section of the Wikipedia page contains more information than can fit on a single panel, the Next and Previous buttons on the edge of the panel will display the next or previous sub-section of content. The Map button at the top of the panel opens the map view.

WikiNatural's map, as opened with the Map button found at the top of any panel, displays the Wikipedia pages you've visited in a tree-like structure of icons. In this view, click and drag the mouse to scroll through the tree. You can click any icon to return to the corresponding Wikipedia page in WikiNatural.

## Known Issues

* Users can't set the starting page.
* The map doesn't have arrows from one location to the next.
* Panels have a tendency to flicker or disappear.
* Information doesn't always span the entirety of a frame.
