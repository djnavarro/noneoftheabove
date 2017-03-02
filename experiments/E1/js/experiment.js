
// ------------ constants -------------
var nInstruct = 5; // instruction items 
var nQuestions = 3; // check questions
var maxTrials = 29; // number of trials

// ------------ add the permute method to Arrays -------------

// permute all elements of an array
// requires: randomInteger, Array.prototype.swap
Array.prototype.permute = function(){
    var j=0;
	for( i=0; i<this.length-1; i++ ) { // loop over positions
        j=randomInteger( i+1, this.length ) // index of a random position > i
	    this.swap(i,j)
	}
	return( this )
}


// swap two elements of an array
Array.prototype.swap = function (x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
}

// ------------ window events -------------
window.onload = onLoadHandler
window.onbeforeunload = onBeforeUnloadHandler

// ------------ globals -------------
var data={} // data object
var tic // timer

// timing
data.startTime = Date.now() 
data.stopTime = 0

// boring stuff
data.instructionFails = 0 // how many times did they fail the check?
data.instructionTime = [] // track how long they looked at the instructions
data.instructionCheckScore = [] // how many questions did they get right each time?
data.demographics = {} // we need demographic information
data.turkcode = Math.floor( Math.random()*8999 )+1000 // generate completion code
data.unloadAttempts = 0 // idle curiosity: does anyone really try to leave?
data.response = [] // what do people choose?
data.responseTime = [] // how long does it take?

// important stuff
setUp();

var trial = 0 
var instruct = 1
var checkCount = 0


// ------------ on load -------------

function onLoadHandler() {

    // write the turk code to the document right at the beginning. Wrap it in an 
    // anonymous function to fix the asynchronous execution problem
    (function(){
        document.getElementById("turkcode").innerText = data.turkcode 
    })();
    
	// focus on start button
	setFocus( "splashButton" )
    
    
    // define the response slider
    $( "#slider" ).slider({
	   min: 0,
       max: 100,
       value: 50,
       slide: function( event, ui ) {
        setDisplay('endtrial','') // reveal the moveon button
        $( "#sliderval" ).val( ui.value );
      }
    });
    
        
    // define the dummy slider
    $( "#slider2" ).slider({
	   min: 0,
       max: 100,
       value: 50,
       slide: function( event, ui ) {
           $( "#sliderval2" ).val( ui.value ); // update the slider info box
      }
    });
    
    


}



// ------------ functions: flow control -------------

function splashButtonClick() {
	setDisplay('splash','none') 
	setDisplay('demographics','')
	setHeader('Demographics') 
}

function demographicsButtonClick() {
	setDisplay('demographics','none') 
	setHeader('Instructions')
	recordDemographics()
	writeData()
	setDisplay('instruction','')
	setFocus('instructionButton')
	tic = Date.now() // start timer [see ***]
} 

function instructionButtonClick() {

	if( instruct==nInstruct-1) { // change the text when we first reach last instruction
		document.getElementById("instructionButton").value = "Check your knowledge!"
	}

	if( instruct >= nInstruct ) { // if all instructions are revealed, move along
		setDisplay('instruction','none') 
		setDisplay('check','') 
		setHeader('Check Your Knowledge!')
		toc = Date.now() // see [***]
		
	} else { // reveal next instruction if needed
		
        setDisplay('instruction'+instruct,'')
        scrollTo('instruct'+instruct)
        setBoxBorder( instruct-1, '2px dotted grey' )
        
	}
	instruct++
}


function checkButtonClick() {
	setDisplay( 'check', 'none')
	
	var success = storeInstructionData()
	if( success ) {
		setHeader('Correct!')
		setDisplay( 'checkSuccess', '')
		setFocus('checkSuccessButton')
	} else {
		clearCheckRadio()
		setHeader('Please Try Again!')
		setDisplay( 'checkFail', '')
		setFocus('checkFailButton')
	}
	
}

function checkSuccessButtonClick() {
    setHeader('')
	setDisplay( 'checkSuccess', 'none')
	setDisplay( 'expt', '' )
	nextTrial()
}

function checkFailButtonClick() {
	setDisplay( 'checkFail', 'none')
	checkCount++
    setBoxBorder( nInstruct-1, '2px dotted grey' )
	setDisplay( 'instruction', '' )
	setHeader('Instructions')
	setFocus('instructionButton')
	scrollTo('top')
	tic = Date.now() // start timer [see ***]
}



function wrapUp() {	
	data.stopTime = Date.now()
	writeData()
	setHeader( "Finished!") 
	setDisplay( "wrapup", "")
	window.onbeforeunload = function(){}
}


// ------------ functions: data storage -------------

// function storing demographic data
function recordDemographics() {
	data.demographics.gender = getRadioButton("gender")
	data.demographics.age = document.getElementById("age").value
	data.demographics.language = document.getElementById("language").value
	data.demographics.country = document.getElementById("country").value
}

// function storing data from an instruction read/check
function storeInstructionData() {
	var val
	var nCorrect=0
	for( var q=0; q<nQuestions; q++) {
		val = getRadioButton("question"+q)
		if( val=="correct") nCorrect++
	}
	
	// store
	data.instructionTime[ checkCount ] = toc-tic  // [see ***]
	data.instructionCheckScore[ checkCount ] = nCorrect
	data.instructionFails = checkCount 
	
	// return
	var success = nCorrect == nQuestions
	return success
}

// function storing data from the previous trial
function storeTrialData() {
	var toc = Date.now() // stop the timer [see **]
    data.response[data.order[trial-1]] = document.getElementById("sliderval").value
	//data.response[data.order[trial-1]] = getRadioButton("responseBox")
	data.responseTime[data.order[trial-1]] = toc-tic // rt in ms is the difference
}


// function writing data to disk
function writeData() {

    // wrap the data writing event in an anonymous function to make sure 
    // it executes before we move to the next trial
    (function(){
        var dataString = JSON.stringify( data )
        //console.log( dataString )
        $.post('submit', {"content": dataString}); 
    })()
}


// ------------ functions: actions during the experment -------------


// run a trial
function nextTrial(){
	
    // wrap the data storage in an anonymous function to make sure 
    // it executes before we move to the next trial
    if( trial > 0 ) {
        (function(){
            storeTrialData()
        })()
    }
    
    
    // move to the next trial if there is one.
    if( trial < maxTrials ) {
                
        // wrap all the trial events in an anonymous function to ensure
        // the execute before anything else
        (function(){
            
            // hide the response options & reveal the move on button
            setDisplay("response","none")
            setDisplay("expt2","")
            setDisplay("endtrial","none")
            
            // add the island name information
            setHeader( (trial+1) + ". The bugs of the island of " + data.islandNames[trial] )
            document.getElementById("islandname").innerHTML = data.islandNames[trial]
            
            // clear the response from previous trials
            document.getElementById("sliderval").value= "" 
            $("#slider").slider({value:50}) 
            
            // data to present
            var counts = data.partitions[data.order[trial]]
            var labels = data.species[data.order[trial]]
            
            // horizontal bar ordering
            var s = makeDisplayString(counts,labels)
            
            // display
            document.getElementById("stimulus").innerHTML = s
            tic = Date.now() // start the timer [see **]
            
        })();
        
    // or move to the end of experiment if there is not
    } else {
        setDisplay( 'expt', 'none' )
        setDisplay( 'response', 'none' )
        setDisplay( "endtrial","none")
        wrapUp()
    }
    
    // increment counter
    trial++
}

function showResponseButtons() {
    setDisplay("response","")
    setDisplay("expt2","none")
}


function makeDisplayString( counts,labels ) {
    var s = "<b>"
    var len = counts.length
    var ord = seq(0,len-1,1);
    var max = counts[0] // relies on data.partitions always having the biggest count first
    ord.permute()
    for( j=max; j>0; j-- ) {
        s = s + "&nbsp;&nbsp;&nbsp;&nbsp;" // left margin
        for( i=0; i<len; i++ ){
            if( j<=counts[ord[i]] ) {
                s = s + labels[ord[i]] // label
            } else {
                s = s + "&nbsp;&nbsp;&nbsp;&nbsp;" // blank
            }
            s = s + "&nbsp;&nbsp;" // space between labels
        }
        s = s + "<br>" // line break
    }
    s = s + "</b>"
    return(s)
}


// get partitions
function setUp() {
    
    // the 29 logical partitions
    data.partitions = [
        [1],
        [2],
        [1,1],
        [3],
        [2,1],
        [1,1,1],
        [4],
        [3,1],
        [2,2],
        [2,1,1],
        [1,1,1,1],
        [5],
        [4,1],
        [3,2],
        [3,1,1],
        [2,2,1],
        [2,1,1,1],
        [1,1,1,1,1],
        [6],
        [5,1],
        [4,2],
        [4,1,1],
        [3,3],
        [3,2,1],
        [3,1,1,1],
        [2,2,2],
        [2,2,1,1],
        [2,1,1,1,1],
        [1,1,1,1,1,1]
    ];
    
    // random island names
    data.islandNames = [ 
        "Degrost", "Paparren", "Combles", "Montalten", "Brevia",
        "Cassesse", "Recatien", "Molock", "Proverce", "Tranatel",
        "Downplaine", "Ressig", "Flaudiss", "Velvier", "Jonaken", 
        "Minnerpin", "Iderfoll", "Strule", "Shorgalash", "Compana",
        "Ricattere", "Hansetica", "Bosson", "Porsey", "Mattine", 
        "Osnow", "Botticano", "Recorrane", "Fronans"]
    data.islandNames.permute()
        
    // random presentation order
    data.order = seq(0,maxTrials-1,1)
    data.order.permute()
    
    // function to generate a random species name
    function randomSpeciesName() {
        var letters=['A','E','I','O','U','B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z']
        
        // alpha header
        var s= letters[randomInteger(0,25)] + letters[randomInteger(0,25)]
        
        // numeric ending
        s = s + randomInteger(0,9) + randomInteger(0,9)
        return(s)
    }
    
    // create species codes
    data.species = [];  
    var len = 0
    for( i=0; i<maxTrials; i++) {
        len = data.partitions[i].length
        data.species[i] = [];
        for( j=0; j<len; j++ ) {
         data.species[i][j] = randomSpeciesName();   
        }
    }
    
    
}

    
// ------------ functions: computational helpers -------------


// uniform integer between a and b
function randomInteger( a, b ) {
	return( Math.floor((Math.random()*(b-a)) +a))
}


// creates a vector of numbers starting at "from", ending at "to",
// and incrementing in units of "by"
function seq(from,to,by) {

    // step size is 1 unless stated
    if(arguments.length < 3) {
        var by=1
     }

	// now create the vector
	var x = [];
	for (var i = from; i <= to; i=i+by) {
	    x.push(i)
	}
	    
	return( x )	

}

// ------------ functions: generic UI helpers -------------

// move to the specified location
function scrollTo(hash) {
    location.hash = "#" + hash;
}

// get the value of a radio button
function getRadioButton( name ) {
	var radios = document.getElementsByName( name );
	for (var i = 0, length = radios.length; i < length; i++) {
	    if (radios[i].checked) {
	        return( radios[i].value )
		}
	}
}

// function to change the display property of a set of objects
function setDisplay( theClass, theValue ) {
	var classElements = document.getElementsByClassName( theClass )
	for( var i=0; i< classElements.length; i++ ) { 
		classElements[i].style.display = theValue
	}
}

// function to change the visibility property of a set of objects
function setVisibility( theClass, theValue ) {
	var classElements = document.getElementsByClassName( theClass )
	for( var i=0; i< classElements.length; i++ ) { 
		classElements[i].style.visibility = theValue
	}
}

// set the focus
function setFocus( theElement ) {
	document.getElementById( theElement ).focus()
}




// ------------ functions: specific UI helpers -------------

// alter the header
function setHeader( theValue ) {
	document.getElementById("header").innerText =  theValue
}

// alter the border (on one of the instruction boxes)
function setBoxBorder( whichBox, theValue ) {
	document.getElementById('instruction'+ whichBox +'inner').style.border=theValue
}

// clear all the check marks for the radio buttons 
function clearCheckRadio() {
	var radios = document.getElementsByClassName( 'checkRadio' );
	for (var i = 0, length = radios.length; i < length; i++) {
		radios[i].checked = false
	}
}

// pre load immages
function preloadImages(arr){
    var newimages=[]
    var arr=(typeof arr!="object")? [arr] : arr //force arr parameter to always be an array
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image()
        newimages[i].src=arr[i]
    }
}
 



// ------------ functions: window unload handler -------------

function onBeforeUnloadHandler(e) {
	
  // store it.
  data.unloadAttempts++
	
  var message = "You are about to leave this page, but have not yet finished the experiment or received the completion code for the HIT",
  e = e || window.event;
  // For IE and Firefox
  if (e) {
    e.returnValue = message;
  }

  // For Safari
  return message;
};