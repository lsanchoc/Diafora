var tree = JSON.parse(sessionStorage.getItem("sessionTree1"));
var tree2 = JSON.parse(sessionStorage.getItem("sessionTree2"));
treeStr = JSON.stringify(tree);
console.log(tree);
console.log(tree2);


//const loadingUrl = "http://localhost:3000/"

if(!tree || !tree2){
	window.location.replace(loadingUrl);
}

var initOptions = {
    defaultSize : 20,
    defaultBarSize: 10,
    indent : 30,
    increment: 20,
    hsbColor: 30,
    hsbIncrement: 2,
    hsbBrigthnes: 50,
    hsbbrigthnesIncrement: 7,
    use_log_scale:false,
    use_resume_bars:true,
    log_increment: 15,
    log_scale: 5,
    "circle-padding": 3,
    "hierarchy_distance":700,
    "width" : 350,
    "height" : 500,
    separation: 100,
    "background-color" : undefined,
    "stroke-color" : undefined,
    "indent-stroke" : 0.5,
    "indent-stroke-color" : undefined,
    "hover-color" : undefined,
    "hover-color-rect" : undefined,
	"text-color": undefined,
	"remove-color":undefined,
	"add-color":undefined,
	"split-color":"#e066ff",
	"merge-color":"#ff9a47",
	"rename-color":"#AAAACC",
	"move-color":"#333333",
	"equal-color":"#e8e8e8",
}


var index = tree;
var canvas = null;
//amuount of the screen the canvas takes
var totalCanvasWidth = 1.0;
var totalCanvasHeight = 0.9;
var levelList//list of nodes contained in every level of hierarchy
var levelList2//list of nodes contained in every level of hierarchy


//position of canvas focus
var xPointer = 0;
var yPointer = 0;

const SCROLL_SPEED = 0.4;

var changed = false;
var click = false;

tree.visible_lbr = {
      "domain" :        [],
      "kingdom":        [],
      "phylum" :        [],
      "class" :         [],
      "order" :         [],
      "superfamily" :   [],
      "family" :        [],
      "subfamily" :     [],
      "tribe" :         [],
      "subtribe" :      [],
      "genus" :         [],
      "subgenus" :      [],
      "species" :       [],
      "infraspecies":   [],
      "subspecies":      [],
  
};

tree2.visible_lbr = {
      "domain" :        [],
      "kingdom":        [],
      "phylum" :        [],
      "class" :         [],
      "order" :         [],
      "superfamily" :   [],
      "family" :        [],
      "subfamily" :     [],
      "tribe" :         [],
      "subtribe" :      [],
      "genus" :         [],
      "subgenus" :      [],
      "species" :       [],
      "infraspecies":   [],
      "subspecies":      [],
  
};



function MouseClicked(){

}

function setup() {
	//make canvas size dynamic
	canvas = createCanvas(windowWidth*totalCanvasWidth, windowHeight*totalCanvasHeight);
	canvas.parent('sketch-holder');
	var x = 0;
	var y = (windowHeight*(1.0-totalCanvasHeight));
	canvas.position(x, y);
  
	//setup optiopns that cannot be initialized before setup
	initOptions["background-color"] = color(255,180,40);
	initOptions["stroke-color"] = color(0,0,0);
	initOptions["indent-stroke-color"] = color(80,80,80);
	initOptions["hover-color"] = color(249,211,149);
	initOptions["text-color"] = color(0,0,0);
	initOptions["hover-color-rect"] = color(48, 44, 66);
	initOptions["remove-color"] = color(255, 96, 96);
	initOptions["add-color"] = color(177, 255, 175);


	countChildren(tree);
	levelList = createRankList(tree);
	initializeIndentedTree(tree,levelList,initOptions,1);
	

	countChildren(tree2);
	levelList2 = createRankList(tree2);
	//weird fix, requieres to properly repair  indent grow
	initializeIndentedTree(tree2,levelList2,initOptions,-1);
	

	calculate_all_merges(levelList,levelList2);

	//console.log(tree);
	//console.log(levelList);
}
function mouseWheel(event) {
	yPointer -= event.delta*SCROLL_SPEED;
	//print(event.delta);
}
function mouseClicked(){
	click = true;
}
function windowResized() {
	resizeCanvas(windowWidth*totalCanvasWidth, windowHeight*totalCanvasHeight);
	var x = 0;
	var y = (windowHeight*(1.0-totalCanvasHeight));
	canvas.position(x, y);
}

function draw() {
  translate(xPointer,-yPointer);
  background(255);
  fill(0);

  //drawIndentedTree(tree, initOptions);
  let base_y = windowWidth/2 - initOptions.width/2;
  //optimizedDrawIndentedTree(tree.visible_lbr,initOptions,base_y-initOptions.hierarchy_distance/2,0);
  //optimizedDrawIndentedTree(tree2.visible_lbr,initOptions,base_y+initOptions.hierarchy_distance/2,0);
  optimizedDrawIndentedTree(tree.visible_lbr,initOptions,initOptions.separation,0,false);
  optimizedDrawIndentedTree(tree2.visible_lbr,initOptions,windowWidth-initOptions.separation,0,true);

  /*levelList["species"].forEach(function(taxon){
		drawLines(taxon,yPointer,yPointer+windowHeight,initOptions,initOptions.separation,0);
			
	});

	levelList2["species"].forEach(function(taxon){
		drawLines(taxon,yPointer,yPointer+windowHeight,initOptions,initOptions.separation,0);
			
	});*/
	
	//initOptions.initOptions["width"]or = (initOptions.hsbColor +2);
  	//console.log(mouseX +"---"+mouseY);
  
  	//check if we are using bars
  	if(initOptions.use_resume_bars != interface_variables.bars){
  		initOptions.use_resume_bars = interface_variables.bars
  		//update the tree if we are not using bars
  		recalculateTree(tree,initOptions,function(){return;});
  		recalculateTree(tree2,initOptions,function(){return;});
  	}

  click = false;
}

function initializeIndentedTree(originalTree,listByLevel,options,growDirection){
    proccesByLevel(originalTree,function(node){
      node.x = 0;
      node.y = 0;
      node.width = 0;
      node.height = 0;
      node.collapsed = true;
    });
    
    
    
    originalTree.width = options.width;
    originalTree.height = options.defaultSize; 
    /*originalTree.c.forEach(function (childNode){
      //childNode.collapsed = false;
      unfoldNode(childNode,initOptions);  
    }
    );*/
    
    unfoldNode(originalTree,initOptions);

    setIndentCordinates(originalTree,options,growDirection);
    calculateSize(originalTree,options);
	calculateCordinates(originalTree,options,0,0);

	originalTree.visible_lbr[originalTree.r.toLowerCase()].push(originalTree);
    pushIntoUnfolded(originalTree);
    originalTree.c.forEach(function(child_node){pushIntoUnfolded(child_node)});

}

//recaulculates tree
async function recalculateTree(originalTree,options,callback) {
	/*proccesByLevel(originalTree,function(node){
      node.y = 0;
      node.height = 0;
    });*/
  	calculateSize(originalTree,options);
	calculateCordinates(originalTree,options,0,0);
  	//console.log("reacalculating updatedTree" + {callback});
  	callback();
  	changed = false;
}

function setIndentCordinates(root, options,growDirection){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop();
     
    if(actual !== null && actual !== undefined){
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
      childNode.x = actual.x + options.indent*growDirection;
      //childNode.x *= growDirection;
      //if(growDirection < 0) childNode.x -= textWidth()
      childNode.width = actual.width-options.indent;
      pendingNodes.push(childNode);
      }
    }
    }
  }
}


function calculateSize(root, options){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop(); 
    //reset in case of being an actualizatioo
    //console.log(pendingNodes);
    if(actual.collapsed){
    	actual.height = getNodeSize(actual, options);/*options.defaultSize*/;
    }else{
    	actual.height = options.defaultSize;/*options.defaultSize*/;
    }
    //actual.height = getNodeSize(actual, options);/*options.defaultSize*/;
    actual.y = 0;

    if(actual !== null && actual !== undefined){
    let acumulatedSize = options.defaultSize;
	//actual.height += options.defaultSize*2;
	//increaseFamilySize(actual,options.defaultSize*2);
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
			let nodeSize = getNodeSize(childNode, options);
			//relative position to parent
			//childNode.y = acumulatedSize;
			
			childNode.height += nodeSize;
			acumulatedSize += nodeSize;
			//increaseFamilySize(actual,nodeSize)
			if(!actual.collapsed){
				increaseFamilySize(childNode,nodeSize);
				pendingNodes.push(childNode);
		}
      }
        
    }
    }
	//fin de if
	}
  
	
}
/*
//return node logaritimicScale
function getNodeSize(node, options){
	if(node.desendece)
		return options.defaultSize + Math.log(node.desendece)/Math.log(options.log_scale)*options.log_increment;
	return options.defaultSize;
				
}
*/

//return node logaritimicScale
function getNodeSize(node, options){
	//stores how much extra size the node gets
	let extra = 0;
	
	if(node.desendece && options.use_log_scale && options.use_resume_bars)
		extra =  Math.log(node.desendece)/Math.log(options.log_scale)*options.log_increment;
	else if(node.desendece && options.use_resume_bars)
		extra = options.defaultBarSize;
	//console.log({options,extra});
	return (options.defaultSize+extra);
				
}


function increaseFamilySize(node, increment){
	node.f.forEach(function(fam){
			fam.height += increment;
		})
	}

function calculateCordinates(root, options, xPos,yPos){
  let pendingNodes = [];
  pendingNodes.push(root);
  
  root.x = xPos;
  root.y = yPos;
  
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop(); 
    
    if(actual !== null && actual !== undefined && !actual.collapsed){
    let acumulatedHeigth = options.defaultSize;

    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      let childNode = actual.c[childIndex];
      if(childNode){
			//relative position to parent
			childNode.y += actual.y + acumulatedHeigth;
			childNode.x += xPos;
			acumulatedHeigth += childNode.height;
			pendingNodes.push(childNode);
      }  
    }

    }
  }
	
}

function unfoldNode(node,options){
	node.collapsed = false;
}
  
function foldNode(node, options){
	//node.collapsed = true;
	node.collapsed = true;
	node.c.forEach(
	function(child_node){
		proccesByLevelConditional(child_node,function(actual){
			actual.collapsed = true;
			popFromUnfolded(child_node);
		}
		,"collapsed",false)
	}
	)
}

function drawIndentedTree(treeRoot, options){
   
    
    let pendingNodes = [];
    pendingNodes.push(treeRoot);
    while(pendingNodes.length > 0){
      let actual = pendingNodes.pop();
      if(actual !== null && actual !== undefined){
      drawNode(actual,options);
      if(!actual.collapsed){
        for(childIndex = 0; childIndex < actual.c.length; childIndex++){
        let childNode = actual.c[childIndex];
        if(childNode){
          //console.log(childNode.n);
          pendingNodes.unshift(childNode);
        }
        }
      }

      }
    }
    
    /*memoryTreeIteration(treeRoot,function(node){
      if(node && node.collapsed === false){
        //console.log("drawing a rect " + node.n);
        rect(node.x,node.y,300,node.height)
      }
    });*/
  
}

function optimizedDrawIndentedTree(listByRank,options,xpos,ypos,isRight){
	let domains = listByRank["domain"];
	let kingdom = listByRank["kingdom"];
	let phylum = listByRank["phylum"];
	let tclass = listByRank["class"];
	let order = listByRank["order"];
	let superfamily = listByRank["superfamily"];
	let family = listByRank["family"];
	let subfamily = listByRank["subfamily"];
	let tribe = listByRank["tribe"];
	let genus = listByRank["genus"];
	let subgenus = listByRank["subgenus"];
	let species = listByRank["species"];
	let subspecies = listByRank["subspecies"];
	let infraspecies = listByRank["infraspecies"];
	
	
	/*for(let taxon = 0; taxon < kingdom.length; taxon++){
		//drawCutNode(kingdom[taxon],yPointer,yPointer+windowWidth*totalCanvasWidth,options)
		drawOnlyText(kingdom[taxon],yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
	}*/
	//colorMode(HSB,100);
	drawHierarchyLevel(kingdom,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(phylum,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(tclass,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(order,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(superfamily,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(family,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(subfamily,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(tribe,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(genus,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(subgenus,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(species,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(subspecies,options,yPointer,xpos,ypos,isRight);
	drawHierarchyLevel(infraspecies,options,yPointer,xpos,ypos,isRight);
	
	
	//colorMode(RGB, 255);
	
	}

function drawHierarchyLevel(taxons,options,pointer,xpos,ypos,isRight){
	if(taxons.length <= 0) return;
	let initial = findHead(taxons,pointer);
	//console.log(taxons[0].r+ `->${taxons[initial].n}:  `+initial+ " -------- " + Math.floor(yPointer) +"--"+taxons[initial].y);
	let iniColor = (options.hsbColor + options.hsbIncrement*getValueOfRank(taxons[0].r))%100;
	let iniBrigthnes = (options.hsbBrigthnes + options.hsbbrigthnesIncrement*getValueOfRank(taxons[0].r))%100;
	//console.log(taxons[0].r+": " + initial);
	let draws = 0;
	let extra_pos = 0;

	if(isRight){
		extra_pos = -taxons[0].width;
	}

	for(let taxon = initial; taxon < taxons.length; taxon++){
		let node = taxons[taxon];
		
		if(node.f.length <= 0 || !node.f[node.f.length-1].collapsed){
			draws++;
			
			fill(iniColor,0,iniBrigthnes);
			//drawCutNode(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
			if(isRight){
			let size = (node.totalSpecies) ? node.totalSpecies : "";
			drawOnlyText(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos-textWidth(node.r +":"+node.n + " " + size),ypos);
			}
			else{
			drawOnlyText(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
			}
			if(interface_variables.squares){
			drawInside(node, xpos+extra_pos,ypos, options);
			}
			if(interface_variables.lines){
				drawIndent(node, xpos,ypos, options,isRight);
			}
			if(interface_variables.bars)
			drawResumeBars(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos+extra_pos,ypos);
			
			//drawResumeDots(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
			//drawLines(node,yPointer,yPointer+windowHeight*totalCanvasHeight,options,xpos,ypos);
			//drawNode(node,options);
			//drawNode(node,options)

		}
		if(node.y > yPointer + windowHeight*totalCanvasHeight){break;}

	}
	
	}

function findHead(list, targetY){
		let initialIndex = 0;
		let finalIndex = list.length-1;
		let previousIndex = -1;
		let middleIndex = 0;
		if(list.length <= 0) return 0;
		while( initialIndex <= finalIndex){
			previousIndex = middleIndex;
			middleIndex = Math.floor((initialIndex+finalIndex)/2);
			if(list[middleIndex].y < targetY){
				initialIndex = middleIndex + 1;
			}else if(list[middleIndex].y > targetY){
				finalIndex = middleIndex -1;
			}else{
				return middleIndex;
			}
		}
		
		return middleIndex;
	}
	
function isOnScreen(node,yScreenPos,screenHeight){
		if(node.y+node.height >= yScreenPos + screenHeight && node.y <= yScreenPos + screenHeight){
			return true;
		}
		if(node.y+node.height >= yScreenPos && node.y <= yScreenPos){
			return true;
		}
		if(node.y >= yScreenPos && node.y <= yScreenPos + screenHeight){
				return true;
		}
		//console.log(node.n+ ": "+node.y+"--"+(node.y+node.height)+"  is not on screen" + yScreenPos +"---" + (yScreenPos + screenHeight));
		//console.log("node.y+node.height >= yScreenPos + screenHeight -->" + (node.y+node.height >= yScreenPos + screenHeight ));
		//console.log("node.y <= yScreenPos + screenHeight -->" + (node.y <= yScreenPos + screenHeight));
		return false;
	}


function drawOnlyText(node,initialY,finalY,options,xpos,ypos){
	let clicked = false;
	//hover interaction
	fill(options["text-color"]);
	if(interface_variables.removed && node.removed){
		fill(options["remove-color"]);
	}else if(interface_variables.added && node.added){
		fill(options["add-color"]);
	}else{
		fill(options["text-color"]);
	}

	if(isOverRect(mouseX +xPointer, mouseY+yPointer,node.x + xpos,node.y + ypos,node.width,options.defaultSize)){
		fill(options["hover-color"]); 

		//this functions comes from drawMene.js
		if(showInfo){
			let author = node.a == "" ? "" : `<br>Author:${node.a}`;
			let date = (node.ad || node.ad == "") ? "" : `  Date:${node.da}`;
			let synonim = node.equivalent ? "<br>Synonims: "+ node.equivalent.length : "";
			let splits = "<br>Splits: "+ node.totalSplits ;
			let merges = "----Merges: "+ node.totalMerges;
			let removes = "<br>Removes: "+ node.totalRemoves;
			let insertions = "----Insertions: "+ node.totalInsertions;
			let renames = "<br>Renames: "+ node.totalRenames;
			let moves = "----Moves: "+ node.totalMoves;
			showInfo(node.n,`Rank: ${node.r}` + author + date + synonim+splits+merges+removes+insertions+renames+moves);
		}


		if(click && !changed){
			//keep visible nodes list clean
			let cleaning_function;
			let elder = getRoot(node);

			if(node.collapsed){
				unfoldNode(node);
				cleaning_function = function(){node.c.forEach( 
				function(child_node){if(child_node){pushIntoUnfolded(child_node)}})
			};
			}else{
				foldNode(node);
				cleaning_function = undefined;
			}
			changed = true;
			
			click = false;
			recalculateTree(elder,initOptions,function(){
				if(cleaning_function){cleaning_function(elder);}
				});
			//console.log({visible_lbr});
  			//recalculateTree(tree2,initOptions);
			//console.log("updating");
		}

	}

	noStroke();
	if(node.y >= initialY && node.y <= finalY){
		let size = (node.totalSpecies) ? node.totalSpecies : "";
		text(node.r +":"+node.n + " " + size,node.x +5 +xpos,node.y+15);
	}
	
}

function drawLines(node,initialY,finalY,options,xpos,ypos){
	if(node.equivalent && node.equivalent.length > 1){
		if(node.split){
			stroke(options["split-color"]);
		}else if(node.merge){
			stroke(options["merge-color"]);
		}
		let fuente = node;
		while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
						fuente = fuente.f[fuente.f.length-1];
					}
		node.equivalent.forEach(
				function(eq){

					let target = eq;
					while(target.f.length > 0 && target.f[target.f.length-1].collapsed){
						target = target.f[target.f.length-1];
					}
					//stroke(0);
					noFill();
					strokeWeight(1);
					beginShape();
					curveVertex(fuente.x + xpos -10 ,fuente.y + ypos);
					curveVertex(fuente.x + xpos,fuente.y + ypos);
					curveVertex(fuente.x + xpos +150,fuente.y + ypos);
					curveVertex(target.x + windowWidth - options.separation - options["width"] - 150,target.y);
					curveVertex(target.x + windowWidth - options.separation - options["width"],target.y);
					curveVertex(target.x + windowWidth - options.separation - options["width"] + 10,target.y);
					endShape();

					//line(fuente.x + xpos,fuente.y + ypos,target.x + windowWidth - options.separation - options["width"],target.y);
				}

			);
		
	}
}


//add element to rendering queue
function pushIntoUnfolded(node){
	let elder = getRoot(node);
	let actualVisibleRank = elder.visible_lbr[node.r.toLowerCase()];
	//console.log({actualVisibleRank});
	let headIndex = findHead(actualVisibleRank,node.y)
	let head =	actualVisibleRank[headIndex];
	//console.log(`head : ${headIndex}`);
	//console.log({actualVisibleRank});
	if(!head || (headIndex == 0 && head.y >= node.y) ){
		actualVisibleRank.unshift(node);
		//console.log(`unshifted ${node.n}`);
	}else
	if(head.y >= node.y){
		//console.log(`${node.y}>=${head.y}spliced - ${node.n}--${head.n}: ` + (headIndex)+"--"+headIndex);
		actualVisibleRank.splice(headIndex, 0, node);
	}else{
		//console.log(`spliced + ${node.n}: `+ (headIndex + 1));

		actualVisibleRank.splice(headIndex + 1, 0, node);
	}
	//printListNodeNames(actualVisibleRank);

}

function printListNodeNames(printedList){
	let result = "";
	for(let i = 0; i < printedList.length; i++){
		result = result + "->" + printedList[i].n;
	}
	console.log(result);
}


//remove element from rendering queue
function popFromUnfolded(node){
	let elder = getRoot(node);
	let actualVisibleRank = elder.visible_lbr[node.r.toLowerCase()];
	let headIndex = findHead(actualVisibleRank,node.y)
	if(actualVisibleRank.length > 0){
		actualVisibleRank.splice(headIndex, 1);
	}
}

function getRoot(node){
			if(node.f.length > 0){
				return node.f[0];
			}
			return node; 
			
}


function isOverRect(xpos,ypos,rxpos,rypos,rwidth,rheight){
	return (xpos >= rxpos && xpos <= rxpos+rwidth
		&& ypos >= rypos && ypos <= rypos+rheight);
}



//deprecated functions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
function drawNode(node,options){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	fill(options["background-color"]);
	stroke(options["stroke-color"]);
	strokeWeight(2);
	rect(node.x,node.y,node.width,node.height);
	noStroke();
	fill(0);
	text(node.n,node.x +5 ,node.y+15);
}
/*
function drawNode(node,options){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	fill(options["background-color"]);
	stroke(options["stroke-color"]);
	strokeWeight(2);
	rect(node.x,node.y + options.defaultSize,node.width,node.height - options.defaultSize);
	noStroke();
	fill(0);
	text(node.n,node.x +5 ,node.y+15);
}
*/

function drawInside(node,xpos,ypos,options){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	stroke(options["stroke-color"]);
	noFill();
	if(!node.collapsed){
		rect(node.x + xpos +options.indent,node.y +ypos + options.defaultSize,node.width-options.indent,node.height - options.defaultSize);
	}else{
		//rect(node.x + xpos /*- options.indent*/,node.y +ypos ,node.width /*+ options.indent*/,node.height);
	}
}

function drawIndent(node,xpos,ypos,options, isRight){
	stroke(options["indent-stroke-color"]);
	strokeWeight(options["indent-stroke"]);
	if(node.f.length > 0){
	let parentNode = node.f[node.f.length -  1];
	let defaultYDisp = options.defaultSize/2 + ypos;
	let xdirection = 1
	if(isRight) xdirection = -1;
	let defaultXDisp = xpos + options.indent/2*xdirection;
	line(parentNode.x + defaultXDisp, node.y + defaultYDisp, node.x + xpos, node.y + defaultYDisp);
	line(parentNode.x + defaultXDisp, parentNode.y + defaultYDisp + 10, parentNode.x + defaultXDisp, node.y + defaultYDisp);
	
	}
}

function drawCutNode(node,initialY,finalY,options,xpos,ypos){
	//console.log(node.x+"--"+node.y+"--"+node.width+"--"+node.height );
	let yCoord = Math.max(node.y,initialY);
	//console.log(node.x,node.y);
	//calculate te rect that is inside the screen
	let newHeigth = Math.min(node.height + (node.y - yCoord),finalY - initialY);
	//console.log(newHeigth);
	//fill(options["background-color"]);
	stroke(options["stroke-color"]);
	strokeWeight(2);
	if(isOverRect(mouseX +xPointer, mouseY+yPointer,node.x + xpos,node.y + ypos,node.width,options.defaultSize)){
		fill(options["hover-color-rect"]);
	}
	//noFill();
	/*if(!node.collapsed){
		rect(node.x+xpos,yCoord,node.width,options.defaultSize);	
	}else
	{rect(node.x+xpos,yCoord,node.width,newHeigth);
	}*/
	rect(node.x+xpos,yCoord,node.width,newHeigth);
	noStroke();
	fill(0);
	
}

function drawResumeDots(node,initialY,finalY,options,xpos,ypos){
		if(node.collapsed){
		let bar_width = options["width"] - node.x;
		let bar_heigth = node["height"] - options.defaultSize;
		let min = Math.min(bar_width ,bar_heigth);
		let max = Math.max(bar_width ,bar_heigth);
		let ratio = max/min;
		let density = node.desendece/ratio;
		let size = 0;
		if(density > 1){
			size = min/Math.sqrt(density);
		}else{
			size = min;
		}
		let radius = size - options["circle-padding"];
		let local_x = 0 ;
		let local_x_disp = node.x + xpos;
		let local_y = 0;
		let local_y_disp = node.y + ypos + options.defaultSize + size/2;
		//splits
		fill(options["split-color"]);
		let acc = 0;
		for(let taxon = 0; taxon < node.totalSplits; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
			
		}
		//merges
		fill(options["merge-color"]);
		for(let taxon = 0; taxon < node.totalMerges; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//moves

		//removes
		fill(options["remove-color"]);
		for(let taxon = 0; taxon < node.totalRemoves; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//adds
		fill(options["add-color"]);
		for(let taxon = 0; taxon < node.totalInsertions; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
			acc++;
		}
		//no change
		fill(options["equal-color"]);
		for(let taxon = 0; taxon < node.desendece - acc; taxon++){
			ellipse(local_x + local_x_disp, local_y + local_y_disp,radius,radius);
			local_x += size;
			if(local_x > bar_width){
				local_y+=size;
				local_x = 0;
			}
		}
}
}

function drawResumeCircles(node,initialY,finalY,options,xpos,ypos){

}


function drawResumeBars(node,initialY,finalY,options,xpos,ypos){
	noStroke();
	//necesita cambiarse por value of rank
	if(node.collapsed && node.r.toLowerCase() != "species"){
		let bar_width = options["width"] - Math.abs(node.x);
		let bar_heigth = node["height"] - options.defaultSize;
		let unit = bar_width/node.desendece;
		let bar_x = node.x + xpos;
		let bar_y = node.y + options.defaultSize + ypos;

		//splits
		fill(options["split-color"]);
		rect(bar_x, bar_y, node.totalSplits*unit,bar_heigth);
		bar_x += node.totalSplits*unit;
		//merges
		fill(options["merge-color"]);
		rect(bar_x, bar_y,node.totalMerges*unit,bar_heigth);
		bar_x += node.totalMerges*unit;
		//moves
		fill(options["move-color"]);
		rect(bar_x, bar_y,node.totalMoves*unit,bar_heigth);
		bar_x += node.totalMoves*unit;
		//removes
		fill(options["remove-color"]);
		rect(bar_x, bar_y, node.totalRemoves*unit,bar_heigth);
		bar_x += node.totalRemoves*unit;
		//adds
		fill(options["add-color"]);
		rect(bar_x, bar_y, node.totalInsertions*unit,bar_heigth);
		bar_x += node.totalInsertions*unit;
		//renames
		fill(options["rename-color"]);
		rect(bar_x, bar_y, node.totalRenames*unit,bar_heigth);
		bar_x += node.totalRenames*unit;
		//nonde
		fill(options["equal-color"]);
		rect(bar_x, bar_y, bar_width + (node.x + xpos - bar_x)  ,bar_heigth);
		
	}

}
