// Importing variables
var MongoClient = require('mongodb').MongoClient,format=require('util').format;
var path = require('path');
const NodeCache = require( "node-cache" );
const taxCache = new NodeCache();

// URL concerning connection to MongoDB
var url = 'mongodb://localhost:27017';

// Allows to manage files and directories
var fs = require('fs');

// Go to the path of the taxonomies, given a directory name
function readFiles(dirname) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      console.log(err);
      //onError(err);
      return;
    }
    //console.log(filenames);
    onFileNames(filenames,dirname);

  });
  
}

// Read the taxonomies in JSON format, given a file names array, and the desired directory
function onFileNames(filenames,dirname){
	filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          console.log(err);
          //onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
}

// On each JSON, retrieve the information and store it on the Mongo database
function onFileContent(filename,content){
	// JSON library parses the given content for the requested taxonomy
	let newTaxonomy = JSON.parse(content); 
	// Open Mongo connection
	MongoClient.connect(url,{connectTimeoutMS:72000000,socketTimeoutMS:72000000}, function(err, db) {
	  if (err) {
        //console.log("primer if");
        throw err;
        console.log(err);
      }
      let filenameAux = filename.split(".")[0]
	  divideJson(newTaxonomy,filenameAux,db);
      db.close();
	});

}

// JSON divider, to separate each node's children from its parents, until there are no pending children
function divideJson(jsonTax,filename,db){
  let pendings = [];
  pendings.push(jsonTax);
  while (pendings.length > 0){
    let actual = pendings.pop();
    let children = actual.c;
    let newChildren = [];
    for(let i = 0; i < children.length; i++){
      if(children[i] != null && children[i] !== undefined){
        let nameChild = {};
        //console.log(children[i]);
        nameChild.n = children[i].n;
        newChildren.push(nameChild);
        pendings.unshift(children[i]);
        //console.log(children.n)
      }
    }
    actual.c = newChildren;
    insert(actual,filename,db);
  }
}

// Inserts the JSON documents into the Mongo database
function insert(jsonTaxon,filename,db){
  //console.log(filename);
  var dbo = db.db("downloaderTax");

    //var myobj = { name: "Company Inc", address: "Highway 37" };

    dbo.collection(filename).insertOne(jsonTaxon, function(err, res) {
      if (err){
        console.log("segundo if");
        throw err;
        console.log(err);
      } 
      console.log("1 document inserted");
    });
}

// Searches for the requested taxonomy, given the parent taxonomy and its actual name
function consult(taxonomy,name,stats){
  //console.log(stats);
  console.log(`Consulta en ${taxonomy} buscando ${name}`);
  MongoClient.connect(url,{connectTimeoutMS:20000,socketTimeoutMS:20000}, function(err, db) {
	if (err) {
      console.log(stats);
      throw err;
      console.log(err);
    }
	
	// Consults for a taxonomy containing the given name
    var dbo = db.db("downloaderTax");
    dbo.collection(taxonomy).findOne({"n" : name}, function(err, result) {
      if (err){
        throw err;
        console.log("Error en consulta a BD");
      } 
      //console.log(stats.completeJobs);
      //console.log(result);
      
	  delete result["_id"];  //delete the id to avoid useless information
      taxCache.set(name,result);
      stats.completeJobs++;
      stats.pendingJobs--;
      
	  // Adds the taxonomy's children one by one
	  let children = result.c;
	  console.log(result);
      for(let childIndex = 0; childIndex < children.length; childIndex++){
        stats.pendingJobs++;
        consult(taxonomy, children[childIndex].n,stats);
      }

      db.close();
    });
  });
}

// Consults in a taxonomy tree, parting from a root node
function consultTree(taxonomy,name,stats,intervalObj,res){
  if(stats.pendingJobs <= 0){
    clearInterval(intervalObj);
    let pendings = [];
    pendings.push(name);
    let treeRoot = buildTaxon(pendings);
    while (pendings.length > 0){
      buildTaxon(pendings);
    }
    res.send(treeRoot);
  }
}

// Builds a taxon from the pending nodes of a taxonomy
function buildTaxon(pending){
  //console.log(taxCache);
  let actual = taxCache.get(pending.pop());
  console.log(actual);
  let children = actual.c;
  let newChildren = [];
  for(let i = 0;i < children.length ;i++){
    children[i] = taxCache.get(children[i].n);
    pending.unshift(children[i].n);
  }
  return actual;
}

// Builds a tree from the given taxonomy, to reflect its structure with nodes and branches
function buildTreeTax(taxonomy,name,res){
  //console.log(name);
  let stats = {pendingJobs:1,completeJobs:0};
  consult(taxonomy,name,stats);
  let intervalObj = setInterval(() => {
  consultTree(taxonomy,name,stats,intervalObj,res);
  }, 500);

}

// Shows the whole taxonomy collection from the Mongo database as an array
function showCollections(){
  console.log('Taxonomy names listing');
  let arrayNames = [];
  MongoClient.connect(url,{connectTimeoutMS:20000,socketTimeoutMS:20000}, function(err, db) {
	if (err) {
      console.log(stats);
      throw err;
      console.log(err);
    }
	
    var dbo = db.db("downloaderTax");
    dbo.listCollections().toArray(function(err, result) {
	  if (err){
        throw err;
        console.log("Error consulting the DB");
      }
	  for (var i = 0; i < result.length; i++){
		arrayNames[i] = result[i].name;
	  }
	  //console.log(arrayNames);
      db.close();
    });
  });
  //console.log(arrayNames);
  return arrayNames;
}

//buildTreeTax("Apus_2018","Apus");

//consult("Apus_2018","Apus acuticauda");
console.log(showCollections());
readFiles(path.join(__dirname, 'Taxonomies/'),function(){},function(){});

module.exports.buildTreeTax = buildTreeTax;