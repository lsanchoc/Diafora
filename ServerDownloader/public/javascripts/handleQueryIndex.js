


//console.log(tree.log);
/*tree.setOnReadyStatusCallback(
	function(){
		let treeResult = tree.createTreeQuery("Apus");
		console.log(treeResult);
		
				
	}
);*/



$(function () {
    $("#searchButton").click(function ()
    {   
        let name = $('#name').val();
        let year = $('#year').val();
		name = name.trim();

		$.ajax({
			url: "http://localhost:3000/search?tax=" + "apus_2018" + "&name=" + name,
			type: "POST"
		}).done(function(result) {
			let resultText = JSON.stringify(result);
			let blob = new Blob([resultText], {type: "application/json"});
			let url  = URL.createObjectURL(blob);

			$('#notify').html("Finished downloading " + name +"!!!");

			let a = document.createElement('a');
			a.download    = name+".json";
			a.href        = url;
			a.textContent = "Download backup.json";
			a.click();

		})
    });
});


