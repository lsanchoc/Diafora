var format = "json" // options are xml or json, probably should not be a global variable
//se inicia a utilizar el proxy https://cors.io/?
var proxyUrl = "http://127.0.0.1:5757/";
var especies2000url = "http://webservice.catalogueoflife.org/col"; //direction for current year
var especies2000urlRaw = "http://www.catalogueoflife.org/annual-checklist/"; //direction that needs year specified
var queryFlags = "/webservice?format="+format+"&response=full&" //flags to shape the query


var MAX_JOBS = 100; // max ammount of api requests that can exist  at the same time
var MAX_RETRYS = 15;

//regular expressions for author recognition
var botanyPattern = /\s&\s|\set\s|\sex\s/
var zoologyPattern = /\(|\)/g
var regularPattern = /,/g



//options for the xml to json conversion
//any change would require to adapt de parser
var xmlParserOptions = {
	mergeCDATA: true,	// extract cdata and merge with text nodes
	grokAttr: false,		// convert truthy attributes to boolean, etc
	grokText: false,		// convert truthy text/attr to boolean, etc
	normalize: true,	// collapse multiple spaces to single space
	xmlns: true, 		// include namespaces as attributes in output
	namespaceKey: '_ns', 	// tag name for namespace objects
	textKey: '_value', 	// tag name for text nodes
	valueKey: '_value', 	// tag name for attribute values
	attrKey: 'attributes', 	// tag for attr groups
	cdataKey: '_value',	// tag for cdata nodes (ignored if mergeCDATA is true)
	attrsAsObject: true, 	// if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
	stripAttrPrefix: true, 	// remove namespace prefixes from attributes
	stripElemPrefix: false, 	// for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
	childrenAsArray: true 	// force children into arrays
};	

//a class containg the sistem to convert and download hierarchys from catalogueOfLife
class TaxonomyTree {
	
	constructor() {
		this.cache = {};//stores result from api call
		this.pendingJobs = 0;//api calls awaiting for resolution
		this.completeJobs = 0;//api calls completed
		this.readyCallback = undefined;//function that is executes after the download finishes
		this.notify = undefined;//function that is called to notify the state of the download process, receives a parameter with notification
		this.log = undefined;//a function defined to be executed every time a error occurs, receives a parameter with log
		this.pendingNames = [];//taxons that have not been assembled as a tree structure
		this.pendingApiCalls =[];//names of taxons that are awaiting for api request submision
		this.year = "";//year in wich api request is going to search
		this.actualYear = (new Date()).getFullYear();//systeam year
		this.working = false;//flag to se if tree is workign
		
		//console.log("creating three");
		let actualTree = this;
		
		//sets a timer to resolver api calls every 50 ms 
		//if the total ammount of api requests does not exceds the limit
		window.setInterval(function(){
				actualTree.resolveRequests(actualTree);
		},
		 50);
	}
	 //returns content from three cache
	 //run after the query is done
	createTreeQuery(TaxonName){
		return this.cache[TaxonName.toLowerCase()];
	  
	}
	//this is executed to start api calls, if the ammount of api calls awaiting does
	//not exced the limit
	//builds the tree when download finishes
	resolveRequests(actualTree){
		//iterates throught pending api calls while there are less api calls than MAX_JOBS
		while( actualTree.pendingJobs < MAX_JOBS && actualTree.pendingApiCalls.length > 0 ){
			let nextCall = actualTree.pendingApiCalls.pop();
			actualTree.apiCallById(nextCall.id, nextCall.start);
		}
		
		//we finished downloading the three, is time to build
		if(this.pendingJobs <= 0 && this.pendingApiCalls.length <= 0 ){
			this.buildTree();
		}
	}

	//assembles the tree estructure from cache
	buildTree(){
		//iterates throught pending names
		//console.log(this.cache);
		for(let taxonIndex = 0; taxonIndex < this.pendingNames.length;taxonIndex++){
			//gets childrend of actual taxon
			//console.log(this.pendingNames[taxonIndex]);
			let children = this.cache[this.pendingNames[taxonIndex]].c;
			//console.log(children);
			for(let childIndex = 0; childIndex < children.length; childIndex++){
				let childTaxon = children[childIndex];
				//changes the placeholder for the full taxon stored in cache;
				//console.log(childTaxon);
				if(childTaxon.id !== undefined){
					this.cache[this.pendingNames[taxonIndex]].c[childIndex] = this.cache[childTaxon.id];
					//console.log(this.cache[childTaxon.id]);
				}else{
					this.cache[this.pendingNames[taxonIndex]].c[childIndex] = this.cache[childTaxon.name.toLowerCase()];
					//console.log(this.cache[childTaxon.name]);
				}
				
			}
		}
		//empty the list of pending names, they do not need to be assembled again
		this.pendingNames = [];
		
		//calls callback function
		if(this.readyCallback !== undefined && typeof this.readyCallback === "function" && this.working){
			this.working = false;
			this.readyCallback();
		}
		
	}
	//unused
	onApiCallError(){
		
	}
	
	setOnReadyStatusCallback(callback){
		this.readyCallback = callback;
	}
	setNotify(notifyFunction){
		this.notify = notifyFunction;
	}
	setLog(logFunction){
		this.log = logFunction;
	}
	setYear(newYear){
		this.year = newYear;
	}
	//parameters: name of target specie, start index, return maximun of 50 results per api call
	apiCallByName(TaxonName,start){
		this.working = true;
		//register and api call awaiting response
		this.pendingJobs++;
		
		let xhttpName;
		//chose which of the links to use
		let url = "";
		
		if(this.year.length > 3 && this.year != this.actualYear){
			if( parseInt(this.year) < 2015 ){
					format = "xml";
				}else{
					format = "json";
				}
			xhttpName = createCORSRequest("GET",proxyUrl+especies2000urlRaw + this.year+queryFlags+"name="+TaxonName+"&start="+start);
			url = especies2000urlRaw + this.year+queryFlags+"name="+TaxonName+"&start="+start;
		}else{
		//create httprequest
			xhttpName = createCORSRequest("GET",proxyUrl+especies2000url+queryFlags+"name="+TaxonName+"&start="+start);
			url = especies2000url+queryFlags+"name="+TaxonName+"&start="+start;
		}
		let myself = this;
		xhttpName.onreadystatechange = function (xhr) {
             myself.handleResult(xhttpName, url,0);
         };
        
		xhttpName.send();
	}
	//parameters: id of target specie, start index, return maximun of 50 results per api call
	apiCallById(TaxonId,start){
		this.working = true;
		//register and api call awaiting response
		this.pendingJobs++;
		
		let xhttpId;
		//chose which of the links to use
		let url = "";
		
		if(this.year.length > 3 && this.year != this.actualYear){
			if( parseInt(this.year) < 2015 ){
					format = "xml";
				}else{
					format = "json";
				}
			xhttpId = createCORSRequest("GET",proxyUrl+especies2000urlRaw + this.year+queryFlags+"id="+TaxonId+"&start="+start);
			url = especies2000urlRaw + this.year+queryFlags+"id="+TaxonId+"&start="+start;
		}else{
		//create httprequest
			xhttpId = createCORSRequest("GET",proxyUrl+especies2000url+queryFlags+"id="+TaxonId+"&start="+start);
			url = especies2000url+queryFlags+"id="+TaxonId+"&start="+start;
		}
		let myself = this;
		xhttpId.onreadystatechange = function (xhr) {
             myself.handleResult(xhttpId, url,0);
         };

		xhttpId.send();
	}
  //executed when an api call is completed
  //gets xmlhttprequest as parameter
	handleResult(xhr, url,retry){
		//correct execution of api call
		if (xhr.readyState == 4 && xhr.status == 200) {
			//register api call back complete
			this.pendingJobs--;
			this.completeJobs++;
			
			let parsedResult;
			//parses from json or xml, acording to the variable format
			if(format == "json"){
				let responseText= xhr.responseText;
				parsedResult = JSON.parse(responseText);
			}else if(format == "xml"){
				let responseXml= xhr.responseText;
				let preprocesedResult = xmlToJSON.parseString(responseXml,xmlParserOptions);
				parsedResult = parseConvertedXml(preprocesedResult.results[0]);
			}

	
			//if there are pending results to be procesed, starts a new api call from the current las received result
			if(parsedResult.start + parsedResult.number_of_results_returned < parsedResult.total_number_of_results){
				let pendingApiCall = {};
						pendingApiCall["name"] = parsedResult.name;
						pendingApiCall["id"] = parsedResult.id;
						pendingApiCall["start"] = parsedResult.start+parsedResult.number_of_results_returned;
						this.pendingApiCalls.unshift(pendingApiCall);
			}
			
			
			
			//converts results to desired format
			let results = this.processResult(parsedResult);
			//sets a query for childTaxa whose info is not complete
			for(let resultIndex = 0; resultIndex < results.length; resultIndex++){
				let childrenTaxa = results[resultIndex].c;
				//if child has not been loaded
				for(let childIndex = 0; childIndex < childrenTaxa.length;childIndex++){
					let actualChildTaxon =  childrenTaxa[childIndex];
					if(!this.cache.hasOwnProperty(actualChildTaxon.n)){
						let pendingApiCall = {};
						pendingApiCall["name"] = actualChildTaxon.name;
						pendingApiCall["id"] = actualChildTaxon.id;
						pendingApiCall["start"] = 0;
						//console.log(pendingApiCall);
						this.pendingApiCalls.unshift(pendingApiCall);//set pending api call
					}
				}
			}
			
			
		//error not found, going to retry
		}else if(xhr.readyState == 4 && xhr.status == 404){
			//retry not found error
			if(retry < MAX_RETRYS){
			let retryRequest = createCORSRequest("GET",url);
			let myself = this;
			etryRequest.onreadystatechange = function (xhr) {
				myself.handleResult(xhttpName, url,retry+1);
			};
        
			retryRequest.send();
			//error repeated MAX_RETRYS times, dont bother anymore
			}else{
				//se termino de manera incorrecta el request
				this.pendingJobs--;
				//cals log function
				if(this.log != undefined){
					this.log("Error " + xhr.status + " : "+ url + "\n");
				}
			}
			
		}
		//maybe i should retry all errors
		else if(xhr.readyState == 4){
			//se termino de manera incorrecta el request
			this.pendingJobs--;
			//cals log function
			if(this.log != undefined){
				this.log("Error " + xhr.status + " : "+ url + "\n");
			}
		}
	}
	
	//loads every result
	processResult(responseJson){
		let taxons = responseJson.results;

		let results = [];
		if(taxons === undefined){
			return results;
		}
		for (let taxonIndex = 0; taxonIndex < taxons.length; taxonIndex++) {
			let procesedTaxon = taxons[taxonIndex];
			
			//verifies if taxon has been loaded
			//ignores loaded taxons
			if(!this.cache.hasOwnProperty(procesedTaxon.name) && !this.cache.hasOwnProperty(procesedTaxon.id)){
				let result = this.extractData(procesedTaxon);
				//console.log(procesedTaxon);
				if(procesedTaxon.id !== undefined){
					//console.log(procesedTaxon.id);
					this.cache[procesedTaxon.id] = result;
					//add to the list of id pending to be added on the three
					this.pendingNames.push(procesedTaxon.id);
				}else{
					this.pendingNames.push(procesedTaxon.name.toLowerCase());
				}
				this.cache[result.n.toLowerCase()] = result;
				results.push(result);
				//add to the list of name pending to be added on the three
				//this.pendingNames.push(result.n);
					
				
				//feedback of download procces
				if(this.notify !== undefined){
					this.notify(result.n + " & " + this.pendingJobs+ " more...  Completed:" + this.completeJobs);
					//console.log(TaxonName + " " + this.pendingJobs+ " more...  Completed:" + this.completeJobs);
				}

			}
			
			
		}
		return results;
	}
	//modificacion para ahorrar formato
	/*
	name = n 
	Synonym = s
	author = a [a,b]
	author_date = ad
	record_scrutiny_date = rsd
	children = c
	rank = r	 
	 */
	 //extracts data from result json and outpus a json in our format
	extractData(originalJson){
		let newTaxon = {};
		
		//load from original
		let originalChildren = originalJson.child_taxa;
		let newChildTaxons = [];
		//load every children in the json
		if(originalChildren !== undefined){
		for(let childIndex = 0; childIndex < originalChildren.length ;childIndex++ ){
			let newChild = {};
			newChild.name = originalChildren[childIndex].name;
			newChild.id = originalChildren[childIndex].id;
			//console.log(newChild);
			newChildTaxons.push(newChild);
		}
		}		
		newTaxon.n = originalJson.name;
		newTaxon.a = [];
		newTaxon.ad = [];
		//newTaxon.author_date = undefined;
		if(originalJson.author !== undefined){
			let authorInfo = getAuthor(originalJson.author);
			newTaxon.a = authorInfo.author;
			newTaxon.ad = authorInfo.authorDate;
			
		}
		
		let scrutinyDate = originalJson.record_scrutiny_date;
		if(scrutinyDate !== undefined){
			newTaxon.rsd = scrutinyDate.scrutiny;
		}else{
			newTaxon.rsd = undefined;
		}

		newTaxon.s = [];
		if(originalJson.synonyms !== undefined){
				let synonyms = originalJson.synonyms;
				for(let i = 0; i < synonyms.length; i++){
						newTaxon.s.push(synonyms[i].name);
				}
		}
		newTaxon.c = newChildTaxons;
		newTaxon.r = originalJson.rank;

		//console.log(newTaxon.c);
		return newTaxon;
	}
}

//receives a xml results and parse it
function parseConvertedXml(convertedJson){
	//console.log(convertedJson);
	processedJson = {};
	processedJson.name = convertedJson.attributes.name["_value"];
	processedJson.id = convertedJson.attributes.id["_value"];
	//console.log(processedJson.id);
	processedJson.number_of_results_returned = convertedJson.attributes.number_of_results_returned["_value"];
	processedJson.start = convertedJson.attributes.start["_value"];
	processedJson.total_number_of_results = convertedJson.attributes.total_number_of_results["_value"];
	processedJson.results = [];
	//iterate throught results array
	if(convertedJson.result !== undefined){
		for(let i = 0; i < convertedJson.result.length; i++){
			let newResult = loadParsedXmlResult(convertedJson.result[i]);
			processedJson.results.push(newResult);
		}
	}
	//console.log(processedJson);
	return processedJson;
	}
//receives a child in xmlJson converted format and parses it
function loadParsedXmlResult(jsonXmlChild){
		let newResult = {};
		//console.log(jsonXmlChild);
		newResult.name = jsonXmlChild.name[0]["_value"];
		newResult.id = jsonXmlChild.id[0]["_value"];
		newResult.child_taxa = [];
		
		if(jsonXmlChild.author !== undefined){
			newResult.author = jsonXmlChild.author[0]["_value"];
		}
		if(jsonXmlChild.scrutinyDate !== undefined){
			newResult.scrutinyDate = jsonXmlChild.scrutinyDate[0]["_value"];
		}
		if(jsonXmlChild.rank !== undefined){
			newResult.rank = jsonXmlChild.rank[0]["_value"];
		}
		newResult.child_taxa = [];
		//console.log(jsonXmlChild.child_taxa);
		if(jsonXmlChild.child_taxa !== undefined && jsonXmlChild.child_taxa[0].taxon !== undefined){
			let childrenArray = jsonXmlChild.child_taxa[0].taxon;
			//console.log(childrenArray);
			for(let childrenIndex = 0; childrenIndex < childrenArray.length;childrenIndex++){
				let processedChild =  {}; //childrenArray[childrenIndex];
				processedChild.name= childrenArray[childrenIndex].name[0]["_value"];
				processedChild.id = childrenArray[childrenIndex].id[0]["_value"];
				//console.log(processedChild);
				newResult.child_taxa.push(processedChild);
				//console.log(processedChild);
			}
		}
		
		newResult.synonyms = [];
		if(jsonXmlChild.synonyms !== undefined && jsonXmlChild.synonyms[0].synonym !== undefined){
			let synonymsArray = jsonXmlChild.synonyms[0].synonym;
			//console.log(childrenArray);
			for(let synonymIndex = 0; synonymIndex < synonymsArray.length;synonymIndex++){
				let processedSynonym =  {}; //childrenArray[childrenIndex];
				processedSynonym.name= synonymsArray[synonymIndex].name[0]["_value"];
				newResult.synonyms.push(processedSynonym);
				//console.log(processedChild);
			}
		}
		
		
		return newResult;
	}








function getAuthor(authorString){
    let authorData = {};
    authorData.authorDate = [];
    authorData.author = [];
    let processedData;
	if(botanyPattern.exec(authorString)){
        processedData = authorString.split(botanyPattern);
    }else if(zoologyPattern.exec(authorString)){
        authorString = authorString.replace(zoologyPattern,'');
        processedData = authorString.split(regularPattern);
    }else{
        processedData = authorString.split(regularPattern);
    }   
    for(let i = 0; i < processedData.length; i++){
        let actualString = processedData[i].trim();
        if(isNaN(Number(actualString))){
            authorData.author.push(actualString);
        }else{
            authorData.authorDate.push(actualString);
        }
        //print(Number(processedData[i]));
    }
	return authorData;
}



// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}


	
//usage example
/*var tree = new TaxonomyTree();
tree.setOnReadyStatusCallback(
	function(){
		let treeResult = tree.createTreeQuery("Apus");
		console.log(treeResult);
		
	}
);
tree.apiCallByName("apus");
*/


