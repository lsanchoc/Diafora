


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
	stroke(options["split-color"]);
	lines.splits.forEach(function(ln){
		//console.log(ln.o.x,ln.o.y,ln.t.x,ln.t.y);
		strokeWeight(ln.a);
		ls_drawLine(ln.o,ln.t,rightPos,leftPos);
	});
	stroke(options["merge-color"]);
	lines.merges.forEach(function(ln){
		strokeWeight(ln.a);
		ls_drawLine(ln.o,ln.t,leftPos,rightPos);
	});
}



//ls draw line betwen node
function ls_drawLine(nodeA, nodeB,leftPos,rightPos){
	//console.log(leftPos , nodeA.x,nodeA.y, leftPos , nodeB.x,nodeB.y)
	line(leftPos.x + nodeA.x, nodeA.y, rightPos.x + nodeB.x,nodeB.y);

}



async function update_lines(node){
	//reset lines
	/*lines = {
		splits:[],
		merges:[],
		equals:[],
		renames:[],
	}*/

	if(node.collapsed) closeNode(node);
	else openNode(node);
		//slowly but surely start loading lines

		


}


function openNode(originalNode){
	//remove lines going out from this node
	removeLinesOf(originalNode);
	originalNode.c.forEach(function(node){
		updateNodeLines(node);
	})
	//add the lines of every children

	
	
}

function closeNode(node){
	//go to a rank and execute updating function
	removeLinesOf(node);
	updateNodeLines(node);
	console.log(lines);
}


function updateNodeLines(originalNode){
	console.log("updating lines " + originalNode.n);
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

				if(node.split || node.equivalent[0].split && node.equivalent.length > 1){
					//we found a split
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;

						lines.splits.forEach(function(spl){
							if (spl.o == fuente && spl.t == target){
								spl.a++;
								found = true;
							}
						})
						if(!found)
						lines.splits.push({"o": fuente, "t": target ,"a" : 1});	
						
					});
					
				//executes only on right tree
				}else if(node.equivalent[0].merge || node.merge){
					//we found a merge
					console.log("merge!!!");
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						lines.merges.forEach(function(mrg){
							if (mrg.o == fuente && mrg.t == target){
								mrg.a++;
								found = true;
							}
						})
						if(!found)
						lines.merges.push({"o": fuente, "t": target,"a" : 1});	
						console.log("found: " +found);
					});
				}
				
			}
	});

	//console.log(newSplits,newMerges);
}


function findOpen(node){
	//scale on parent for closed nodes
	let fuente = node;
	while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
		fuente = fuente.f[fuente.f.length-1];
	}
	return fuente;
}


function removeLinesAndChildrenOf(node){
	let pending = [];
	pending.push(node)
	while(pending.length > 0){
		//inneficient could pass array of nodes and compare all at once, if
		//sorted could be even more eficient
		removeLinesOf(node);
		pending.push(node.c);
	}

}

//removes lines from node, should also remove lines from children if they exist
function removeLinesOf(node){
	
	let newSplits = [];
	lines.splits.forEach(function(spl){
		if(spl.o != node && spl.t != node ){
			newSplits.push(spl);
		}

	})
	lines.splits = newSplits;


	let newMerges = [];
	lines.merges.forEach(function(mrg){
		if(mrg.o != node && mrg.t != node){
			newMerges.push(mrg);
		}

	})
	lines.merges = newMerges;


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