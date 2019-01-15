


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
function ls_drawLines(options){
	lines.splits.forEach(function(ln){
		line(ln.o.x,ln.o.y,ln.t.x,ln.t.y)
	});
	lines.merges.forEach(function(ln){
		line(ln.o.x,ln.o.y,ln.t.x,ln.t.y)
	});
}




async function update_lines(node){
	//reset lines
	lines = {
		splits:[],
		merges:[],
		equals:[],
		renames:[],
	}

	if(node.collapsed) openNode(node);
	else closeNode(node);
		//slowly but surely start loading lines

		


}


function openNode(originalNode){
	//remove lines going out from this node
	removeLinesOf(originalNode);
	originalNode.forEach(function(node){
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


function updateNodeLines(OriginalNode){
	proccesByLevel(originalNode,function(node){
	//if the node is present on the new
	//console.log(node.equivalent.length,filters.ranks.indexOf(node.r),node.r.toLowerCase());
	let newSplits;
	let newMerges;
	//should not insert repeated lines, insted insert the amount of ocurrences

	if(node.equivalent && node.equivalent.length > 0 && (filters.ranks.indexOf(node.r.toLowerCase()) > -1)){
				
				let fuente = node;

				//scale on parent for closed nodes
				while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
								fuente = fuente.f[fuente.f.length-1];
				}


				//executes only on left tree
				if(node.split){
					//we found a split
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						var found = false;
						newSplits.forEach(function(spl){
							if (spl.o == fuente && spl.t == target){
								newSplits++;
								found = true;
							}
						})
						if(!found)
						newSplits.push({"o": fuente, "t": target ,"a" : 1});	
					
					});
					
				//executes only on right tree
				}else if(node.equivalent[0].merge){
					//we found a merge
					node.equivalent.forEach(function(eq,index){
						let target = findOpen(eq);
						newMerges.push({"o": fuente, "t": target,"a" : 1});	
					
					});
				}
				
			}
	});
}


function findOpen(node){
	//scale on parent for closed nodes
	let fuente = node;
	while(fuente.f.length > 0 && fuente.f[fuente.f.length-1].collapsed){
		fuente = fuente.f[fuente.f.length-1];
	}
	return fuente;
}

//removes lines from node, should also remove lines from children if they exist
function removeLinesOf(node){
	lines.splits.forEach(function(spl){


	})
}


//ls draw line betwen node
function ls_drawLine(nodeA, nodeB, color){


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