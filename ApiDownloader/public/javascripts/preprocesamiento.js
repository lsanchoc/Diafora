const families = [	"class",
					"order",
					"superfamily",
					"family",
					"subfamily",
					"tribe",
					"subtribe",
					"genus",
					"subgenus",
					"species",
					"infraspecies",
					"subspecies"];
//todo tasks:
/*
Renames 
*/
//rename cambia el nombre si o si


//calcular splits por familia
//calcular removes adds y moves
//moved significa que el nodo se movio, si tiene equivalent, significa que el nodo persiste;
async function verificar_name_changes(left_nodes, rigth_nodes){
	let left_map = {};
	let rigth_map = {};

	//initialization and mapping of every node in the hierarchy
	left_nodes.forEach(function (node){
		left_map[node.n] = node;
		node.moved = false;
		//node.sinonym_number = 0;
		node.equivalent = [];
		console.log(node);
	});

	rigth_nodes.forEach(function (node){
		rigth_map[node.n] = node;
		node.moved = false;
		node.equivalent = [];
		//node.sinonym_number = 0;
		//console.log(node);
	});


	//search for new nodes, and moves
	left_nodes.forEach(
		function(node){
			let equivalent = rigth_map[node.n];
			if(equivalent){
				//eq is the equivalent node
				//we have to verify author and date
				/*if(node.a != equivalent.a || node.ad != equivalent.ad){
					node.author_changed = true;
					equivalent.author_changed = true;
				}*/
				
				node.equivalent.push(equivalent);
				//equivalent.equivalent.push(node);
				//Compare the parent of each node
				if(node.f.length > 0 && equivalent.f[equivalent.f.length - 1].n != node.f[node.f.length - 1].n){
					node.moved = true;
					equivalent.moved = true;
					//increase move counter for familiar nodes
					node.f.forEach(
					function(familiar){
						familiar.totalMoves++;
					}
					)
				}
			}
		}
	);

	//search for removes, and moves
	//duplicated work, should be optimized
	rigth_nodes.forEach(
		function(node){
			let equivalent = left_map[node.n];
			if(equivalent){
				//eq is the equivalent node
				//we have to verify author and date
				/*if(node.a != equivalent.a || node.ad != equivalent.ad){
					node.author_changed = true;
					equivalent.author_changed = true;
				}*/
				node.equivalent.push(equivalent);
				//equivalent.equivalent.push(node);
				//Compare the parent of each node
				if(node.f.length > 0 && equivalent.f[equivalent.f.length - 1].n != node.f[node.f.length - 1].n){
					node.moved = true;
					equivalent.moved = true;
					//increase move counter for familiar nodes
					node.f.forEach(
					function(familiar){
						familiar.totalMoves++;
					}
					)

				}
			}
		}
	);



	let synonims_left = [];
	let synonims_rigth = [];

	//add synonim to node
	left_nodes.forEach(function (node){
		node.s.forEach(function(sinonym){
			console.log(sinonym);
			let sinonym_node = rigth_map[sinonym.n];
			if(sinonym_node && compare_author_date(node,sinonym_node)){
				node.equivalent.push(sinonym_node);
				synonims_left.push({left: node, rigth: sinonym_node});
			}
		});
	});

	//add synonim to node
	rigth_nodes.forEach(function (node){
		node.s.forEach(function(sinonym){
			let sinonym_node = left_map[sinonym.n];
			if(sinonym_node && compare_author_date(node,sinonym_node)){
				node.equivalent.push(sinonym_node);
				synonims_rigth.push({left: sinonym_node, rigth: node});
			}
		});
	});

	//console.log({"synonims_left" : synonims_left, "synonims_rigth" : synonims_rigth});
	//return {"synonims_left" : synonims_left, "synonims_rigth" : synonims_rigth};
}

//preguntar sobre el conteo de splits
function name_changes_left(node_list){
	node_list.forEach(
		function(node){
			let equivalence = node.equivalent.length;
			//console.log(equivalence);
			 if(equivalence > 1){

				node.f.forEach(function(familiar){familiar.totalSplits++});
				//node.equivalent.forEach(function(eq){eq.f.forEach(function(familiar){familiar.totalSplits++})});
				node.split = true;
			}else if(equivalence == 1 && !node.moved){
				let eq_node = node.equivalent[0];
				let same_author = compare_author(node.a,eq_node.a);
				
				if(node.n == eq_node.n && same_author){
					node.rename = false;
				}else{
					node.rename = true;
					node.f.forEach(
					function(familiar){
						familiar.totalRenames++;
					}
					)
				}
				//node.rename = true;
			}else{
				node.removed = true;
				node.f.forEach(
					function(familiar){
						familiar.totalRemoves++;
					}
				)
			}
		}
	);
}

//preguntar sobre el conteo de merges
function name_changes_right(node_list){
	node_list.forEach(
		function(node){
			let equivalence = node.equivalent.length;
			if(equivalence > 1){
				node.f.forEach(function(familiar){familiar.totalMerges++});
				//node.equivalent.forEach(function(eq){eq.f.forEach(function(familiar){familiar.totalMerges++})});
				node.merge = true;
			}else if(equivalence == 1 && !node.moved){
				let eq_node = node.equivalent[0];
				let same_author = compare_author(node.a,eq_node.a);
				
				if(node.n == eq_node.n && same_author){
					node.rename = false;
				}else{
					node.rename = true;
					node.f.forEach(
					function(familiar){
						familiar.totalRenames++;
					}
					)
				}
				//node.rename = true;
			}else{
				node.added = true;
				node.f.forEach(
					function(familiar){
						familiar.totalInsertions++;
					}
				)
			}

		}
	);
}



function calculate_all_merges(left_tree, rigth_tree){
	//verificar_name_changes(left_tree["kingdom"],rigth_tree["kingdom"]);
	//verificar_name_changes(left_tree["phylum"],rigth_tree["phylum"]);
	//proccesByLevel(root,function(node){node.totalSplits = 0; node.totalMerges = 0;});
	families.forEach(
		function(rank){
			verificar_name_changes(left_tree[rank],rigth_tree[rank]);
			name_changes_left(left_tree[rank]);
			name_changes_right(rigth_tree[rank]);
		}
	);



	/*verificar_name_changes(left_tree["class"],rigth_tree["class"]);
	verificar_name_changes(left_tree["order"],rigth_tree["order"]);
	verificar_name_changes(left_tree["superfamily"],rigth_tree["superfamily"]);
	verificar_name_changes(left_tree["family"],rigth_tree["family"]);
	verificar_name_changes(left_tree["subfamily"],rigth_tree["subfamily"]);
	verificar_name_changes(left_tree["tribe"],rigth_tree["tribe"]);
	verificar_name_changes(left_tree["subtribe"],rigth_tree["subtribe"]);
	console.log("genus");
	verificar_name_changes(left_tree["genus"],rigth_tree["genus"]);
	verificar_name_changes(left_tree["subgenus"],rigth_tree["subgenus"]);
	console.log("species");
	verificar_name_changes(left_tree["species"],rigth_tree["species"]);
	console.log("infraspecies");
	verificar_name_changes(left_tree["infraspecies"],rigth_tree["infraspecies"]);
	console.log("subspecies");
	verificar_name_changes(left_tree["subspecies"],rigth_tree["subspecies"]);
	*/

}


function compare_author(first_author, second_author){
	if(first_author.length != second_author.length){
		return false;
	}else{
		for(let author_slot = 0;author_slot <  first_author.length; author_slot++){
			if(first_author[author_slot] != second_author[author_slot]){
				//console.log({first_author,second_author});
				return false;
			}
		}
		return true;
	}

}
	

function compare_author_date(first_author, second_author){
	if(first_author.a.length != second_author.a.length || first_author.ad.length != second_author.ad.length){
		return false;
	}else{
		for(let author_slot = 0;author_slot <  first_author.a.length; author_slot++){
			if(first_author.a[author_slot] != second_author.a[author_slot]){
				//console.log({first_author,second_author});
				return false;
			}
		}
		for(let author_slot = 0;author_slot <  first_author.ad.length; author_slot++){
			if(first_author.ad[author_slot] != second_author.ad[author_slot]){
				//console.log({first_author,second_author});
				return false;
			}
		}
		return true;
	}

}