var tree = new TaxonomyTree();
tree.setNotify(Notify);
var logString = '';

tree.setLog(function(logContent) {
    logString = logString + logContent;
});

//console.log(tree.log);
/*tree.setOnReadyStatusCallback(
	function(){
		let treeResult = tree.createTreeQuery("Apus");
		console.log(treeResult);
		
				
	}
);*/

const loadingUrl = 'http://localhost:3000/';

function onSalir() {
    //alert("salir")
    window.location.replace(loadingUrl);
}

$(function() {
    $('#searchButton').click(function() {
        let name = $('#name').val();
        let year = $('#year').val();
        name = name.trim();
        //alert('button clicked' + name + "---" + year);
        if (year.length > 3) {
            //cambiar por ano actual
            //year = (new Date()).getFullYear();
            tree.setYear(year);
        } else {
            year = new Date().getFullYear();
        }
        if (name.length > 2) {
            tree.apiCallByName(name, 0);
            tree.setOnReadyStatusCallback(function() {
                //tree build from downoloading data on catalogue of life
                let treeResult = tree.createTreeQuery(name, 0);

                let newTaxonomy = {};
                newTaxonomy.name = name;
                newTaxonomy.source = 'http://www.catalogueoflife.org/';
                //gets current date
                newTaxonomy.date = year;
                newTaxonomy.accessDate = new Date()
                    .toJSON()
                    .slice(0, 10)
                    .replace(/-/g, '/');
                newTaxonomy.taxonomy = treeResult;

                //console.log(treeResult);
                //console.log(treeResult);
                //$("#resultadoName").html(JSON.stringify(treeResult));
                //alert("cargado");
                let resultText = JSON.stringify(newTaxonomy);
                let blob = new Blob([resultText], { type: 'application/json' });
                let url = URL.createObjectURL(blob);

                $('#notify').html('Finished downloading ' + name + '!!!');

                let a = document.createElement('a');
                a.download = name + '_' + year + '.json';
                a.href = url;
                a.textContent = 'Download backup.json';
                //$("#resultadoName").append(a)
                // no compatible con todos los navegadores
                a.click();

                //console.log(logString);
                if (logString.length > 1) {
                    let logBlob = new Blob([logString], {
                        type: 'application/json',
                    });
                    let logUrl = URL.createObjectURL(logBlob);
                    a.download = name + '_' + year + '_log' + '.log';
                    a.href = logUrl;
                    a.textContent = 'Download log.json';
                    a.click();
                    logString = '';
                }

                //after finish download reset the download tree
                tree = new TaxonomyTree();
                tree.setNotify(Notify);
                $('#name').val();
                $('#year').val();
            });
        }
    });
});

function Notify(text) {
    $('#notify').html('Downloading: ' + text);
}
