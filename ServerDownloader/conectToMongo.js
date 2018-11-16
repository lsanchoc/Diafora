var MongoClient = require('mongodb').MongoClient,format=require('util').format;
var path = require('path');
const NodeCache = require( "node-cache" );
const taxCache = new NodeCache();

var url = 'mongodb://localhost:27017';

var fs = require('fs');

//Go to the path of the taxonomies
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

//Read the taxonomies JSON
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

//On each JSON consume the information and put on the date base
function onFileContent(filename,content){
	//console.log(content);
	let newTaxonomie = JSON.parse(content); 
	MongoClient.connect(url,{connectTimeoutMS:72000000,socketTimeoutMS:72000000}, function(err, db) {
	  if (err) {
      console.log("primer if");
      throw err;
      console.log(err);
    }
    let filenameAux = filename.split(".")[0]
	  divideJson(newTaxonomie,filenameAux,db);
    db.close();
	});

}

function divideJson(jsonTax,filename,db){
  let pendings = [];
  pendings.push(jsonTax);
  while (pendings.length > 0){
    let actual = pendings.pop();
    let children = actual.c;
    let newChildren = [];
    for(let i = 0;i < children.length ;i++){
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

function consult(taxonomie,name,stats){
  //console.log(stats);
  console.log(`Consulta en ${taxonomie} buscando ${name}`);
  MongoClient.connect(url,{connectTimeoutMS:20000,socketTimeoutMS:20000}, function(err, db) {
	if (err) {
      console.log(stats);
      throw err;
      console.log(err);
    }
	
    var dbo = db.db("downloaderTax");
      dbo.collection(taxonomie).findOne({"n" : name}, function(err, result) {
      if (err){
        throw err;
        console.log("error en consulta a bd");
      } 
      //console.log(stats.completeJobs);
     //console.log(result);
     delete result["_id"];  //delete the id to avoid useless information
      taxCache.set(name,result);
      stats.completeJobs++;
      stats.pendingJobs--;
      let children = result.c;
	  console.log(result);
      for(let childIndex = 0;childIndex < children.length;childIndex++){
        stats.pendingJobs++;
        consult(taxonomie,children[childIndex].n,stats);
      }

      db.close();
    });
  });
}

function consultTree(taxonomie,name,stats,intervalObj,res){
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


function buildTreeTax(taxonomie,name,res){
  //console.log(name);
  let stats = {pendingJobs:1,completeJobs:0};
  consult(taxonomie,name,stats);
  let intervalObj = setInterval(() => {
  consultTree(taxonomie,name,stats,intervalObj,res);
  }, 500);

}

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