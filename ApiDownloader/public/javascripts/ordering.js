/**
 * TODO
 * sort must ascend to parent nodes
 *
 *
 *
 */

//from https://codeburst.io/binary-search-in-javascript-a-practical-example-7fda60ce59a1
//this binary search is customized to be used on taxons of our hierarchy
//returns an index
const binarySearch = (data, target, start, p_end) => {
    const m = Math.floor((start + p_end) / 2);
    if (target.y == data[m].y) return m;
    if (p_end - 1 === start)
        return Math.abs(data[start].y - target.y) >
            Math.abs(data[p_end].y - target.y)
            ? p_end
            : start;
    if (target.y > data[m].y) return binarySearch(data, target, m, p_end);
    if (target.y < data[m].y) return binarySearch(data, target, start, m);

    return null;
};

//requires pvalues to be computed
function sort_tree_nodes(actualTree) {
    //ineficient
    proccesByLevel(actualTree, function(node) {
        custom_sort(node);
    });
}

//se asigna el valor p a la hora de calcular las lineas;
function custom_sort(node) {
    node.c.sort((a, b) => parseFloat(a.p) - parseFloat(b.p)); //ordenamiento basado en el valor p
}

function sort_all_lines(yPosL, yPosR) {
    //console.log(lines);
    //sort_lines(lines.splits,yPosL, yPosR);
    //sort_lines(lines.merges,yPosL, yPosR);
    //sort_lines(lines.equals,yPosL, yPosR);
    //sort_lines(lines.renames,yPosL, yPosR);
    //sort_lines(lines.moves,yPosL, yPosR);

    let all_lines = get_all_lines();
    sort_lines(all_lines, yPosL, yPosR);

    //console.log("sorted !!!!!!!!");
}

function sort_lines(actual_lines, yPosL, yPosR) {
    //console.log(typeof(actual_lines))
    //console.log(actual_lines)

    actual_lines.forEach(line => {
        //nodes we will work with
        let source = line.o;
        let target = line.t;

        //nodes containing our nodes
        let dad = source.f[source.f.length - 1];
        let mom = target.f[target.f.length - 1];

        //index of node in children array of  parent
        let source_index = binarySearch(dad.c, source, 0, dad.c.length - 1);
        let target_index = binarySearch(mom.c, target, 0, mom.c.length - 1);

        //console.log(source,target);
        //physics based sort of source
        if (dad.c[source_index] == source) {
            //calculate new index displacing it by force
            let newIndex = Math.round(source_index + source.p);
            newIndex = Math.max(newIndex, 0);
            newIndex = Math.min(newIndex, dad.c.length - 1);

            //console.log(source,target,dad.c,newIndex);
            //check if change produces an improvement is not exact becaus positions are not updated yet, but it will do
            if (
                getDistance(source, target, yPosL, yPosR) >
                getDistance(dad.c[newIndex], target, yPosL, yPosR)
            ) {
                //remove node form parent
                dad.c.splice(source_index, 1);

                //reposition item on dad node
                dad.c.splice(newIndex, 0, source);
            }
        }

        //physics based sort of target
        if (mom.c[target_index] == target) {
            //calculate new index displacing it by force
            let newIndex = Math.round(target_index + target.p);
            newIndex = Math.max(newIndex, 0);
            newIndex = Math.min(newIndex, mom.c.length - 1);

            //check if change produces an improvement is not exact becaus positions are not updated yet, but it will do
            if (
                getDistance(source, target, yPosL, yPosR) >
                getDistance(source, mom.c[newIndex], yPosL, yPosR)
            ) {
                //remove node form parent
                mom.c.splice(target_index, 1);

                //reposition item on mom node
                mom.c.splice(newIndex, 0, target);
            }
        }
    });
}

//pValue is 0 by dafault
//by doing multiple iterations results can be improved
function updateP(options, p_lines, yPosL, yPosR) {
    //reset p value
    p_lines.forEach(function(line) {
        line.o.p = 0;
        line.t.p = 0;
    });

    p_lines.forEach(function(line) {
        let distance = line.o.y + yPosL - (line.t.y + yPosR); //vertical distance betwen the two nodes
        let direction = distance == 0 ? 0 : Math.abs(distance) / distance; //conservamos solo el simbolo de la direccion, evitamos error de division sobre 0

        //console.log({distance,direction});
        //calcula la prioridad que tiene una linea para moverce hacia una direccion
        //se suma ya que puede tene un valor p aportado por otra linea que lo toco
        let force = direction * Math.abs(distance) * options.atractionForce;
        line.t.p += force; /* line.a*/ //a es la cantidad de lineas representadas por ese nodo
        line.o.p -= force;
        //console.log(line.o.n,line.t.n,distance,line.a ,line.o.p,line.t.p);
    });

    //should sort parents of nodes in lines
}

//sort node children in alphabetical order
//requires to rerender because nodes are disordered
function resetSort(node) {
    console.log('sorting node');
    node.c.sort((a, b) => {
        if (a.n < b.n) {
            return -1;
        }
        if (a.n > b.n) {
            return 1;
        }
        return 0;
    });
}

function getDistance(source, target, yPosL, yPosR) {
    return Math.abs(source.y + yPosL - (target.y + yPosR));
}
