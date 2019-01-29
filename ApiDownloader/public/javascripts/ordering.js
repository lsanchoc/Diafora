


//requires pvalues to be computed
function sort_tree_nodes(actualTree){
	//ineficient
	proccesByLevel(actualTree,function(node){custom_sort(node)});
}


//se asigna el valor p a la hora de calcular las lineas;
function custom_sort(node){
	
	node.c.sort((a, b) => parseFloat(a.p) - parseFloat(b.p));//ordenamiento basado en el valor p
}




//pValue is 0 by dafault
//by doing multiple iterations results can be improved
function updateP(options,p_lines){
	//reset p value
	p_lines.forEach(function(line){
		line.o.p = 0;
		line.t.p = 0;
	});


	p_lines.forEach(function(line){
		let distance = line.o.y-line.t.y; //vertical distance betwen the two nodes
		let direction = distance == 0 ? 0 : Math.abs(distance)/distance; //conservamos solo el simbolo de la direccion, evitamos error de division sobre 0

		//console.log({distance,direction});
		//calcula la prioridad que tiene una linea para moverce hacia una direccion
		//se suma ya que puede tene un valor p aportado por otra linea que lo toco
		line.t.p += direction*line.a + options.atractionForce* line.a; //a es la cantidad de lineas representadas por ese nodo
		line.o.p += -line.o.p;

	});

	//should sort parents of nodes in lines
}




