


var filters = {
	ranks: ["species","infraspecies","subspecies"],

}

var lines = {
	splits:[],
	merges:[],
	equals:[],
	renames:[],
}





//draws all lines
function ls_drawLines(options,initialY,leftPos,rightPos){
	
	//console.log(lines);
	curveTightness(-2);
	smooth()
	noFill();
	stroke(options["split-color"]);
	lines.splits.forEach(function(ln){
		//console.log(ln.o.x,ln.o.y,ln.t.x,ln.t.y);
		strokeWeight(ln.a);
		ls_drawLine(options,ln.o,ln.t,leftPos,rightPos);
	});
	stroke(options["merge-color"]);
	lines.merges.forEach(function(ln){
		strokeWeight(ln.a);
		ls_drawLine(options,ln.o,ln.t,leftPos,rightPos);
	});
}



//ls draw line betwen node
function ls_drawLine(options,nodeA, nodeB,leftPos,rightPos){
	//console.log(leftPos , nodeA.x,nodeA.y, leftPos , nodeB.x,nodeB.y)
	let origin = {x: leftPos.x + nodeA.x + nodeA.tw, y: leftPos.y +nodeA.y + options.defaultSize/2}
	let goal = {x: rightPos.x + nodeB.x - nodeB.tw, y: rightPos.y + nodeB.y + options.defaultSize/2}
	curve(origin.x*2, origin.y-50,origin.x + 15 ,origin.y,goal.x -20,goal.y,goal.x ,goal.y+20);
	//line(origin.x,origin.y,goal.x,goal.y);

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
							lines.splits.push({"o": target, "t": fuente ,"a" : 1});	
							}else{
							lines.splits.push({"o": fuente, "t": target ,"a" : 1});	
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
							lines.merges.push({"o": target, "t": fuente,"a" : 1});
							}else{
							lines.merges.push({"o": fuente, "t": target,"a" : 1});
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

	console.log(lines);
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