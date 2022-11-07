var path = "athlete_events_processed.csv"

// selecting the required columns form data
var dataArray = function (d) {
    return {
        City: d.City,
    }
}

// global variables
var graph_width = 1000
var graph_height = 620;
var graph_margin = 170;

// svg element for graph
var graph_mySVG = d3.select("body")
    .append("svg")
    .attr("id", "mySVG")
    .attr("width", graph_width)
    .attr("height", graph_height)


d3.csv(path, dataArray)
    .then(function (myData) {

        var nestedData = d3.nest()
            .key(function (d) {
                return d.City // grouping the data by city
            })
            .rollup(function (City) {
                return City.length; // counting the cities 
            })
            .entries(myData)
        console.log(nestedData);

        //sorting the data by count of cities
        nestedData.sort(function (a, b) {
            return d3.descending(a.value, b.value)
        })

        //setting the color for bar
        var barColor_host = d3.scaleOrdinal()
            .range(["#ffa600"])

        //setting the scale for X and Y axixes
        var graph_xScale = d3.scaleBand()
            .range([graph_margin, graph_width])
            .padding(0.2);

        var graph_yScale = d3.scaleLinear()
            .range([graph_height - graph_margin, 0]);

        //setting teh domain for axixes
        graph_xScale.domain(nestedData.map(function (d) {
            return d.key;
        }))

        graph_yScale.domain([0, d3.max(nestedData, function (d) {
            return d.value;
        })])

        //adding bars to the graph
        graph_mySVG.selectAll(".bar")
            .data(nestedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return graph_xScale(d.key); })
            .attr("y", function (d) { return graph_yScale(d.value); })
            .attr("width", graph_xScale.bandwidth())
            .attr("height", function (d) { return graph_height - graph_margin - graph_yScale(d.value); })
            .style("fill", function (d) { return barColor_host(d.value); })
            .on("mouseenter", function (d, i) {
                console.log(d.value + "::" + d.key);
                d3.select(this)
                    .style("fill", "#E74C3C ")
                d3.select("g")
                    .append("text")
                    .attr("class", "tooltip_bar")
                    .attr("x", graph_width - 250)
                    .attr("y", -300)
                    .text(d.value + " times Olympics was hosted in " + d.key)
                    .style("font-size", "20px")
                    .style("fill", "#E74C3C")
                    .style("stroke", "#E74C3C")
            })
            .on("mouseout", function (d) {
                console.log("out");
                d3.select(this)
                    .style("fill", function (d) { return barColor_host(d.key) })
                d3.selectAll(".tooltip_bar")
                    .remove();
            })

        //adding title for the graph
        graph_mySVG.append("text")
            .attr("x", (graph_width / 2))
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .text("Hosting Cities of Olympics from Athens 1896 to Rio 2016");

        //adding x axis with their corresponding values 
        graph_mySVG.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0, " + (graph_height - graph_margin) + ")")
            .call(d3.axisBottom(graph_xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.6em")
            .attr("dy", "-0.6em")
            .attr("transform", "rotate(-90)")
            .style("font-size", "12px")

        //adding title for x axis
        d3.select(".x_axis")
            .append("text")
            .text("Olympics Hosting Cities")
            .style("fill", "black")
            .style("font-size", "23px")
            .attr("x", 600)
            .attr("y", 130)


        //adding y axis with their corresponding values 
        graph_mySVG.append("g")
            .call(d3.axisLeft(graph_yScale))
            .attr("class", "y_axis")
            .attr("transform", "translate(" + graph_margin + ",0)")
            .style("font-size", "12px");

        //adding title for y axis                       
        d3.select(".y_axis")
            .append("text")
            .text("Number of times Olympics was hosted")
            .style("fill", "black")
            .style("font-size", "15px")
            .attr("transform", "rotate(-90)")
            .attr("x", -65)
            .attr("y", -60)
            .style("font-size", "18px")

    })
