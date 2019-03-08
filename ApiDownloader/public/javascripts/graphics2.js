

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var setXCordinate = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var setYCordinate = d3.scaleLinear()
          .range([height,0]);
var setYCordinate2Print = d3.scaleLinear()
          .range([height,0]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

function getMaxOfArray(numArray){
  return Math.max.apply(null,numArray);
}

// get the data
//var data = [{1,2},{4,28},{14,32},{11,92},{1,52}]


//data.forEach(drawHistogramItem);


function buildHistogram(originalData){
let processedData = buildData(originalData);
  // format the data
  /*data.forEach(function(item) {
    item.sales = +item.sales;
  });*/

  // Scale the range of the data in the domains
  //console.log(Object.keys(originalData));
  setXCordinate.domain(Object.keys(originalData));
  setYCordinate.domain([0, Math.log(getMaxOfArray(originalData))]);
  //console.log([0, getMaxOfArray(data)]);
  // append the rectangles for the bar chart


  svg.selectAll(".bar")
      .data(processedData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(item) { return setXCordinate(item.x) })
      .attr("width", setXCordinate.bandwidth())
      .attr("y", function(item) { return setYCordinate(Math.log(item.y+1));})
      .attr("height", function(item) { return height - setYCordinate(Math.log(item.y+1)); });
  //console.log("element: " ,index,"----------",setXCordinate(index), "---",setXCordinate.bandwidth());
  // add the setXCordinate Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(setXCordinate));

  // add the setYCordinate Axis
  //setYCordinate.domain([0, getMaxOfArray(originalData)]);
  svg.append("g")
      .call((d3.axisLeft(setYCordinate)));

}

function buildData(originalData){
  let newData = [];
  originalData.forEach(function(element,index){
    newData.push({x:index,y:element})
  });

  return newData;
}

var data = [1,2,3,3,4,5,6,150,100000000000]
buildHistogram(data);
