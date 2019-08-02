class FilterSystem {
    constructor(tree1, tree2) {
        this.dataStruct = {};
        this.keys = new Set();

        //function binding
        this.addKey = this.addKey.bind(this);

        this.buildQuerySystem(tree1, tree2);
    }

    buildQuerySystem(tree1, tree2) {
        //uses proces by level from system
        //build necesary data estructures for filter

        proccesByLevel(tree1, this.addKey);
        proccesByLevel(tree2, this.addKey);

        console.log(this);
    }

    addKey(node) {
        let keyArray = node.n.split(' ');

        //object of the node three that enables search
        //let actualLevel = this.dataStruct;
        let myself = this;
        keyArray.forEach(keyName => {
            //add key to key list
            if (!myself.keys.has(keyName)) {
                myself.keys.add(keyName);
                myself.dataStruct[keyName] = new Set();
            }
            myself.dataStruct[keyName].add(node);
        });
    }

    queryTaxons(rank, name) {
        let keys = name.split(' ');
        let results = [];
        let myself = this;
        keys.forEach(rawKey => {
            var goalKey = myself.getClosestKey(rawKey);
            results.push(myself.dataStruct[goalKey]);
        });

        let finalResult = results[0];
        //intersection
        for (var i = 1; i < results.length; i++) {
            finalResult = new Set(
                [...finalResult].filter(x => results[i].has(x))
            );
        }

        if (rank) {
            finalResult = new Set(
                [...finalResult].filter(
                    x => x.rank.toLowerCase() == rank.toLowerCase()
                )
            );
        }

        finalResult = Array.from(finalResult);

        return finalResult;
    }

    querySpecies(name) {
        let keys = name.split(' ');
        let results = [];
        let myself = this;

        keys.forEach(rawKey => {
            var goalKey = myself.getClosestKey(rawKey);
            results.push(myself.dataStruct[goalKey]);
        });

        let finalResult = results[0];
        //intersection
        for (var i = 1; i < results.length; i++) {
            finalResult = new Set(
                [...finalResult].filter(x => results[i].has(x))
            );
        }

        if (rank) {
            finalResult = new Set(
                [...finalResult].filter(x => x.rank.toLowerCase() == 'species')
            );
        }

        finalResult = Array.from(finalResult);

        return finalResult;
    }

    //the search magic ocurs here
    getClosestKey(rawString) {
        let keyArray = Array.from(this.keys);

        let bestKey = undefined;
        let maxVal = 0;
        for (const actualKey of this.keys) {
            var similarityValue = similar_text(actualKey, rawString);

            if (similarityValue > maxVal) {
                maxVal = similarityValue;
                bestKey = actualKey;
                //console.log(similarityValue,actualKey,rawString);
            }
        }

        return bestKey;
    }

    getTopNKeys(number, rawString) {
        let bestKeys = [];
        let maxVal = 0;
        for (const actualKey of this.keys) {
            var similarityValue = similar_text(actualKey, rawString);

            if (similarityValue >= maxVal) {
                maxVal = similarityValue;
                bestKeys.unshift(actualKey);
                //console.log(similarityValue,actualKey,rawString);
            }
        }

        //not optimal :(
        while (bestKeys.length > number) {
            bestKeys.pop();
        }

        return bestKeys;
    }
}

//similarity function from
//https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely

function similar_text(first, second) {
    // Calculates the similarity between two strings
    // discuss at: http://phpjs.org/functions/similar_text

    if (
        first === null ||
        second === null ||
        typeof first === 'undefined' ||
        typeof second === 'undefined'
    ) {
        return 0;
    }

    first += '';
    second += '';

    var pos1 = 0,
        pos2 = 0,
        max = 0,
        firstLength = first.length,
        secondLength = second.length,
        p,
        q,
        l,
        sum;

    max = 0;

    for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
            for (
                l = 0;
                p + l < firstLength &&
                q + l < secondLength &&
                first.charAt(p + l) === second.charAt(q + l);
                l++
            );
            if (l > max) {
                max = l;
                pos1 = p;
                pos2 = q;
            }
        }
    }

    sum = max;

    if (sum) {
        if (pos1 && pos2) {
            sum += this.similar_text(
                first.substr(0, pos2),
                second.substr(0, pos2)
            );
        }

        if (pos1 + max < firstLength && pos2 + max < secondLength) {
            sum += this.similar_text(
                first.substr(pos1 + max, firstLength - pos1 - max),
                second.substr(pos2 + max, secondLength - pos2 - max)
            );
        }
    }

    return sum;
}
