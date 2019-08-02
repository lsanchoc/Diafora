var tree = JSON.parse(sessionStorage.getItem('sessionTree1')).taxonomy;
var tree2 = JSON.parse(sessionStorage.getItem('sessionTree2')).taxonomy;
countChildren(tree);
countChildren(tree2);

//Calculates al tasks for both taxonomies
let levelList = createRankList(tree);
let levelList2 = createRankList(tree2);
calculate_all_merges(levelList, levelList2);

var data = [
    { name: 'Splits', value: tree.totalSplits },
    { name: 'Merges', value: tree.totalMerges },
    { name: 'Removes', value: tree.totalRemoves },
    { name: 'Insertions', value: tree.totalInsertions },
    { name: 'Moves', value: tree.totalMoves },
    { name: 'Renames', value: tree.totalRenames },
];

// Dimensions of Histogram
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Ranges
var setXCordinate = d3
    .scaleBand()
    .range([0, width])
    .padding(0.1);
var setYCordinate = d3.scaleLinear().range([height, 0]);
var setYCordinate2Print = d3.scaleLog().range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

function buildHistogram(originalData) {
    let processedData = buildData(originalData);

    // Scale domains based on Data
    setXCordinate.domain(originalData.map(d => d.value));
    setYCordinate.domain([0, 120]);
    //setYCordinate.domain([0, (getMaxOfArray(originalData))]);
    console.log(getMaxOfArray(originalData));

    //Append each bar to the graph
    svg.selectAll('.bar')
        .data(processedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(item) {
            return setXCordinate(item.value);
        })
        .attr('width', setXCordinate.bandwidth())
        .attr('y', function(item) {
            return setYCordinate(item.value + 1);
        })
        .attr('height', function(item) {
            return height - setYCordinate(item.value + 1);
        });

    // Add the setXCordinate Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(setXCordinate));

    // Add the setYCordinate Axis
    svg.append('g').call(d3.axisLeft(setYCordinate));
}

function buildData(originalData) {
    let newData = [];
    /*Object.keys(originalData).forEach(function(objKey,index){
    let actual = originalData[objKey];
    newData[objKey] ={x:index,y:actual};
  });*/
    originalData.forEach(function(item, index) {});
    console.log(newData);
    return newData;
}

//var data = [tree.totalSplits,tree2.totalMerges,tree.totalRemoves,tree2.totalInsertions,tree2.totalMoves,tree2.totalRenames]

console.log(data);
buildHistogram(data);
