var path = "athlete_events_processed.csv"

// selecting required columns from data file
var dataArray = function(d) {
    return {
        Agegroup: d.Agegroup,
        Medal: d.Medal
    }
}

//global variables
var width = 900
var height = 500;
var margin = 70;

// svg element for graph
var mySVG = d3.select("body")
    .append("svg")
    .attr("width", width + 60)
    .attr("height", height + 60)

d3.csv(path, dataArray)
    .then(function(myData) {

        //sorting a data by ageGroup
        myData.sort(function(a, b) {
            return d3.ascending(a.Agegroup, b.Agegroup)
        })

        var nestedData = d3.nest()
            .key(function(d) {
                return d.Agegroup // Grouping data by ageGroup
            })
            .key(function(d) {
                return d.Medal // Grouping data by modals
            })
            .rollup(function(medals) {
                return medals.length; // counting total number of medals per age group
            })
            .entries(myData)

        // console.log(nestedData)

        // setting the scale for x and y axises
        var x_agegroup = d3.scaleBand()
            .range([0, width])
            .padding(0.2);

        var x_agegroup_medals = d3.scaleBand();

        var y_scale = d3.scaleLinear()
            .range([height, 0]);

        //function to returns the different age group
        var ageGroups = nestedData.map(function(d) {
            return d.key;
        });

        // function to return the name of different madels
        var medalsNames = nestedData[0].values.map(function(d) {
            return d.key;
        });

        //setting the domain for axixes 
        x_agegroup.domain(ageGroups)
            .padding(0.2);

        x_agegroup_medals.domain(medalsNames)
            .range([0, x_agegroup.bandwidth()]);

        y_scale.domain([0, d3.max(nestedData, function(key) {
            return d3.max(key.values, function(d) {
                return d.value;
            });
        })]);

        //mapping the values to axixes
        var xAxis = d3.axisBottom(x_agegroup)
            .ticks(nestedData.map(function(d) {
                return d.key
            }));

        var yAxis = d3.axisLeft(y_scale);

        // color scales for bars
        var barcolor = d3.scaleOrdinal()
            .range(["#cccccc", "#b07111", "#d4af37"])

        // seting title for the graph
        mySVG.append("text")
            .attr("x", 650)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .text("Medals won by athelets of different age groups");


        //adding values to X axis
        mySVG.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(60," + height + ")")
            .call(xAxis);

        d3.select(".x_axis")
            .append("text")
            .text("Age group of Athletes")
            .style("fill", "black")
            .style("font-size", "15px")
            .attr("x", 350)
            .attr("y", 50)

        //adding values to Y axis
        mySVG.append("g")
            .attr("class", "y_axis")
            .attr("transform", "translate(60,0)")
            .call(yAxis)

        d3.select(".y_axis")
            .append("text")
            .text("Number of Medals")
            .style("fill", "black")
            .style("font-size", "15px")
            .attr("transform", "rotate(-90)")
            .attr("x", -180)
            .attr("y", -50)

        //setting the bars to the graph
        var barGroup = mySVG.selectAll(".barGroup")
            .data(nestedData)
            .enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + (x_agegroup(d.key) + 50) + ",0)"; })

        barGroup.selectAll("rect")
            .data(function(d) { return d.values; })
            .enter().append("rect")
            .attr("width", x_agegroup_medals.bandwidth())
            .attr("height", function(d) { return height - y_scale(0); })
            .attr("x", function(d) { return x_agegroup_medals(d.key); })
            .attr("y", function(d) { return y_scale(0); })
            .style("fill", function(d) { return barcolor(d.key) })

        barGroup.selectAll("rect")
            .attr("y", function(d) { return y_scale(d.value); })
            .attr("height", function(d) { return height - y_scale(d.value); })
            //tooltip: mouse over effect of each bar
            .on("mouseenter", function(d, i) {
                // console.log(d.value + "::" + d.key);
                d3.select(this)
                    .style("fill", "#E74C3C ")
                d3.select("g")
                    .append("text")
                    .attr("class", "tooltip")
                    .attr("x", 550)
                    .attr("y", -400)
                    .text(d.value + " " + d.key + " Medals")
                    .style("font-size", "20px")
                    .style("fill", "#E74C3C")
                    .style("stroke", "#E74C3C")
            })
            // tooltip: mouse out effect for each bar
            .on("mouseout", function(d) {
                // console.log("out");
                d3.select(this)
                    .style("fill", function(d) { return barcolor(d.key) })
                d3.selectAll(".tooltip")
                    .remove();
            })

        //adding legends for gold/sliver/bronze medals with their corresponding color of bar
        var legend = mySVG.selectAll(".legend")
            .data(nestedData[0].values.map(function(d) { return d.key; }))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

        legend.append("rect")
            .attr("x", width - 10)
            .attr("y", 135)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", function(d) { return barcolor(d); });

        legend.append("text")
            .attr("x", width - 20)
            .attr("y", 150)
            .style("text-anchor", "end")
            .text(function(d) { return d; });

    })