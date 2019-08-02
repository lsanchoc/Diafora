//contains rank numeric value
var ranks = {
    domain: 0,
    kingdom: 1,
    phylum: 2,
    class: 3,
    order: 4,
    superfamily: 5,
    family: 6,
    subfamily: 6.5,
    tribe: 6.5,
    subtribe: 6.6,
    genus: 7,
    subgenus: 7.5,
    species: 8,
    infraspecies: 9,
    subspecies: 9,
};

//return a numeric value from a string containing a rank
function getValueOfRank(rank) {
    let value = ranks[rank.toLowerCase()];
    if (value) {
        return value;
    }
    return -1;
}

//receives a nod and adds a parameter based on their rank
function addParameterToNode(node, name, value, minRank, maxRank) {
    if (
        getValueOfRank(node.r) >= getValueOfRank(minRank) &&
        getValueOfRank(node.r) <= getValueOfRank(maxRank)
    ) {
        node[name] = value;
    }
}

//removes a parameter from node based on rank
function removeParameterToNode(node, name, minRank, maxRank) {
    if (
        getValueOfRank(node.r) >= getValueOfRank(minRank) &&
        getValueOfRank(node.r) <= getValueOfRank(maxRank)
    ) {
        delete node[name];
    }
}

//counts all nodes in the tree
function disperceChildCount(node, parentNodes) {
    let childrenAmount = node.c.length;
    node.desendece += node.c.length;
    if (childrenAmount > 0) {
        //sum this node children to every one of its parent nodes
        parentNodes.forEach(function(familyNode) {
            familyNode.desendece += childrenAmount;
        });
    }
}

//counting childs of genus
function speciesCount(node, parentNodes) {
    let childrenAmount = node.c.length;

    if (childrenAmount > 0 && node.r == 'Genus') {
        //say the node has N species
        node.cumulativeChildren += node.c.length;
        //add species count ot its parents
        parentNodes.forEach(function(familyNode) {
            familyNode.cumulativeChildren += childrenAmount;
        });
    }
}

//counts all nodes below the specified rank
function subRankCount(node, parentNodes, rank) {
    let childrenAmount = node.c.length;

    if (getValueOfRank(node.r) < getValueOfRank(rank)) {
        node['total' + rank] = 0;
    }

    if (
        childrenAmount > 0 &&
        getValueOfRank(node.r) == getValueOfRank(rank) - 1
    ) {
        //say the node has N species
        node['total' + rank] += node.c.length;
        //add species count ot its parents
        parentNodes.forEach(function(familyNode) {
            if (getValueOfRank(familyNode.r) < getValueOfRank(rank)) {
                familyNode['total' + rank] += childrenAmount;
            }
        });
    }
}

function setFamiliars(node, parentNodes) {
    node.f = parentNodes.slice(0);
}

//push node in its corresponding rank on rank list
function populateRankList(node, ranklist) {
    //console.log(node.r.toLowerCase());
    node.listPosition = ranklist[node.r.toLowerCase()].length;
    ranklist[node.r.toLowerCase()].push(node);
}

function createRankList(treeRoot) {
    let ranklist = {
        domain: [],
        kingdom: [],
        phylum: [],
        class: [],
        order: [],
        superfamily: [],
        family: [],
        subfamily: [],
        tribe: [],
        subtribe: [],
        genus: [],
        subgenus: [],
        species: [],
        infraspecies: [],
        subspecies: [],
    };

    proccesByLevel(treeRoot, function(node) {
        populateRankList(node, ranklist);
    });
    return ranklist;
}

function move(node, xmove, ymove) {
    node.x += xmove;
    node.y += ymove;
}

//moves a subtree in x or y cordinates
function moveSubtree(subtree, xmove, ymove) {
    proccesByLevel(subtree, function(node) {
        move(node, xmove, ymove);
    });
}

//let higerRank = "Family";
//proccesByLevel(root,function(node){addParameterToNode(node,"total"+rank,0,"kingdom",higerRank)});
function countChildren(root) {
    //adds procesed to every element of the tree
    proccesByLevel(root, function(node) {
        node.desendece = 0;
        node.totalSplits = 0;
        node.totalMerges = 0;
        node.totalRemoves = 0;
        node.totalInsertions = 0;
        node.totalMoves = 0;
        node.totalRenames = 0;
        node.tw = 0; //textWidth
        node.p = 0;
    });
    memoryTreeIteration(root, disperceChildCount);

    memoryTreeIteration(root, setFamiliars);

    //executes code for every rank could be a for
    let all_ranks_processed = [
        'Species',
        'Genus',
        'Subgenus',
        'Tribe',
        'Subtribe',
        'Subfamily',
        'Family',
        'Superfamily',
        'Order',
        'Class',
        'Phylum',
        'Infraspecies',
        'subgenus',
    ];

    all_ranks_processed.forEach(current_rank => {
        //counts all aparitions of the nodes with the target rank( current_Rank)
        memoryTreeIteration(root, function(node, parent) {
            subRankCount(node, parent, current_rank);
        });
    });
}
