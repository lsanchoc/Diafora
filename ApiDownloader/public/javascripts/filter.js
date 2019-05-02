


class FilterSystem(){



	constructor(tree1,tree2){
		this.dataStruct = {};
		this.keys = new Set();
		

		buildQuerySystem(tree1,tree2);
	}

	buildQuerySystem(tree1,tree2){
		//uses proces by level from system
		//build necesary data estructures for filter
		let myself = this;
		proccesByLevel(tree1,addKey);
		proccesByLevel(tree2,addKey);



	}

	addKey(node){

		let keyArray = node.n.split(" ");

		//object of the node three that enables search
		let actualLevel = this.dataStruct;
		keyArray.forEach(
		(keyName) =>{
			
			//add key to key list
			if(!this.keys.has(keyName)){
				keys.add(keyName)
				dataStruct[keyName] = new Set();
			}
			dataStruct[keyName].add(node);

		}
		)
	}

	queryTaxon(rank,name){
		if(!rank){
			let keys = name.split(" ");
			let results = [];
			keys.forEach(
				(rawKey) => {
					var goalKey = getClosestKey(rawKey);
					results.push(dataStruct[goalKey]);
				}


			)

			let finalResult = results[0];
			//intersection
			for (var i =  1; i < results.length; i++) {
				finalResult = finalResult.filter(x => results[i].has(x));
			}

			
		}

	}

	querySpecies(name){


	}

	//the search magic ocurs here
	getClosestKey(rawString){

	}
}