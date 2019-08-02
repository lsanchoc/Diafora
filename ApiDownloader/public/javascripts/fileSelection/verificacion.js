const visualizationUrl = 'http://localhost:3000/indented';
const downloadUrl = 'http://localhost:3000/download';

function onDownload() {
    window.location.replace(downloadUrl);
}

function VerificarDatos() {
    //try{
    var errorText = document.getElementById('error_text');
    var fileInput1 = document.getElementById('file1');
    var fileInput2 = document.getElementById('file2');
    var file1 = fileInput1.files[0];
    var file2 = fileInput2.files[0];
    //console.log(file1);
    //console.log(file1);
    //var file1 = e1.options[e1.selectedIndex].value;
    //var file2 = e2.options[e2.selectedIndex].value;
    //var n = file1.lastIndexOf(".");
    //console.log("File 1>>"+file1);
    //console.log("File 2>>"+file2);
    //console.log(window.opener);
    //window.opener.file1 = file1;
    //window.opener.file2 = file2;
    //window.opener.getElementById('ExclusionStatsValue').innerHTML = "25";
    //window.close();

    if (typeof Storage !== 'undefined') {
        // Code for localStorage/sessionStorage.
        if (file1 && file2) {
            readFile(file1, function(resultFile1) {
                //console.log(resultFile1.length);
                sessionStorage.setItem('sessionTree1', resultFile1);
                readFile(file2, function(resultFile2) {
                    sessionStorage.setItem('sessionTree2', resultFile2);

                    window.location.replace(visualizationUrl);
                });
            });
            //window.sessionStorage.file1 = file1;
            //window.sessionStorage.file2 = file2;
            errorText.innerHTML = '';
            //window.location.replace(visualizationUrl);
        } else {
            errorText.innerHTML = 'Por favor selecione 2 jerarquias';
        }
        //console.log("sessionStorage!!!");
    } else {
        errorText.innerHTML =
            'Su navegador no es compatible con nuestro programa :(';
    }
    /*}
	catch{
		alert("Invalid Files");
	}*/
}

function readFile(file, callback) {
    let reader = new FileReader();
    //let content;
    reader.onload = function(evt) {
        //window.sessionStorage.sessionTree1 = evt.target.result;
        //console.log("loaded");
        //console.log(evt.target.result);
        callback(evt.target.result);
    };
    reader.onerror = function(evt) {
        console.log('error reading file');
        document.getElementById('error_text').innerHTML = 'error reading file';
    };
    reader.readAsText(file, 'UTF-8');
}
