//Not used

function LevenshteinSubminimal(A, B) {
    var a = A.length;
    var b = B.length;

    // siempre comparamos A con las subcadenas de B
    var f = function(s) {
        return LevenshteinSubminimal(A, s);
    };

    // si A es mayor que B no comparamos subcadenas
    if (a >= b) return { k: f(B), t: B };

    // peor caso y cotas
    var m = { k: b + 2, t: null },
        c1 = a - 1,
        c2 = a + 1;
    for (var p = 0; p < b - c1; p++)
        for (var l = c1, c3 = Math.min(c2, b - p); l <= c3; l++) {
            var t = B.substr(p, l),
                k = f(t);
            // mejor caso
            if (m.k >= k) m = { k: k, t: t };
        }
    return m;
}

function LevenshteinIterative(A, B) {
    //crea una matriz del el tamano de cada string +1 fila y columna
    let distanceMatrix = createMatrix(A.length + 1, B.length + 1);

    //variables necesarias
    let firstStringIndex = 0;
    let secontStringIndex = 0;
    let cost = 0;

    //inicializa fila con numeros segun indice
    for (
        firstStringIndex = 0;
        firstStringIndex <= A.length;
        firstStringIndex++
    ) {
        distanceMatrix[firstStringIndex][0] = firstStringIndex;
    }
    //inicializa columna con numerossegun indice
    for (
        secontStringIndex = 0;
        secontStringIndex <= B.length;
        secontStringIndex++
    ) {
        distanceMatrix[0][secontStringIndex] = secontStringIndex;
    }
    //calcula el costo de transmutar un string en otro, de manera dinamica
    for (
        firstStringIndex = 1;
        firstStringIndex <= A.length;
        firstStringIndex++
    ) {
        for (
            secontStringIndex = 1;
            secontStringIndex <= B.length;
            secontStringIndex++
        ) {
            if (
                A.charAt(firstStringIndex - 1) ===
                B.charAt(secontStringIndex - 1)
            ) {
                cost = 0;
            } else {
                cost = 1;
            }

            //calculates the lowest transformation required to have that character in that position,while storing the acumulated changes
            var newDistance = Math.min(
                Math.min(
                    distanceMatrix[firstStringIndex - 1][secontStringIndex] + 1, //se remueve un caracter
                    distanceMatrix[firstStringIndex][secontStringIndex - 1] + 1
                ), //se inserta un caracter
                distanceMatrix[firstStringIndex - 1][secontStringIndex - 1] +
                    cost //se substituye un caracter
            );

            distanceMatrix[firstStringIndex][secontStringIndex] = newDistance;
        }
    }
    //console.log(distanceMatrix);
    return distanceMatrix[A.length][B.length];
}

function createMatrix(width, height) {
    let matrix = [];
    for (var i = 0; i < width; i++) {
        matrix[i] = new Array(height);
    }
    return matrix;
}

console.log(
    'levenstein : ' + LevenshteinIterative('meilenstein', 'levenshtein')
);
//console.log("levenstein recursive: " + LevenshteinSubminimal("casa","braza"));

//other levenstein

//similarity function from
//https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (
        (longerLength - editDistance(longer, shorter)) /
        parseFloat(longerLength)
    );
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue =
                            Math.min(Math.min(newValue, lastValue), costs[j]) +
                            1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
