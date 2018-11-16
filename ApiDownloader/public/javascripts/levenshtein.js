function LevenshteinSubminimal(A, B) {
    var a = A.length;
    var b = B.length;

    // siempre comparamos A con las subcadenas de B
    var f = function(s){return Levenshtein(A, s)};

    // si A es mayor que B no comparamos subcadenas
    if(a >= b)
        return {k: f(B), t: B}

    // peor caso y cotas
    var m = {k: b+2, t: null}, c1 = a-1, c2 = a+1;
    for(var p = 0; p < b - c1; p++)
        for(var l = c1, c3 = Math.min(c2, b - p); l <= c3; l++) {
            var t = B.substr(p, l), k = f(t);
            // mejor caso
            if(m.k >= k)
                m = {k: k, t: t};
        }
    return m;
}


function LevenshteinIterative(A,B){
	//crea una matriz del el tamano de cada string +1 fila y columna
	let distanceMatrix = createMatrix(A.length + 1 , B.length + 1);
	
	//variables necesarias
	let firstStringIndex = 0;
	let secontStringIndex = 0;
	let cost = 0;
	
	//inicializa fila con numeros segun indice
	for(firstStringIndex = 0; firstStringIndex <= A.length; firstStringIndex++){
		distanceMatrix[firstStringIndex][0] = firstStringIndex;
	}
	//inicializa columna con numerossegun indice
	for(secontStringIndex = 0; secontStringIndex <= B.length; secontStringIndex++){
		distanceMatrix[0][secontStringIndex] = secontStringIndex;
	}
	//calcula el costo de transmutar un string en otro, de manera dinamica
	for(firstStringIndex = 1; firstStringIndex <= A.length; firstStringIndex++){
		for(secontStringIndex = 1; secontStringIndex <= B.length; secontStringIndex++){
			if(A.charAt(firstStringIndex-1) === B.charAt(secontStringIndex-1)){
				cost = 0;
			}else{
				cost = 1;
			}
			
			//calculates the lowest transformation required to have that character in that position,while storing the acumulated changes
			var newDistance = Math.min(
								Math.min(distanceMatrix[firstStringIndex-1][secontStringIndex] + 1, //se remueve un caracter
								distanceMatrix[firstStringIndex][secontStringIndex-1] + 1), //se inserta un caracter
								distanceMatrix[firstStringIndex-1][secontStringIndex-1]+cost	//se substituye un caracter
							);
			
			distanceMatrix[firstStringIndex][secontStringIndex] = newDistance;
		}
	}
	console.log(distanceMatrix);
return distanceMatrix[A.length][B.length];
}


function createMatrix(width, height){
	let matrix = [];
	for(var i=0; i<width; i++) {
		matrix[i] = new Array(height);
	}
	return matrix;
}

console.log("levenstein : " + LevenshteinIterative("meilenstein","levenshtein"));
//console.log("levenstein recursive: " + LevenshteinSubminimal("casa","braza"));