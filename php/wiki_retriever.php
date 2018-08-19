<?php
	if( !isset($_GET['url']) ) { 
		echo 'No URL specified!'; 
	}
	else {
		$url=rawurldecode($_GET['url']);
		
		if (strpos($url, 'wikipedia.org') !== false) {
			
			// Retrieve HTML from Wikipedia
			$lines_array=file($url);
			$lines_string=implode('',$lines_array);
			
			// Write HTML to page
			echo $lines_string;
		}
		else {
			echo 'Not a Wikipedia page!';
		}
	}
?>