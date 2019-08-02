//constant with the ranks to take into consideration for tasks
const families = [
    'phylum',
    'class',
    'order',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'subgenus',
    'species',
    'infraspecies',
    'subspecies',
];
//todo tasks:
/**
 * -Some nodes ares spliting and merging at the same time
 *
 *
 */
//rename cambia el nombre si o si

//calcular splits por familia
//calcular removes adds y moves
//moved significa que el nodo se movio, si tiene equivalent, significa que el nodo persiste;
async function verificar_name_changes(left_nodes, rigth_nodes) {
    let left_map = {};
    let rigth_map = {};

    //initialization and mapping of every node in the hierarchy
    left_nodes.forEach(function(node) {
        if (!left_map[node.n]) {
            left_map[node.n] = [];
        }
        left_map[node.n].push(node);
        node.moved = false;
        //node.sinonym_number = 0;
        node.equivalent = [];
        //console.log(typeof left_map[node.n]);
    });

    rigth_nodes.forEach(function(node) {
        if (!rigth_map[node.n]) {
            rigth_map[node.n] = [];
        }
        rigth_map[node.n].push(node);
        node.moved = false;
        node.equivalent = [];
        //node.sinonym_number = 0;
        //console.log(node);
    });

    //console.log({left_map})
    //search for new nodes, and moves

    left_nodes.forEach(node => {
        let equivalentArray = rigth_map[node.n];
        if (equivalentArray) {
            equivalentArray.forEach(equivalent => {
                if (equivalent && compare_author_date(node, equivalent)) {
                    node.equivalent.push(equivalent);

                    //equivalent.equivalent.push(node);
                    //Compare the parent of each node, check if parents changed
                    if (
                        node.f.length > 0 &&
                        equivalent.f[equivalent.f.length - 1].n !=
                            node.f[node.f.length - 1].n
                    ) {
                        node.moved = true;
                        equivalent.moved = true;

                        //increase move counter for familiar nodes
                        node.f.forEach(function(familiar) {
                            familiar.totalMoves++;
                        });
                    }
                }
            });
        }
    });

    rigth_nodes.forEach(node => {
        let equivalentArray = left_map[node.n];
        if (equivalentArray) {
            equivalentArray.forEach(equivalent => {
                if (equivalent && compare_author_date(node, equivalent)) {
                    node.equivalent.push(equivalent);

                    //equivalent.equivalent.push(node);
                    //Compare the parent of each node, check if parents changed
                    if (
                        node.f.length > 0 &&
                        equivalent.f[equivalent.f.length - 1].n !=
                            node.f[node.f.length - 1].n
                    ) {
                        node.moved = true;
                        equivalent.moved = true;

                        //increase move counter for familiar nodes
                        node.f.forEach(function(familiar) {
                            familiar.totalMoves++;
                        });
                    }
                }
            });
        }
    });

    //compare nodes to other node synonims
    //let synonims_left = [];
    //let synonims_rigth = [];

    //add synonim to node
    left_nodes.forEach(function(node) {
        node.s.forEach(function(sinonym) {
            //console.log(sinonym);
            let sinonym_node_array = rigth_map[sinonym.n];
            if (sinonym_node_array)
                sinonym_node_array.forEach(sinonym_node => {
                    if (
                        sinonym_node &&
                        compare_author_date(node, sinonym_node) &&
                        node.n != sinonym.n
                    ) {
                        if (!containsObject(node, sinonym_node.equivalent))
                            node.equivalent.push(sinonym_node);
                        if (!containsObject(node, sinonym_node.equivalent)) {
                            sinonym_node.equivalent.push(node);
                        }

                        //synonims_left.push({left: node, rigth: sinonym_node});
                    }
                });
        });
    });

    //add synonim to node
    rigth_nodes.forEach(function(node) {
        node.s.forEach(function(sinonym) {
            let sinonym_node_array = left_map[sinonym.n];
            if (sinonym_node_array)
                sinonym_node_array.forEach(sinonym_node => {
                    if (
                        sinonym_node &&
                        compare_author_date(node, sinonym_node) &&
                        node.n != sinonym.n
                    ) {
                        if (!containsObject(node, sinonym_node.equivalent))
                            node.equivalent.push(sinonym_node);
                        if (!containsObject(node, sinonym_node.equivalent)) {
                            sinonym_node.equivalent.push(node);
                        }
                        //synonims_rigth.push({left: sinonym_node, rigth: node});
                    }
                });
        });
    });

    //console.log({"synonims_left" : synonims_left, "synonims_rigth" : synonims_rigth});
    //return {"synonims_left" : synonims_left, "synonims_rigth" : synonims_rigth};
}

//preguntar sobre el conteo de splits
//tasks like merges and splits stop being exclusive
function name_changes_left(node_list) {
    node_list.forEach(function(node) {
        let equivalence = node.equivalent.length;

        //check for merge ---------------------------------------------------------------------------------------
        if (equivalence > 1) {
            //console.log(node);
            node.f.forEach(function(familiar) {
                familiar.totalSplits++;
            });
            node.split = true;
        } else if (equivalence == 1 && !node.moved) {
            let eq_node = node.equivalent[0];
            let same_author = compare_author(node.a, eq_node.a);

            //check for  rename ----------------------------------------------------------------------------------
            if (node.n == eq_node.n && same_author) {
                node.rename = false;
            } else {
                node.rename = true;
                node.f.forEach(function(familiar) {
                    familiar.totalRenames++;
                });
            }
            //node.rename = true;
            //check for remove ---------------------------------------------------------------------------------------
        } else if (equivalence == 0) {
            node.removed = true;
            node.f.forEach(function(familiar) {
                familiar.totalRemoves++;
            });
        }
    });
}

//try to store info on left side
//preguntar sobre el conteo de merges
function name_changes_right(node_list) {
    node_list.forEach(function(node) {
        let equivalence = node.equivalent.length;
        //check for merge ---------------------------------------------------------------------------------------
        if (equivalence > 1) {
            node.f.forEach(function(familiar) {
                familiar.totalMerges++;
            });
            node.merge = true;
        } else if (equivalence == 1 && !node.moved) {
            let eq_node = node.equivalent[0];
            let same_author = compare_author(node.a, eq_node.a);

            //check for  rename ----------------------------------------------------------------------------------
            if (node.n == eq_node.n && same_author) {
                node.rename = false;
            } else {
                //console.log(node.a,eq_node);
                node.rename = true;
                node.f.forEach(function(familiar) {
                    familiar.totalRenames++;
                });
            }
            //check for remove ---------------------------------------------------------------------------------------
        } else if (equivalence == 0) {
            node.added = true;
            node.f.forEach(function(familiar) {
                familiar.totalInsertions++;
            });
        }
    });
}

//executes task searching functions for each rank

function calculate_all_merges(left_tree, rigth_tree) {
    families.forEach(function(rank) {
        verificar_name_changes(left_tree[rank], rigth_tree[rank]);
        name_changes_left(left_tree[rank]);
        name_changes_right(rigth_tree[rank]);
    });
}

//compare actor of nodes
function compare_author(first_author, second_author) {
    if (first_author.length != second_author.length) {
        return false;
    } else {
        for (
            let author_slot = 0;
            author_slot < first_author.length;
            author_slot++
        ) {
            if (first_author[author_slot] != second_author[author_slot]) {
                //console.log({first_author,second_author});
                return false;
            }
        }
        return true;
    }
}

//compares author date of two nodes
function compare_author_date(first_author, second_author) {
    if (
        first_author.a.length != second_author.a.length ||
        first_author.ad.length != second_author.ad.length
    ) {
        return false;
    } else {
        for (
            let author_slot = 0;
            author_slot < first_author.a.length;
            author_slot++
        ) {
            if (first_author.a[author_slot] != second_author.a[author_slot]) {
                //console.log({first_author,second_author});
                return false;
            }
        }
        for (
            let author_slot = 0;
            author_slot < first_author.ad.length;
            author_slot++
        ) {
            if (first_author.ad[author_slot] != second_author.ad[author_slot]) {
                //console.log({first_author,second_author});
                return false;
            }
        }
        return true;
    }
}

//helper function
function containsObject(obj, list) {
    var i;

    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}
