//contains rank numeric value
var ranks = {
  "domain" : 0,
  "kingdom": 1,
  "phylum" : 2,
  "class" : 3,
  "order" : 4,
  "superfamily" : 5,
  "family" : 6,
  "subfamily" : 6.5,
  "tribe" : 6.5,
  "subtribe" : 6.6,
  "genus" : 7,
  "subgenus" : 7.5,
  "species" : 8,
  "infraspecies":9,
  "subspecies":9
  
};

function getValueOfRank(rank){
  let value = ranks[rank.toLowerCase()];
  if(value){
    return value;
  }
  return -1;
}

//breath-frist Traversing of tree
//calls a function with the nodes that needs to be processed
function proccesByLevel(root,proccesFunction){
  let pendingNodes = [];
  pendingNodes.push(root);
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop();
    if(actual !== null && actual !== undefined){
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      pendingNodes.unshift(actual.c[childIndex]);
      }
    proccesFunction(actual);
    }
  }
  
  
}

function proccesByLevelConditional(root,proccesFunction,name,value){
  let pendingNodes = [];
  pendingNodes.push(root);
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop();
    if(actual !== null && actual !== undefined){
    for(childIndex = 0; childIndex < actual.c.length; childIndex++){
      if(actual[name] == value){
        pendingNodes.unshift(actual.c[childIndex]);
      }
      }
    proccesFunction(actual);
    }
  }
 
}

function addParameterToNode(node,name,value,minRank,maxRank
){
  if(getValueOfRank(node.r) >= getValueOfRank(minRank) && getValueOfRank(node.r) <= getValueOfRank(maxRank)){
    node[name] = value;
  }
  
}

function removeParameterToNode(node,name,minRank,maxRank){
  if(getValueOfRank(node.r) >= getValueOfRank(minRank) && getValueOfRank(node.r) <= getValueOfRank(maxRank)){
    delete node[name];
  }
}
//usage example
//adds procesed to every element of the tree
//proccesByLevel(root,function(node){addParameterToNode(node,"proccesed",0)});
  
//removes procesed to every element of the tree
//proccesByLevel(root,function(node){removeParameterToNode(node,"proccesed")});

//procces a tree but remembers parent nodes, traverses on depth first
//pases two parameters the processed node an its parent nodes
function memoryTreeIteration(root,proccesFunction){
  let pendingNodes = [];
  let parentNodes = [];
  let childrenCount = [];
  
  
  
  pendingNodes.push(root);
  while(pendingNodes.length > 0){
    let actual = pendingNodes.pop();
    if(actual !== null && actual !== undefined){
    pendingNodes = pendingNodes.concat(actual.c);
    
    
    
    
    }
    //domino effect to remove finished parents
    while(parentNodes.length > 0){
        
      //see if actual parent still has children
      if(childrenCount[childrenCount.length -1] > 0){
        childrenCount[childrenCount.length -1]--;
        break;
      }else{
        parentNodes.pop();
        childrenCount.pop();
      }
    }
    
    
    
    
    //if clauses should be unified
    if(actual !== null && actual !== undefined){
    proccesFunction(actual,parentNodes);
    /*let s = "";
    parentNodes.forEach(function(p){s += p.n + "--";});
    s += actual.n;
    console.log(s);
    s = "";
    childrenCount.forEach(function(p){s += p + "--";});
    console.log(s);*/
    //push as parent if has children
    if(actual.c.length > 0){
      parentNodes.push(actual);
      childrenCount.push(actual.c.length);
    }
    }

  }
  
}

function disperceChildCount(node, parentNodes){
  let childrenAmount = node.c.length;
  node.desendece += node.c.length;
  //console.log(node.n);
  if(childrenAmount > 0){
    //sum this node children to every one of its parent nodes
    //let parents = ""
    parentNodes.forEach (function(familyNode){
      familyNode.desendece += childrenAmount;
      //parents += familyNode.n + ":"+ familyNode.cumulativeChildren +"-";
      //console.log(familyNode.n +" "+ familyNode.cumulativeChildren + "--" + node.n);
    }
    
    );
    //parents += "--->"+node.n+":"+childrenAmount;
    //console.log(parents);
  }
}

//counting childs of genus
function speciesCount(node, parentNodes){
    let childrenAmount = node.c.length;

  if(childrenAmount > 0 && node.r == "Genus"){
    //say the node has N species
    node.cumulativeChildren += node.c.length;
    //add species count ot its parents
    parentNodes.forEach (function(familyNode){
      familyNode.cumulativeChildren += childrenAmount;
    }
    
    );
  }
  }

  
function subRankCount(node, parentNodes,rank){
  let childrenAmount = node.c.length;
  
  if(getValueOfRank(node.r) < getValueOfRank(rank)){
    node["total"+rank] = 0;
  }
  
  
  if(childrenAmount > 0 && getValueOfRank(node.r) == getValueOfRank(rank) -1 ){
    //say the node has N species
    //console.log(node.r +"--"+rank + "  "+(getValueOfRank(node.r))+"/"+(getValueOfRank(rank)-1));
    node["total"+rank] += node.c.length;
    //add species count ot its parents
    //console.log(node.n);
    parentNodes.forEach (function(familyNode){
      //console.log(familyNode.n + "---" + familyNode.r +"/" +rank+ "-->" +getValueOfRank(familyNode.r)+"/"+getValueOfRank(rank))
      if(getValueOfRank(familyNode.r) < getValueOfRank(rank)){
        familyNode["total" + rank] += childrenAmount;
      }
    }
    
    );
  }
  }


function setFamiliars(node, parentNodes){
  node.f = parentNodes.slice(0); ;


}
function populateRankList(node, ranklist){
  //console.log(node.r.toLowerCase());
	node.listPosition = ranklist[node.r.toLowerCase()].length;
	ranklist[node.r.toLowerCase()].push(node);
	}

function createRankList(treeRoot){
		let ranklist = {
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
		
		proccesByLevel(treeRoot,function(node){populateRankList(node,ranklist)});
		return ranklist;
	}

function move(node, xmove, ymove){
		node.x+=xmove;
		node.y+=ymove;
	}

//moves a subtree in x or y cordinates
function moveSubtree(subtree, xmove, ymove){
		proccesByLevel(subtree,function(node){move(node,xmove,ymove)});
	}

  //let higerRank = "Family";
  //proccesByLevel(root,function(node){addParameterToNode(node,"total"+rank,0,"kingdom",higerRank)});
function countChildren(root){
  //adds procesed to every element of the tree
  proccesByLevel(root,function(node){
                  node.desendece = 0;
                  node.totalSplits = 0; 
                  node.totalMerges = 0;
                  node.totalRemoves = 0;
                  node.totalInsertions = 0;
                  node.totalInsertions = 0;
                });
  memoryTreeIteration(root,disperceChildCount);
  
  memoryTreeIteration(root,setFamiliars);
  rank = "Species";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Genus";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Subgenus";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Tribe";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Subtribe";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Subfamily";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Family";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Superfamily";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Order";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Class";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Phylum";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Infraspecies";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});
  rank = "Subgenus";
  memoryTreeIteration(root,function(node,parent){subRankCount(node,parent,rank);});

}
//console.log(tree.n);
//countChildren(tree);
//console.log(tree);
