var mc = require('mcprotocol');
var conn = new mc;
var doneReading = false;
var doneWriting = false;

var variables = { fn: 'DFLOAT998'};										// See setTranslationCB below for more examples

conn.initiateConnection({port: 5001, host: '127.0.0.1', ascii: false}, connected); 

function connected(err) {
	if (typeof(err) !== "undefined") {
		// We have an error.  Maybe the PLC is not reachable.  
		console.log(err);
		process.exit();
	}
	conn.setTranslationCB(function(tag) {return variables[tag];}); 	// This sets the "translation" to allow us to work with object names defined in our app not in the module
	//conn.addItems(['fn', 'TEST4']);	
	conn.addItems('fn');
//	conn.removeItems(['TEST2', 'TEST3']);  // We could do this.  
//	conn.writeItems(['TEST5', 'TEST7'], [ true, true ], valuesWritten);  	// You can write an array of items as well.  
	//conn.writeItems('fn', [ 666 ], valuesWritten);  				// You can write a single array item too.  
    conn.readAllItems(valuesReady);	
}

function valuesReady(anythingBad, values) {
	if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
	console.log(values);
	doneReading = true;
	if (doneWriting) { process.exit(); }
}

function valuesWritten(anythingBad) {
	if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
	console.log("Done writing.");
	doneWriting = true;
	if (doneReading) { process.exit(); }
}