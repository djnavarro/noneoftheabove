/*jslint sloppy: true */

// ------------ add the permute method to Arrays -------------

// uniform integer greater than or equal to a AND less than b
function randomInteger(a, b) {
    // "use strict";
	return (Math.floor((Math.random() * (b - a)) + a));
}

// permute all elements of an array [THIS IS THE CORRECTED VERSION!!!]
// requires: randomInteger, Array.prototype.swap
Array.prototype.permute = function () {
    // "use strict";
    var i, j = 0;
	for (i = 0; i <= this.length - 2; i = i + 1) { // loop over positions
        j = randomInteger(i, this.length); // index of a random position >= i
	    this.swap(i, j);
	}
	return (this);
};

// swap two elements of an array
Array.prototype.swap = function (x, y) {
    // "use strict";
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return (this);
};

// creates a vector of numbers starting at "from", ending at "to",
// and incrementing in units of "by"
function seq(from, to, by) {
    // "use strict";
    var i, x = [];
    if (arguments.length < 3) { // step size is 1 unless stated
        by = 1;
    }
	for (i = from; i <= to; i = i + by) { // now create the vector
	    x.push(i);
	}
	return x;
}


// ------------ globals -------------
var trainingNames, trainingValues, testValues, testNames, nTypes, nTokens,
    stimulusNames, stimulusOrder, labels, conditionOrder, currentTask,
    currentStimulusSet, currentLabelSet, currentTrainingSet, currentTestSet,
    currentTrial, currentNTokens, currentNTypes, trainingCategories,
    currentTrialOrder, responseMap, tic, toc, data, lastSlot, lastButton,
    trialOrder, experimentVersion, instruct, nInstruct, nQuestions, nCond, ISI;

//// variables that define the 12 conditions
//trainingNames = ["11", "31", "51","22","321","221"];
//
//// locations
//trainingValues = [  [60, 75], // 11
//                    [-1, -1, 60, 75], // 31
//                    [-1, -1, -1, -1, 60, 75], // 51
//                    [40, 50, 60, 75], // 22
//                    [-1, -1, 40, 55, 60, 75], // 321
//                    [40, 50, -1, 60, 75] ]; // 221
//
//
//// index into the label vector for each training item
//trainingCategories = [ [0, 1], // 11
//                      [0, 0, 0, 1], // 31
//                      [0, 0, 0, 0, 0, 1], // 51
//                      [0, 0, 1, 1], // 22
//                      [0, 0, 0, 1, 1, 2], // 321
//                      [0, 0, 1, 1, 2] ]; // 221
//
//// properties of the training set
//nTypes = [2, 2, 2, 2, 3, 3];
//nTokens = [2, 4, 6, 4, 6, 5];

//// variables that define the 12 conditions
//trainingNames = ["111","321","12","42","4","3"];
//
//// locations
//trainingValues = [  [45, 60, 75], // 111
//                    [-1, -1, -1, 45, 60, 75], // 321
//                    [60, 75,-1], // 12
//                    [-1, -1, -1, 60, 75, -1], // 42
//                    [45, -1, 60, 75], // 4
//                    [45, 60, 75] // 3
//                 ];  
//
//// 321 -> 411 (familiar addition)
//// 22 -> 42 (familiar addition)
//// 3 -> 4 (familiar addition)
//
//// index into the label vector for each training item
//trainingCategories = [[0, 1, 2], // 111
//                      [0, 0, 1, 0, 1, 2], // 321
//                      [0, 1, 1], // 12
//                      [0, 0, 0, 0, 1, 1], // 42
//                      [0, 0, 0, 0], // 4
//                      [0, 0, 0] ]; // 3
//
//// properties of the training set
//nTypes = [3, 3, 2, 2, 1, 1];
//nTokens = [3, 6, 3, 6, 4, 3];



// variables that define the 12 conditions
trainingNames = ["1", "11", "111", "2", "3", "21", "4", "31", "22", "211", "1111",
                 "11F", "21F", "111F", "31F", "211F", "22F", "1111F"];




// locations
trainingValues = [  [75], // 1
                    [-1, 75], // 11
                    [-1, -1, 75], // 111
                    [-1, 75], // 2
                    [-1, -1, 75], // 3
                    [-1, -1, 75], // 21
                    [-1, -1, -1, 75], // 4
                    [-1, -1, -1, 75], // 31
                    [-1, -1, -1, 75], // 22
                    [-1, -1, -1, 75], // 211
                    [-1, -1, -1, 75], // 1111
                    [60, 75], // 11F
                    [55, 60, 75], // 21F
                    [45, 60, 75], // 111F
                    [50, 55, 60, 75], // 31F
                    [40, 45, 60, 75], // 211F
                    [40, 45, 60, 75], // 22F <- hm. spacing??
                    [30, 45, 60, 75] // 1111
                 ];

// index into the label vector for each training item
trainingCategories = [[0], // 1
                      [1, 0], // 11
                      [2, 1, 0], // 111
                      [0, 0], // 2
                      [0, 0, 0], // 3
                      [1, 1, 0],  // 21
                      [0, 0, 0, 0], // 4
                      [1, 1, 1, 0], // 31
                      [1, 1, 0, 0], // 22
                      [2, 2, 1, 0], // 211
                      [3, 2, 1, 0], // 1111
                      [1, 0], // 11F
                      [1, 1, 0],  // 21F
                      [2, 1, 0], // 111F
                      [1, 1, 1, 0], // 31F
                      [2, 2, 1, 0], // 211F
                      [1, 1, 0, 0], // 22F
                      [3, 2, 1, 0] // 1111F
                     ];

// properties of the training set
nTypes = [1, 2, 3, 1, 1, 2, 1, 2, 2, 3, 4, 2, 2, 3, 2, 3, 2, 4];
nTokens = [1, 2, 3, 2, 3, 3, 4, 4, 4, 4, 4, 2, 3, 3, 4, 4, 4, 4];

nCond = 36;


testValues = [85, 95]; // near, far
testNames = ["near", "far"];
experimentVersion = 1; // not relevant

// present the conditions in a random order
conditionOrder = seq(1, nCond, 1);
conditionOrder.permute();

function sortStimuli(condOrd) {
    
    var base, stimOrd = [], i, c, filler, ind, set1, set2, cnt1, cnt2;
    
    // begin with a random shuffling of the 13 sets
    base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
    base = base.permute();
    
    // we need two shuffle sets
    set1 = [1, 2, 3, 4, 5, 6, 7, 8,
            9, 10, 11, 12, 13, 14, 15, 16,
            1, 2, 3, 4, 5, 6].permute();
    set2 = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
            1, 2, 3, 4].permute();
    cnt1 = 0;
    cnt2 = 0;
    
    for (i = 0; i < nCond; i = i + 1) {
        c = condOrd[i]; // which condition?
        filler = false;
        if (c >= 12 && c <= 18) {
            filler = true;
        }
        if (c >= 30) {
            filler = true;
        }
        if (filler) {
            ind = set2[cnt2] - 1;
            cnt2 = cnt2 + 1;
        } else {
            ind = set1[cnt1] - 1;
            cnt1 = cnt1 + 1;
        }
        stimOrd[i] = base[ind];
    }
    
    return (stimOrd);
    
}

// show the stimuli in a random order <-- EEK need more!!!!
stimulusNames = ["1-pacman", "2-compass", "3-L", "4-squareshade", "5-T",
                 "6-circleshade", "7-rectfill", "8-circfill", "9-radio",
                 "10-wedge", "11-hash", "12-Hfill", "13-vertshade",
				"14-pacman", "15-compass", "16-L", "17-squareshade", "18-T",
                 "19-circleshade", "20-rectfill", "21-circfill", "22-radio",
                 "23-wedge", "24-hash", "25-Hfill", "26-vertshade",
"27","28","29","30","31","32","33","34","35","36"
];
////stimulusOrder = seq(1, nCond, 1);
//stimulusOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
//                 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
//                 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
//                ];
//stimulusOrder.permute();
//stimulusOrder = sortStimuli(conditionOrder);

stimulusOrder = seq(1, nCond, 1);
stimulusOrder.permute();

// use the labels in a random order
labels = ["Dax", "Wug", "Fep", "Zog", "Ort", "Bir", "Nup", "Lan",
          "Kib", "Dif", "Saz", "Erp", "Tel", "Yun", "Pas", "Gir",
          "Huk", "Jee", "Led", "Kro", "Cal", "Ved", "Mer", "Plo",
          "Rog", "Wek", "Nan", "Foo", "Baz", "Stu", "Ael", "Oob",
          "Gog", "Ruv", "Yox", "Loe", "Wri", "Fle", "Cuo", "Qur",
          "Sul", "Voo", "Noy", "Ast", "Bos", "Cet", "Dur", "Fuy",
          "Gry", "Hyn", "Joo", "Keo", "Lin", "Mak", "Nuu", "Olv",
          "Pex", "Qin", "Rer", "Sek", "Toi", "Urg", "Vis", "Won",
          "Xix", "Yaa", "Zek", "Agy", "Bux", "Cru", "Dow", "Een",
          "Unx", "Gwo", "Hei", "Ior", "Jij", "Klu", "Muw", "Xon"
         ]; // 80 labels in total needed
labels.permute();

// present trials in a random order
(function () {
    // "use strict";
    var blah;
    trialOrder = [];
    for (blah = 0; blah < nCond; blah = blah + 1) {
        trialOrder[blah] = seq(0, nTokens[blah % (nCond / 2)] - 1).permute(); // random trial order
        trialOrder[blah][nTokens[blah % (nCond / 2)]] = nTokens[blah % (nCond / 2)]; // test item last
    }
}());

// which task is the participant up to?
currentTask = 1;

// how many image slots does the HTML provide?
lastSlot = 6;
lastButton = 6;

// instructions 
nInstruct = 3;
instruct = 1;
nQuestions = 3;

ISI = 750; // ms between stimuli reveal

// initialise data
data = {};
data.experiment = {};
data.other = {};

// stuff that matters
data.experiment.event = [];
data.experiment.task = [];
data.experiment.trial = [];
data.experiment.train = [];
data.experiment.test = [];
data.experiment.stimuli = [];
data.experiment.labels = [];
data.experiment.isTestItem = [];
data.experiment.value = [];
data.experiment.trueCat = [];
data.experiment.bestChoice = [];
data.experiment.response = [];
data.experiment.RT = [];
data.experiment.correct = [];
data.experiment.version = [];

// the boring bits
data.other.startTime = Date.now();
data.other.stopTime = 0;
data.other.instructionFails = 0; // how many times did they fail the check?
data.other.instructionTime = []; // track how long they looked at the instructions
data.other.instructionCheckScore = []; // how many questions did they get right each time?
data.other.turkcode = Math.floor(Math.random() * 89999999) + 10000000; // generate completion code
data.other.unloadAttempts = 0; // idle curiosity: does anyone really try to leave?
data.other.gender = [];
data.other.age = [];
data.other.language = [];
data.other.country = [];

// set the completion code
document.getElementById('turkcode').innerHTML = data.other.turkcode.toString();

// function writing data to disk
function writeData() {

    // wrap the data writing event in an anonymous function to make sure 
    // it executes before we move to the next trial
    (function () {
        var dataString = JSON.stringify(data);
        //console.log(dataString);
        $.post('submit', {"content": dataString});
    }());
}

// ------------ functions: generic UI helpers -------------

// move to the specified location
function scrollTo(hash) {
    location.hash = "#" + hash;
}

// get the value of a radio button
function getRadioButton(name) {
	var i, radios = document.getElementsByName(name);
	for (i = 0; i < radios.length; i = i + 1) {
	    if (radios[i].checked) {
	        return (radios[i].value);
		}
	}
}

// function to change the display property of a set of objects
function setDisplay(theClass, theValue) {
	var i, classElements = document.getElementsByClassName(theClass);
	for (i = 0; i < classElements.length; i = i + 1) {
		classElements[i].style.display = theValue;
	}
}

// function to change the visibility property of a set of objects
function setVisibility(theClass, theValue) {
	var i, classElements = document.getElementsByClassName(theClass);
	for (i = 0; i < classElements.length; i = i + 1) {
		classElements[i].style.visibility = theValue;
	}
}

// set the focus
function setFocus(theElement) {
	document.getElementById(theElement).focus();
}

// alter the header
function setHeader(theValue) {
	document.getElementById("header").innerText = theValue;
}

// alter the border (on one of the instruction boxes)
function setBoxBorder(whichBox, theValue) {
	document.getElementById('instruction' + whichBox + 'inner').style.border = theValue;
}

// clear all the check marks for the radio buttons 
function clearCheckRadio() {
	var i, radios = document.getElementsByClassName('checkRadio');
	for (i = 0; i < radios.length; i = i + 1) {
		radios[i].checked = false;
	}
}

// ------------- handle the introductory stuff ----------------

function splashButtonClick() {
	setDisplay('start', 'none');
	setDisplay('consent', '');
	setHeader('Consent Form');
}

function consentButtonClick() {
	setDisplay('consent', 'none');
	setDisplay('demographics', '');
	setHeader('Demographics');
}

function demographicsButtonClick() {
	setDisplay('demographics', 'none');
	setHeader('Instructions');
    
    data.other.gender = getRadioButton("gender");
	data.other.age = document.getElementById("age").value;
	data.other.language = document.getElementById("language").value;
	data.other.country = document.getElementById("country").value;

	writeData();
	
    setDisplay('instruction', '');
	setFocus('instructionButton');
	tic = Date.now(); // start timer [see ***]
}

function instructionButtonClick() {
    var i = instruct;
	if (i === (nInstruct - 1)) { // change the text when we first reach last instruction
		document.getElementById("instructionButton").value = "Check your knowledge!";
	}
    
	if (i >= nInstruct) { // if all instructions are revealed, move along
		setDisplay('instruction', 'none');
		setDisplay('check', '');
		setHeader('Check Your Knowledge!');
		toc = Date.now(); // see [***]
        
	} else { // reveal next instruction if needed
        setDisplay('instruction' + i, '');
        scrollTo('instruct' + i);
        setBoxBorder(i - 1, '2px dotted grey');
	}
	instruct = instruct + 1;
}

function checkButtonClick() {
    var val, nCorrect = 0, q;
	setDisplay('check', 'none');
	
    // count the number of correct responses
	for (q = 0; q < nQuestions; q = q + 1) {
		val = getRadioButton("question" + q);
		if (val === "correct") {
            nCorrect = nCorrect + 1;
        }
	}
	
	// store the time taken and the score
	data.other.instructionTime[data.other.instructionFails] = toc - tic;
	data.other.instructionCheckScore[data.other.instructionFails] = nCorrect;
    
    // if everything is correct, move on
    if (nCorrect === nQuestions) {
        setHeader('Correct!');
		setDisplay('checkSuccess', '');
		setFocus('checkSuccessButton');
        
    // otherwise send them back
    } else {
        data.other.instructionFails = data.other.instructionFails + 1;
        clearCheckRadio();
		setHeader('Please Try Again!');
		setDisplay('checkFail', '');
		setFocus('checkFailButton');
    }
}

function checkSuccessButtonClick() {
    setHeader('');
	setDisplay('checkSuccess', 'none');
	setDisplay('splash', '');
}

function checkFailButtonClick() {
	setDisplay('checkFail', 'none');
    setBoxBorder(nInstruct - 1, '2px dotted grey');
	setDisplay('instruction', '');
	setHeader('Instructions');
	setFocus('instructionButton');
	scrollTo('top');
	tic = Date.now();
}


// ------------- functions that handle basic events in the experiment ------------- 

// function to grab the current trial number from the global store
function getCurrentTrialNumber() {
    // "use strict";
    return currentTrial;
}

// function to store the current trial number in the global store
function setCurrentTrialNumber(trial) {
    // "use strict";
    currentTrial = trial;
}

// function to show a stimulus in a slot after a particular time
function showStimulus(task, slot, wait) {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById('task' + task + 'slot' + slot).style.display = "";
        // document.getElementById('slot' + slot).src = './img/' + set + '/stim' + value + '.png';
    }, wait);
}

// function to show a stimulus in a slot after a particular time
function hideStimulus(task, slot, wait) {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById('task' + task + 'slot' + slot).style.display = "none";
        // document.getElementById('slot' + slot).src = './img/' + set + '/stim' + value + '.png';
    }, wait);
}

// function to show a button with a particular label
function setButtonLabel(button, lab, wait) {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById("button" + button).value = lab;
    }, wait);
}

// function to clear the focus
function clearFocus() {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById('dummy').style.display = "";
        document.getElementById('dummy').focus();
        document.getElementById('dummy').style.display = "none";
    }, 0);
}

// function to set a stimulus label to a particular value after some time
function showLabel(lab, slot, wait) {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById('label' + slot).innerHTML = lab;
    }, wait);
}

// function to set the colour of a particular label
function setLabelColour(value, slot, wait) {
    // "use strict";
    window.setTimeout(function () {
        document.getElementById('label' + slot).style.color = value;
    }, wait);
}

// function to clear all labels, button texts and images
function clearAll() {
    // "use strict";
    var i;
    for (i = 0; i <= lastSlot; i = i + 1) {
       // showStimulus(0, 1, i, 0); // blank stimulus
        hideStimulus(currentTask, i, 0);
        showLabel("", i, 0); // no label
        setLabelColour("black", i, 0); // set label to black
    }
    for (i = 0; i <= lastButton; i = i + 1) {
        setButtonLabel(i, "xxx", 0); // set button label to dummy
    }
}


// function to present a stimulus to the participant
function presentStimulus(trial) {
    // "use strict";
    var event, value;
    
    // figure out which stimulus to present
    event = currentTrialOrder[trial]; // which of the nTokens + 1 trials is this?
    if (event < currentNTokens) { // if it's a training trial, grab the value
        value = trainingValues[currentTrainingSet][event];
    } else {
        value = testValues[currentTestSet];
    }
    
    // display it immediately
    showStimulus(currentTask, trial, 0);
    
    // set the label to ??? immediately
    showLabel("???", trial, 0);
    setLabelColour("blue", trial, 0);
    
    // start timer
    tic = Date.now();
    
}

// function to show the correct label to the participant
function presentFeedback(trial) {
    // "use strict";
    var event, lab;

    event = currentTrialOrder[trial]; // which of the nTokens + 1 trials is this?
    lab = currentLabelSet[trainingCategories[currentTrainingSet][event]]; // label
    
    // display it immediately
    showLabel(lab, trial, 0);
    setLabelColour("blue", trial, 0);
    
    // hide the response buttons during feedback
    document.getElementById("responsebuttons").style.display = "none";
    
}

// function to update the button set to match the current state. This function should
// only ever get called after a participant response, so currentTrial must be at least
// 1
function updateButtonSet(trial) {
    // "use strict";
    window.setTimeout(function () {
        var labelsUsed, i, button = 0, cat, event;
        
        labelsUsed = [false, false, false, false, false, false]; // there are at most 4 labels
        responseMap = [0, 0, 0, 0, 0, 0, 0]; // there are at most 7 buttons
        
        for (i = 0; i <= trial; i = i + 1) {
            event = currentTrialOrder[i]; // event index
            cat = trainingCategories[currentTrainingSet][event]; // category index
            if (labelsUsed[cat] === false) {
                labelsUsed[cat] = true;
                //console.log(labelsUsed);
                document.getElementById("button" + button).value = currentLabelSet[cat];
                document.getElementById("button" + button).style.display = "";
                document.getElementById("button" + button).style.visibility = "visible";
                responseMap[button] = cat + 1;
                button = button + 1;
            }
            setLabelColour("black", i, 0);
        }
        document.getElementById("button" + button).value = "New";
        document.getElementById("button" + button).style.display = "";
        document.getElementById("button" + button).style.visibility = "visible";
        setLabelColour("black", button, 0);
        
        // reveal response buttons ONLY if there's a response required!

//            document.getElementById("responsebuttons").style.display = "";
        
    }, 0);
}

// function to hide all the buttons from participants
function hideAllButtons() {
    // "use strict";
    var i;
    for (i = 0; i <= lastButton; i = i + 1) {
        document.getElementById("button" + i).style.visibility = "hidden";
    }
}


// ------------- functions to control the experiment sequence itself ------------- 


// variables needed to know where we're up to
function initialiseCondition() {
    // "use strict";
    currentStimulusSet = stimulusOrder[currentTask - 1]; // which stimuli?
    currentTrainingSet = (conditionOrder[currentTask - 1] - 1) % (nCond / 2); // index into training
    currentTestSet = Math.floor((conditionOrder[currentTask - 1] - 1) / (nCond / 2)); // index into test
    currentLabelSet = labels.splice(0, nTypes[currentTrainingSet]); // grab labels (and truncate)
    currentNTypes = nTypes[currentTrainingSet]; // count the number of types
    currentNTokens = nTokens[currentTrainingSet]; // count the number of tokens
    currentTrialOrder = trialOrder[conditionOrder[currentTask - 1] - 1]; // trial order
}

function isIn(x, Y) {
    // "use strict";
    var i, z, l = Y.length;
    for (i = 0; i < l; i = i + 1) {
        if (x === Y[i]) {
            return true;
        }
    }
    return false;
}

function updateData(button, trial) {
    // "use strict";
    var exptEvent;
    exptEvent = data.experiment.event.length;
    data.experiment.event[exptEvent] = exptEvent + 1;
    data.experiment.task[exptEvent] = currentTask;
    data.experiment.trial[exptEvent] = trial;
    data.experiment.train[exptEvent] = trainingNames[currentTrainingSet];
    data.experiment.test[exptEvent] = testNames[currentTestSet];
    data.experiment.stimuli[exptEvent] = stimulusNames[currentStimulusSet - 1];
    data.experiment.isTestItem[exptEvent] = trial === currentNTokens;
    data.experiment.labels[exptEvent] = currentLabelSet.join(":");
    data.experiment.version[exptEvent] = experimentVersion;
        
    if (button === -1) {
        data.experiment.response[exptEvent] = -1;
        data.experiment.RT[exptEvent] = -1;
    } else {
        data.experiment.response[exptEvent] = responseMap[button];
        data.experiment.RT[exptEvent] = toc - tic;
    }
    
    if (data.experiment.isTestItem[exptEvent] === true) {
        data.experiment.trueCat[exptEvent] = 0;
        data.experiment.value[exptEvent] = testValues[currentTestSet];
    } else {
        data.experiment.trueCat[exptEvent] = trainingCategories[currentTrainingSet][currentTrialOrder[trial]] + 1;
        data.experiment.value[exptEvent] = trainingValues[currentTrainingSet][currentTrialOrder[trial]];
    }
    
    if (data.experiment.isTestItem[exptEvent] === true || data.experiment.trial[exptEvent] === 0) {
        data.experiment.bestChoice[exptEvent] = -1;
        data.experiment.correct[exptEvent] = -1;
    } else {
        if (isIn(data.experiment.trueCat[exptEvent], responseMap)) {
            data.experiment.bestChoice[exptEvent] = data.experiment.trueCat[exptEvent];
        } else {
            data.experiment.bestChoice[exptEvent] = 0;
        }
        data.experiment.correct[exptEvent] = data.experiment.response[exptEvent] === data.experiment.bestChoice[exptEvent];
    }
    
}

                      
// function to start the next condition
function startCondition() {
    // "use strict";
    
    var t;
    
    initialiseCondition();
    document.getElementById('expt').style.display = "";
    document.getElementById('splash').style.display = "none";
    document.getElementById('countertext').innerHTML = "Question " + currentTask + " of 36";
    
    // "run" the first trial from here 
    clearAll();

    
    function eventDisplay(tr) {
        setTimeout(function () {
            presentStimulus(tr);
            presentFeedback(tr);
            updateButtonSet(tr);
            updateData(-1, tr);
        }, tr * ISI);
    }
    
    for (t = 0; t < currentNTokens; t = t + 1) {
        //console.log(t);
        eventDisplay(t);
    }
    
    // now present the test stimulus
    setTimeout(function () {
        presentStimulus(currentNTokens);
        setCurrentTrialNumber(currentNTokens);
    }, currentNTokens * ISI);
    
    // reveal the response buttons slightly slower
    setTimeout(function () {
        document.getElementById("responsebuttons").style.display = "";
    }, (currentNTokens * ISI) + 500);

}

// function to end the current condition
function endCondition() {
    // "use strict";
    var i;
    document.getElementById('task' + currentTask + 'slots').style.display = "none"; // hide last slots
    currentTask = currentTask + 1;
    document.getElementById('expt').style.display = "none";
    document.getElementById("responsebuttons").style.display = "none";
    for (i = 0; i <= lastButton; i = i + 1) {
        showLabel("", i, 0);
    }
    if (currentTask <= nCond) {
        setTimeout(function () {
            startCondition();
        }, 1000);
        //document.getElementById('conditionButton').value = "Start Task " + currentTask + " of 12";
        //document.getElementById('splash').style.display = "";
        document.getElementById('task' + currentTask + 'slots').style.display = ""; // reveal next slots
    } else {
        window.onbeforeunload = function () {};
        data.other.stopTime = Date.now();
	    writeData();
        document.getElementById('end').style.display = "";
	    setHeader("Finished!");
        setDisplay("header", "");
    }
}


// function to respond to the participant button press
function buttonPress(button) {
    // "use strict";
    
    var trial = getCurrentTrialNumber();
    toc = Date.now();
    updateData(button, trial);
    
    // if there are still trials left, present feedback and move on:
    if (trial < currentNTokens) {
        
        // feedback immediately
        window.setTimeout(function () {
            hideAllButtons();
            clearFocus();
            presentFeedback(trial);
        }, 0);
        
        // wait 1 second before moving to the next stimulus
        window.setTimeout(function () {
            updateButtonSet(trial);
            presentStimulus(trial + 1);
            setCurrentTrialNumber(trial + 1);
        }, 1000);
        
    // if there are no trials to come, end the condition:
    } else {
        
        // end condition immediately
        window.setTimeout(function () {
            hideAllButtons();
            clearFocus();
            endCondition();
        }, 0);
    }
}



// load all the images as soon as the event loop is available
// (i.e., as soon as the initial execution stack is complete
window.setTimeout(function () {
    // "use strict";
    var c, s, set, cond, values, tr, te, i, str, val;
    
    for (c = 1; c <= nCond; c = c + 1) {
        set = stimulusOrder[c - 1]; // which stimulus set?
        cond = conditionOrder[c - 1]; // which condition?
        tr = (cond - 1) % (nCond / 2); // index into training
        te = Math.floor((cond - 1) / (nCond / 2)); // index into test
        values = trainingValues[tr]; // stimuli 
        for (s = 0; s < values.length; s = s + 1) { // load images...
            i = trialOrder[cond - 1][s];
            val = values[i];
			if (val > 0) {
				str = './img/set' + set + 'stim' + val + '.png';
			} else {
				str = "./img/stimX.png";
			}
            document.getElementById('task' + c + 'slot' + s).src = str;
        }
        str = './img/set' + set + 'stim' + testValues[te] + '.png';
        document.getElementById('task' + c + 'slot' + values.length).src = str;
    }
    
}, 0);


window.onbeforeunload = function (e) {
	
    var message;
    e = e || window.event;
    message = "You are about to leave this page, but have not yet finished the experiment or received the completion code for the HIT";

    data.other.unloadAttempts = data.other.unloadAttempts + 1;
    
    // For IE and Firefox
    if (e) {
        e.returnValue = message;
    }

    // For Safari
    return message;
};


// -------------------- handy things for the experimenter --------------

// function to skip the boring bits
function skip() {
    setDisplay("header", "none");
    setDisplay("start", "none");
    setDisplay("demographics", "none");
    setDisplay("instruction", "none");
    setDisplay("check", "none");
    setDisplay("checkSuccess", "none");
    setDisplay("checkFail", "none");
    setDisplay('splash', '');
}

// function to download JSON from the console
function download(filename, savedata) {
    // "use strict";
    if (arguments.length < 2) {
        savedata = data;
    }
    if (arguments.length < 1) {
        filename = "data.txt";
    }
    var pom = document.createElement('a'), text = JSON.stringify(savedata);
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

// function to download CSV for the important bits from the console
function getCSV(filename) {
    if (arguments.length < 1) {
        filename = "data.csv";
    }
    
    var pom = document.createElement('a'), text = [], i, savedata = data.experiment;
    text = '"event", "task", "trial", "train", "test", "stimuli", "labels", "isTestItem", "value", "trueCat", "bestChoice", "response", "RT", "correct", "version"\n';
    for (i = 0; i < savedata.event.length; i = i + 1) {
        text = text + '"' + savedata.event[i].toString() + '", ';
        text = text + '"' + savedata.task[i].toString() + '", ';
        text = text + '"' + savedata.trial[i].toString() + '", ';
        text = text + '"' + savedata.train[i].toString() + '", ';
        text = text + '"' + savedata.test[i].toString() + '", ';
        text = text + '"' + savedata.stimuli[i].toString() + '", ';
        text = text + '"' + savedata.labels[i].toString() + '", ';
        text = text + '"' + savedata.isTestItem[i].toString() + '", ';
        text = text + '"' + savedata.value[i].toString() + '", ';
        text = text + '"' + savedata.trueCat[i].toString() + '", ';
        text = text + '"' + savedata.bestChoice[i].toString() + '", ';
        text = text + '"' + savedata.response[i].toString() + '", ';
        text = text + '"' + savedata.RT[i].toString() + '", ';
        text = text + '"' + savedata.correct[i].toString() + '", ';
        text = text + '"' + savedata.version[i].toString() + '"\n';
    }
    
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

//skip();