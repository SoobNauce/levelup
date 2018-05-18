// testing code

/*
function sharesListTests(){
    let el = {
        input: gID("input"),
        output: gID("output")
    }

    el.testb = document.createElement("button");
    el.testb.setAttribute("id", "testb");
    el.input.appendChild(testb)
    el.testb.appendChild( document.createTextNode("Run test") );

    el.xrlabel = document.createElement("h2");
    el.xrlabel.append( document.createTextNode("X Results:") );
    el.loutput.appendChild(el.xrlabel);

    el.xresults = document.createElement("span");

    gID("output").innerHTML += "<h2>X Results:</h2><span id='xresults'></span>";
    gID("xresults").innerHTML = "<table id=xrtab></table>";
    function xrtUpdate(r){
        let tableBuilder = ["<tr><th>Name</th><th>Count</th></tr>"]
        for(let key in r){
            tableBuilder.push(
                `<tr><td>${key}</td><td>${r[key]}</td>`
            )
        }
        gID("xrtab").innerHTML = tableBuilder.join("");
    }

    var x = new SharesList(
        {a: 10, b: 20}
    );
    x.addShare("c", 10);
    console.log(x.export());
    console.log(x.calcTotal());

    let results = {
        a: 0,
        b: 0,
        c: 0,
        total: 0
    };
    xrtUpdate(results);

    gID("testb").onclick = function(){

        for(let i = 0; i < 100000; i += 1){
            results.total += 1;
            results[x.getOne()] += 1;
        }
        xrtUpdate(results);
    }
}
*/

/*
function uniformTest(){
    var trials = [];
    function calcMu(ts){
        let current = 0;
        let count = ts.length;
        for(let t of ts){
            current += t;
        }
        return current / count;
    }
    function calcSigma(ts){
        let mu = calcMu(ts);
        let denom = ts.length - 1;
        let total = 0;
        for(let t of ts){
            total += Math.abs(mu - t);
        }
        return total/denom;
    }

    var targetMean = 0;
    var targetStdev = 1;

    function runTrial(){
        let iM = gID("iMean").value;
        let iS = gID("iStdev").value;
        if(iM != targetMean || iS != targetStdev){
            trials = [];
            targetMean = iM;
            targetStdev = iS;
        }
        return trials.push(rNormal(targetMean, targetStdev));
    }
    gID("output").innerHTML = "<div id='trialDiv'></div><table id='muSigma'></table>"
    gID("trialDiv").className = "floatList";

    gID("muSigma").innerHTML = ["<tr><th id='totalRuns'>Total</th><th>Target</th><th>Sample</th></tr>",
        "<tr><td>Mean</td><td id='tMean'></td><td id='sMean'></td></tr>",
        "<tr><td>Standard deviation</td><td id='tSigma'></td><td id='sSigma'></td></tr>"].join("")
    gID("muSigma").className = "allLinesTable";

    function updateOutput(){
        let trialBuilder = [];
        for(let t of trials){
            trialBuilder.push(t.toString());
        }
        gID("trialDiv").innerHTML = trialBuilder.join("<br />");

        gID("totalRuns").innerHTML = `Total: ${trials.length}`;

        gID("tMean").innerHTML = targetMean.toString();
        gID("tSigma").innerHTML = targetStdev.toString();
        
        gID("sMean").innerHTML = calcMu(trials).toString();
        gID("sSigma").innerHTML = calcSigma(trials).toString();
    }

    gID("input").innerHTML = ["<p><button id=rTButton>Run more tests</button></p>",
        "<p>Note: changing mean or standard deviation will erase existing trial data</p>",
        "<p>Mean: <input type='number' value=0 id='iMean'></input></p>",
        "<p>Standard deviation: <input type='number' value=1 id='iStdev'></input></p>"].join("");
    
    gID("rTButton").onclick = function(){
        for(let i = 0; i < 1000; i += 1){
            runTrial();
        }
        updateOutput();
    }

    gID("rTButton").onclick();
}
*/

function simpleWorldTest(){
    var w = globals.w = new World();
    var s = globals.s = w.addStratum("Arena");
    var z = globals.z = s.getEntrance();
    var p = globals.p = w.newPlayer(name="Ariadne");

    buildUI();

    gID("look").onclick = function(){
        let described = z.describe("Zone");
        let dnode = document.createTextNode(described);
        zoneLookMode();
        clearElement(gID("descPre"));
        gID("descPre").appendChild(dnode);
    }
    gID("map").onclick = function(){
        let grid = z.showGrid();
        mapMode();

        let zoneMap = document.createElement("pre");
        zoneMap.appendChild(document.createTextNode( grid ));
        zoneMap.classList.add("zoneMap");

        gID("zmCurrent").appendChild(zoneMap);
    }

    gID("map").onclick();
}

// actual main hook
simpleWorldTest();