


var filters = {
	ranks: ["species","infraspecies","subspecies"],

}

var lines = {
	splits:[],
	merges:[],
	equals:[],
	renames:[],
	moves:[],
	groups:[],
}

//c is color
function setLineColor(line, options){
	switch(line.c){
		case "split":
			stroke(options["split-color"]);
			break;
		case "merge":
			stroke(options["merge-color"]);
			break;
		case "rename":
			stroke(options["rename-color"]);
			break;
		case "equal":
			stroke(options["equal-color"]);
			break;
		case "move":
			stroke(options["move-color"]);
			break;
		default:
			stroke(0);
	}
}


//random for debug
var seed = 1;
function custom_random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


//draws all lines
function ls_drawLines(options,initialY,leftPos,rightPos, bundling){
	
	//console.log(lines);
	curveTightness(0);
	//smooth()
	//noFill();
	//stroke(options["split-color"]);
	/*lines.splits.forEach(function(ln){
		//console.log(ln.o.x,ln.o.y,ln.t.x,ln.t.y);
		strokeWeight(ln.a);
		ls_drawLine(options,ln.o,ln.t,leftPos,rightPos);
		//let media = getMedia(ln, leftPos,rightPos);
		//ellipse(media.x,media.y,30,30);
	});
	stroke(options["merge-color"]);
	lines.merges.forEach(function(ln){
		strokeWeight(ln.a);
		ls_drawLine(options,ln.o,ln.t,leftPos,rightPos);
		//let media = getMedia(ln, leftPos,rightPos);
		//ellipse(media.x,media.y,30,30);
	});*/


	fill(255,0,0);
	//draw group data
//rq

	seed = 328;
	//draw lines on bundles
	lines.groups.forEach(
		(group) =>{
			stroke(custom_random()*255,custom_random()*255,custom_random()*255);
			group.l.forEach(
				(line) => {
					strokeWeight(Math.min(line.a,14));
					//setLineColor(line,options);
					let newCenter = getMedia(line, leftPos,rightPos);
					newCenter = {x: (group.m.x *bundling + newCenter.x*(1-bundling)), y: (group.m.y *bundling + newCenter.y*(1-bundling))}
					ls_drawTreePointLine(options,line.o,line.t,newCenter, leftPos,rightPos);
				}
			)
		}
	)

	//center of bundle
	/*
	lines.groups.forEach(
		(group) => {
			ellipse(group.m.x,group.m.y,20,20);
		}
	);
	*/

}



//ls draw line betwen node
function ls_drawLine(options,nodeA, nodeB,leftPos,rightPos){
	//console.log(leftPos , nodeA.x,nodeA.y, leftPos , nodeB.x,nodeB.y)
	let origin = {x: leftPos.x + nodeA.x + nodeA.tw, y: leftPos.y +nodeA.y + options.defaultSize/2}
	let goal = {x: rightPos.x + nodeB.x - nodeB.tw, y: rightPos.y + nodeB.y + options.defaultSize/2}
	curve(origin.x*2, origin.y-50,origin.x + 15 ,origin.y,goal.x -20,goal.y,goal.x ,goal.y+20);
	//line(origin.x,origin.y,goal.x,goal.y);
}

function ls_drawTreePointLine(options,nodeA, nodeB,center,leftPos,rightPos){
	 	let origin = {x: leftPos.x + nodeA.x + nodeA.tw, y: leftPos.y +nodeA.y + options.defaultSize/2}
		let goal = {x: rightPos.x + nodeB.x - nodeB.tw, y: rightPos.y + nodeB.y + options.defaultSize/2}


		let dist = 0.7;
		let mid_origin_center = {x: (origin.x* dist + center.x*(1-dist)), y: (origin.y* dist + center.y*(1-dist))}
		let mid_goal_center = {x: (goal.x* dist + center.x*(1-dist)), y: (goal.y* dist + center.y*(1-dist))}

		//debug middle
		ellipse(center.x,center.y,5,5);

		let extra = 10;
	 	noFill();
        beginShape();
        curveVertex(origin.x,origin.y);
        curveVertex(origin.x,origin.y);
        bezierVertex(mid_origin_center.x,mid_origin_center.y,origin.x,origin.y,origin.x,origin.y);
        curveVertex(center.x,center.y);
        bezierVertex(goal.x,goal.y,mid_goal_center.x,mid_goal_center.y,goal.x,goal.y);
        curveVertex(goal.x,goal.y);
        endShape();



        //drawBezierPoints(mid_origin_center.x,mid_origin_center.y,origin.x,origin.y,origin.x,origin.y);
        //drawBezierPoints(goal.x,goal.y,mid_goal_center.x,mid_goal_center.y,goal.x,goal.y);
        //drawBezierPoints(center.x -extra,center.y, center.x + extra,center.y, center.x,center.y);
}

function drawBezierPoints(x1,y1,x2,y2,x3,y3){
 		ellipse(x1,y1,10,10);
        ellipse(x2,y2,10,10);
        ellipse(x3,y3,10,10);
}



async function update_lines(node,isRight){
	//reset lines
	/*lines = {
		splits:[],
		merges:[],
		equals:[],
		renames:[],
	}*/
	if(node.collapsed) closeNode(node,isRight);
	else openNode(node,isRight);
		//slowly but surely start loading lines

		


}


function openNode(originalNode,isRight){
	//remove lines going out from this node
	removeLinesOf(originalNode);
	originalNode.c.forEach(function(node){
		updateNodeLines(node,isRight);
	})
	//add the lines of every children
}

function closeNode(node,isRight){
	//go to a rank and execute updating function
	removeLinesAndChildrenOf(node);
	updateNodeLines(node,isRight);
	//console.log(lines);
}


function updateNodeLines(originalNode,isRight){
	//console.log("updating lines " + originalNode.n);
	proccesByLevel(originalNode,function(node){
	//if the node is present on the new
	//console.log(node.equivalent.length,filters.ranks.indexOf(node.r),node.r.toLowerCase());
	//let newSplits;
	//let newMerges;
	//should not insert repeated lines, insted insert the amount of ocurrences
	if(node.equivalent && node.equivalent.length > 0 && (filters.ranks.indexOf(node.r.toLowerCase()) > -1)){
				//console.log(node.n);
				let fuente = node;

				//scale on parent for closed nodes
				
				while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
								fuente = fuente.f[fuente.f.length-1];
				}

				/*node.equivalent.forEach(function(eq,index){
					console.log(eq.merge);
				});*/
				//executes only on left tree

				if(node.split || node.equivalent[0].split /*&& node.equivalent.length > 1*/){
					//we found a split
					node.equivalent.forEach(function(eq,index){
						console.log("split!!!");
						let target = findOpen(eq);
						var found = false;
						lines.splits.forEach(function(spl){
							if ((spl.o == fuente && spl.t == target) || (spl.o == target && spl.t == fuente)){
								spl.a++;
								found = true;
							}
						})
						if(!found){
							if(isRight){
							lines.splits.push({"o": target, "t": fuente ,"a" : 1, c:"split"});	
							}else{
							lines.splits.push({"o": fuente, "t": target ,"a" : 1, c:"split"});	
							}
						}
						
						
					});
					
				//executes only on right tree
				}else if(node.equivalent[0].merge || node.merge){
					//we found a merge
					//console.log("merge!!!");
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						lines.merges.forEach(function(mrg){
							if ((mrg.o == fuente && mrg.t == target) || (mrg.o == target && mrg.t == fuente)){
								mrg.a++;
								found = true;
							}
						})
						if(!found){
							if(isRight){
							lines.merges.push({"o": target, "t": fuente,"a" : 1,c:"merge"});
							}else{
							lines.merges.push({"o": fuente, "t": target,"a" : 1,c:"merge"});
							}
						}
						//console.log("found: " +found);
					});
				}else if(node.rename || node.equivalent[0].rename ){
					//we found a merge
					//console.log("merge!!!");
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						lines.renames.forEach(function(rnm){
							if ((rnm.o == fuente && rnm.t == target) || (rnm.o == target && rnm.t == fuente)){
								rnm.a++;
								found = true;
							}
						})
						if(!found){
							if(isRight){
							lines.renames.push({"o": target, "t": fuente,"a" : 1,c:"rename"});
							}else{
							lines.renames.push({"o": fuente, "t": target,"a" : 1,c:"rename"});
							}
						}
						//console.log("found: " +found);
					});
				}else if(node.moved || node.equivalent[0].moved){
					//we found a merge
					//console.log("merge!!!");
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						lines.moves.forEach(function(mov){
							if ((mov.o == fuente && mov.t == target) || (mov.o == target && mov.t == fuente)){
								mov.a++;
								found = true;
							}
						})
						if(!found){
							if(isRight){
							lines.moves.push({"o": target, "t": fuente,"a" : 1,c:"move"});
							}else{
							lines.moves.push({"o": fuente, "t": target,"a" : 1,c:"move"});
							}
						}
						//console.log("found: " +found);
					});
				}else{
					//we found a merge
					//console.log("merge!!!");
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						lines.equals.forEach(function(mrg){
							if ((mrg.o == fuente && mrg.t == target) || (mrg.o == target && mrg.t == fuente)){
								mrg.a++;
								found = true;
							}
						})
						if(!found){
							if(isRight){
							lines.equals.push({"o": target, "t": fuente,"a" : 1,c:"equal"});
							}else{
							lines.equals.push({"o": fuente, "t": target,"a" : 1,c:"equal"});
							}
						}
						//console.log("found: " +found);
					});
				}
				
			}
	});
	//console.log(lines);
	//console.log(newSplits,newMerges);
}


function findOpen(node){
	//scale on parent for closed nodes
	if(node.collapsed == false) return node;
	let fuente = node;
	while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
		fuente = fuente.f[fuente.f.length-1];
	}
	return fuente;
}


function removeLinesAndChildrenOf(node,isRight){
	let pending = [];
	pending.push(node)
	while(pending.length > 0){
		//inneficient could pass array of nodes and compare all at once, if
		//sorted could be even more eficient
		var currentNode = pending.pop();
		removeLinesOf(currentNode);
		pending = pending.concat(currentNode.c);
		//console.log(pending)
	}

}

//removes lines from node, should also remove lines from children if they exist
function removeLinesOf(node){
	
	let newSplits = [];
	lines.splits.forEach(function(spl){
		if(spl.o.n != node.n && spl.t.n != node.n ){
			newSplits.push(spl);
		}else{
			console.log("Removed splits: ", spl.o.n, "  ", spl.t.n);
		}

	})
	lines.splits = newSplits;


	let newMerges = [];
	lines.merges.forEach(function(mrg){
		if(mrg.o.n != node.n && mrg.t.n != node.n){
			newMerges.push(mrg);
		}else{
			console.log("Removed merges: ", mrg.o.n, "  ", mrg.t.n);
		}


	})
	lines.merges = newMerges;

	let newRenames = [];
	lines.renames.forEach(function(rnm){
		if(rnm.o.n != node.n && rnm.t.n != node.n){
			newRenames.push(rnm);
		}else{
			console.log("Removed renames: ", rnm.o.n, "  ", rnm.t.n);
		}


	})

	lines.renames = newRenames;

	let newEquals = [];
	lines.equals.forEach(function(eql){
		if(eql.o.n != node.n && eql.t.n != node.n){
			newEquals.push(eql);
		}else{
			console.log("Removed merges: ", eql.o.n, "  ", eql.t.n);
		}


	})
	lines.equals = newEquals;

	let newMoves = [];
	lines.moves.forEach(function(mov){
		if(mov.o.n != node.n && mov.t.n != node.n){
			newMoves.push(mov);
		}else{
			console.log("Removed merges: ", mov.o.n, "  ", mov.t.n);
		}


	})
	lines.moves = newMoves;

	//console.log(lines);
}





//bundling
//sorts all lines in array by media
function sort_lines_simple(line_array,posL,posR){
	//console.log(posR,posL);
	line_array.sort(
		(a,b) => { 
			let mediaA = getMedia(a,posL,posR).y;
			let mediaB = getMedia(b,posL,posR).y;
			if(mediaA > mediaB){
				return 1;
			}else if(mediaA < mediaB){
				return -1;
			}else{
				return 0;
			}
		}

	)

}


function createBundles(posL,posR,radius){
	let median = [];
	let all_lines = lines.splits.concat(lines.merges.concat(lines.renames.concat(/*lines.equals*/ lines.moves)));
	sort_lines_simple(all_lines,posL,posR);
	groupsOf(all_lines,posR,posL,radius)



}


//based on dbscanAlgorithm customized for grouping of line mid point
//from https://towardsdatascience.com/the-5-clustering-algorithms-data-scientists-need-to-know-a36d136ef68
function groupsOf(all_lines,posL,posR,radius){
	let groups = [];

	//stores nodes that need to get its distance compared
	let pivot_index = [];
	//gets a random starting poin
	


	let actualGroup = undefined;

	while(all_lines.length > 0){


		//there are no neighbors in range
		if(pivot_index.length <= 0){

			if(actualGroup) groups.push(actualGroup);
			
			pivot_index.push(Math.floor(Math.random() * Math.floor(all_lines.length-1)));
			actualGroup = {m :{x:0,y:0}, l:[]}
			//console.log("Random!!");
		}


		//get latest pivot node
		let current_index = pivot_index.pop();
		let pivot_line = all_lines[current_index];
		if(!pivot_line) continue; //skip current cicle
		//console.log(current_index,pivot_line,all_lines.length,all_lines,pivot_index);
		let pivot_media = getMedia(pivot_line,posL,posR);
		
		//remove from lines
		all_lines.splice(current_index,1);

		
		//update media of group
		actualGroup.m.x *= actualGroup.l.length/(actualGroup.l.length+1);
		actualGroup.m.x += pivot_media.x/(actualGroup.l.length+1);
		//console.log(actualGroup.m.x,pivot_media.x);
		actualGroup.m.y *= actualGroup.l.length/(actualGroup.l.length+1);
		actualGroup.m.y += pivot_media.y/(actualGroup.l.length+1);

		//update actual group
		actualGroup.l.push(pivot_line);

		//search if next item is close enought
		if(current_index  < all_lines.length -1 && getPointDistance( pivot_media,getMedia(all_lines[current_index],posL,posR)) < radius){
			//console.log("inside top : ",current_index);

			pivot_index.push(current_index);
		}
		//search if previous item is close enought
		if(current_index  >= 1 && getPointDistance(pivot_media , getMedia(all_lines[current_index -1],posL,posR)) < radius ){
			//console.log("inside bot : ",current_index -1);
			//smaler should be removed at last
			pivot_index.unshift(current_index-1);
		}
		//console.log("continuing");

		
	}
	//push last group
	if(actualGroup) groups.push(actualGroup);

	//console.log(groups.length);

	

	lines.groups = groups;
}


function getMedia(line, posL,posR){
	let newMedian = {};
	newMedian.x = (line.o.x+posL.x+line.t.x+posR.x)/2;
	newMedian.y = (line.o.y+posL.y+line.t.y+posR.y)/2;
	return newMedian;
}


//euclidean distance
//could use 1 dimensional distance of y axis
function getPointDistance(pointA,pointB){
	let a = pointA.x - pointB.x;
	let b = pointA.y - pointB.y;
	//let c = Math.sqrt( a*a + b*b );
	return Math.sqrt( a*a + b*b );;
}















//compares object content
//from http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}