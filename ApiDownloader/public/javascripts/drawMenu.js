const loadingUrl = "http://localhost:3000/";

var interface_variables = {
	lines:true,
	squares:false,
	removed:false,
	added:false,
}

function onSalir(){
	window.location.replace(loadingUrl);
}


//writes to info square
function showInfo(title,body){
	if(title){
		$( ".infoTitle").html(title);
	}

	if(body){
		$( ".infoBody").html(body);
	}
}

function onLineChange(){
	interface_variables.lines = !interface_variables.lines;
}

function onBoxChange(){
	interface_variables.squares = !interface_variables.squares;
}

function onRemovedChange(){
	interface_variables.removed = !interface_variables.removed;
}

function onAddedChange(){
	interface_variables.added = !interface_variables.added;
}


//showInfo("tortuga", "body");