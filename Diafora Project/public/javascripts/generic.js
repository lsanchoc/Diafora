//breath-frist Traversing of tree
//calls a function with the nodes that needs to be processed
function proccesByLevel(root, proccesFunction) {
    let pendingNodes = [];
    pendingNodes.push(root);
    while (pendingNodes.length > 0) {
        let actual = pendingNodes.pop();
        if (actual !== null && actual !== undefined) {
            for (childIndex = 0; childIndex < actual.c.length; childIndex++) {
                pendingNodes.unshift(actual.c[childIndex]);
            }
            proccesFunction(actual);
        }
    }
}

//Executes function if objecs has a parameter(name) with the value value ---> Object[name] == value
function proccesByLevelConditional(root, proccesFunction, name, value) {
    let pendingNodes = [];
    pendingNodes.push(root);
    while (pendingNodes.length > 0) {
        let actual = pendingNodes.pop();
        if (actual !== null && actual !== undefined) {
            for (childIndex = 0; childIndex < actual.c.length; childIndex++) {
                if (actual[name] == value) {
                    pendingNodes.unshift(actual.c[childIndex]);
                }
            }
            proccesFunction(actual);
        }
    }
}

//usage example
//adds procesed to every element of the tree
//proccesByLevel(root,function(node){addParameterToNode(node,"proccesed",0)});

//removes procesed to every element of the tree
//proccesByLevel(root,function(node){removeParameterToNode(node,"proccesed")});

//procces a tree but remembers parent nodes, traverses on depth first
//pases two parameters the processed node an its parent nodes
function memoryTreeIteration(root, proccesFunction) {
    let pendingNodes = [];
    let parentNodes = [];
    let childrenCount = [];

    pendingNodes.push(root);
    while (pendingNodes.length > 0) {
        let actual = pendingNodes.pop();
        if (actual !== null && actual !== undefined) {
            pendingNodes = pendingNodes.concat(actual.c);
        }
        //domino effect to remove finished parents
        while (parentNodes.length > 0) {
            //see if actual parent still has children
            if (childrenCount[childrenCount.length - 1] > 0) {
                childrenCount[childrenCount.length - 1]--;
                break;
            } else {
                parentNodes.pop();
                childrenCount.pop();
            }
        }

        //if clauses should be unified
        if (actual !== null && actual !== undefined) {
            proccesFunction(actual, parentNodes);
            //push as parent if has children
            if (actual.c.length > 0) {
                parentNodes.push(actual);
                childrenCount.push(actual.c.length);
            }
        }
    }
}
