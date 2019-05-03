


class FilterSystem{



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
				finalResult =new Set([...finalResult].filter(x => results[i].has(x)));
			}


			if(rank){
				finalResult =new Set([...finalResult].filter(x => x.rank == rank));
			}	

			finalResult = Array.from(finalResult); 

			return finalResult;
		}




	querySpecies(name){
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
				finalResult =new Set([...finalResult].filter(x => results[i].has(x)));
			}


			if(rank){
				finalResult =new Set([...finalResult].filter(x => x.rank == "species"));
			}	
			
			finalResult = Array.from(finalResult); 

			return finalResult;
		}

	//the search magic ocurs here
	getClosestKey(rawString){
		let keyArray = Array.from(this.keys);

		let bestKey = undefined;
		let maxVal = -10000000;
		for (const actualKey of this.keys) {
  				var similarity = LevenshteinIterative(actualKey,rawString);
				if(similarity > maxVal){
					maxVal = similarity;
					bestKey = actualKey;
				}
		}

		return bestKey;

	}
}