/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 */

// TODO: Object slides in the z and y direction
// TODO: and zooms in the x direction only
THREE.SlideControls = function ( object, domElement ) {

	THREE.EventDispatcher.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userSlide = true;
    this.slideSpeed = 3;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var slideStart = new THREE.Vector2();
	var slideEnd = new THREE.Vector2();
	var slideDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var scale = 1;

	var STATE = { NONE : -1, SLIDE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };

	this.zoomIn = function ( zoomScale ) {

		scale = zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		scale = zoomScale;

	};

	this.update = function () {

        // Move object in three dimensions
        this.object.position.x = this.object.position.x + (scale*this.userZoomSpeed);
        this.object.position.y -= slideDelta.y*this.slideSpeed;
        this.object.position.z += slideDelta.x*this.slideSpeed;

        // Check that the object is still within bounds
        this.object.checkPosition(this.center);

        // Reset slide distance
        slideDelta.x = 0;
        slideDelta.y = 0;
        scale = 0;

	};

	function onMouseDown( event ) {

		if ( !scope.userSlide ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			state = STATE.SLIDE;

			slideStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.SLIDE ) {

			slideEnd.set( event.clientX, event.clientY );
			slideDelta.subVectors( slideEnd, slideStart );
			slideStart.copy( slideEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.subVectors( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn(zoomDelta.y);

			} else {

				scope.zoomOut(zoomDelta.y);

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userSlide ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.zoomOut(delta);

		} else {

			scope.zoomIn(delta);

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

};
