

var tree = JSON.parse(sessionStorage.getItem("sessionTree1"));
var tree2 = JSON.parse(sessionStorage.getItem("sessionTree2"));
countChildren(tree);
countChildren(tree2);

//Calculates al tasks for both taxonomies
let levelList = createRankList(tree);
let levelList2 = createRankList(tree2);
calculate_all_merges(levelList,levelList2);

var data = [
{label: "Splits", value: tree.totalSplits},
{label: "Merges", value: tree2.totalMerges},
{label: "Removes", value: tree.totalRemoves},
{label: "Insertions", value: tree2.totalInsertions},
{label: "Moves", value: tree.totalMoves},
{label: "Renames", value: tree.totalRenames},
];

document.getElementById("TaxName").innerHTML = tree.r+": "+tree.n +" "+ tree.a +" "+tree.totalSpecies;

var colors = {
    "split-color":"#e066ff",                //color of split nodes used in lines and text
    "merge-color":"#ff9a47",                //color of merge nodes used in lines and text
    "rename-color":"#a37c58",               //color of rename nodes used in lines and text
    "move-color":"#8888CC",                 //color of move nodes used in lines and text
    "equal-color":"#e8e8e8",                //color of congruence nodes used in lines and text
    "focus-color":"#00000020"              //color of text when a node is clicked
}

    var div = d3.select("body").append("div").attr("class", "toolTip");

    var axisMargin = 20,
            margin = 40,
            valueMargin = 4,
            width = 960,
            height =500,
            barHeight = (height-axisMargin-margin*2)* 0.4/data.length,
            barPadding = (height-axisMargin-margin*2)*0.6/data.length,
            data, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });

    svg = d3.select('body')
            .append("svg")
            .attr("width", width)
            .attr("height", height);


    bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

        bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });


    bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
                return d.label;
            }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });

    scale = d3.scale.linear()
            .domain([0, max])
            .range([0, width - margin*2 - labelWidth]);

    xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(-height + 2*margin + axisMargin)
            .orient("bottom");


    bar.append("rect")
            .attr("fill",function(d) {
                switch(d.label) {
                case "Splits":
                    return "#e066ff"
                    break;
                case "Merges":
                    return "#ff9a47"
                    break;
                case "Removes":
                    return "#000000"
                    break;
                case "Insertions":
                    return "#e8e8e8"
                    break;
                case "Moves":
                    return "#8888CC"
                    break;
                case "Renames":
                    return "#a37c58"
                    break;
                default:
                    // code block
                }
                })
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
                return scale(d.value);
            });

    bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return (d.value);
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });

    bar
            .on("mousemove", function(d){
                div.style("left", d3.event.pageX+10+"px");
                div.style("top", d3.event.pageY-25+"px");
                div.style("display", "inline-block");
                div.html((d.label)+"<br>"+(d.value));
            });
    bar
            .on("mouseout", function(d){
                div.style("display", "none");
            });

    svg.insert("g",":first-child")
            .attr("class", "axisHorizontal")
            .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin)+")")
            .call(xAxis);
