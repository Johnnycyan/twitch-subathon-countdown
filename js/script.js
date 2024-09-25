const timeText = document.getElementById("timeText");

var initialHours;
var initialMinutes;
var initialSeconds;
var paused = false;
var happy_hour_active = false;
var random_hour_active = false;
let countdownEnded = false;
let countdownUpdater = null;
let initialStartTime;
let totalElapsedTime = 0;
let initialTotalTime = 0;
var maxHours, maxMinutes, maxSeconds;
let remainingTimeOnPause = 0;

var initialHoursLocal = window.localStorage.getItem('initialHours')
if (initialHoursLocal !== null) {
	initialHours  = initialHoursLocal;
	logMessage("Core", "Found initialHours in localStorage.")
} else {
	initialHours = initialHoursConfig;
}
var initialMinutesLocal = window.localStorage.getItem('initialMinutes')
if (initialMinutesLocal !== null) {
	initialMinutes = initialMinutesLocal;
	logMessage("Core", "Found initialMinutes in localStorage.")
} else {
	initialMinutes = initialMinutesConfig;
}
var initialSecondsLocal = window.localStorage.getItem('initialSeconds')
if (initialSecondsLocal !== null) {
	initialSeconds  = initialSecondsLocal;
	logMessage("Core", "Found initialSeconds in localStorage.")
} else {
	initialSeconds = initialSecondsConfig;
}
var initialTotalTimeLocal = window.localStorage.getItem('initialTotalTime');
if (initialTotalTimeLocal !== null) {
    initialTotalTime = parseFloat(initialTotalTimeLocal);
    logMessage("Core", "Found initialTotalTime in localStorage.");
} else {
    initialTotalTime = 0;
}
// Load max duration configuration
var maxHoursLocal = window.localStorage.getItem('maxHours');
if (maxHoursLocal !== null) {
    maxHours = parseInt(maxHoursLocal);
    logMessage("Core", "Found maxHours in localStorage.");
} else {
    maxHours = maxHoursConfig;
}

var maxMinutesLocal = window.localStorage.getItem('maxMinutes');
if (maxMinutesLocal !== null) {
    maxMinutes = parseInt(maxMinutesLocal);
    logMessage("Core", "Found maxMinutes in localStorage.");
} else {
    maxMinutes = maxMinutesConfig;
}

var maxSecondsLocal = window.localStorage.getItem('maxSeconds');
if (maxSecondsLocal !== null) {
    maxSeconds = parseInt(maxSecondsLocal);
    logMessage("Core", "Found maxSeconds in localStorage.");
} else {
    maxSeconds = maxSecondsConfig;
}

resetBtn.addEventListener("click", function(){
    if (happy_hour_active) specialHourHandler('Happy');
    if (random_hour_active) specialHourHandler('Random');
    countdownEnded = false;
    
    initialHours = initialHoursConfig;
    initialMinutes = initialMinutesConfig;
    initialSeconds = initialSecondsConfig;
    
    totalElapsedTime = 0;
    initialTotalTime = 0;
    remainingTimeOnPause = 0;
    
    // Clear localStorage
    window.localStorage.removeItem('initialHours');
    window.localStorage.removeItem('initialMinutes');
    window.localStorage.removeItem('initialSeconds');
    window.localStorage.removeItem('initialTotalTime');
    window.localStorage.removeItem('remainingTime');
    window.localStorage.removeItem('initialStartTime');
    window.localStorage.removeItem('lastSaveTime');

    maxHours = maxHoursConfig;
    maxMinutes = maxMinutesConfig;
    maxSeconds = maxSecondsConfig;
    
    window.localStorage.removeItem('maxHours');
    window.localStorage.removeItem('maxMinutes');
    window.localStorage.removeItem('maxSeconds');

    // Clear the interval if it's running
    if (countdownUpdater) {
        clearInterval(countdownUpdater);
        countdownUpdater = null;
    }

    // Reset the paused state
    paused = false;

    // Update the display immediately
    updateDisplayAfterReset();

    logMessage("Core", "Timer Reset.");
});

function updateDisplayAfterReset() {
    let totalSeconds = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    let time = `${timeFunc.getHours(totalSeconds * 1000)}:${timeFunc.getMinutes(totalSeconds * 1000)}:${timeFunc.getSeconds(totalSeconds * 1000)}`;
    timeText.innerText = time;
}

startBtn.addEventListener("click", function(){
    let currentTime = new Date();

    if (paused) {
        endingTime = new Date(currentTime.getTime() + remainingTimeOnPause);
        paused = false;
        logMessage("Core", `Timer Resumed with ${remainingTimeOnPause / 1000} seconds remaining`);
    } else {
        // Calculate initial time in seconds
        let initialTimeInSeconds = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
        
        // Calculate max duration
        let maxDuration = calculateMaxDuration();
        
        // If maxDuration is set, limit the initial time
        if (maxDuration !== null) {
            initialTimeInSeconds = Math.min(initialTimeInSeconds, maxDuration);
        }
        
        initialStartTime = currentTime;
        endingTime = new Date(currentTime.getTime() + initialTimeInSeconds * 1000);
        
        logMessage("Core", `Timer Started with ${initialTimeInSeconds} seconds`);
    }

    document.getElementById("startPage").style.visibility = "hidden";
    document.getElementById("container").style.visibility = "visible";
    
    if (countdownUpdater) {
        clearInterval(countdownUpdater);
    }
    
    countdownUpdater = setInterval(() => {
        getNextTime();
    }, 1); 
});

Mousetrap.bind(pauseShort, function(e) {
    if (!paused) {
        paused = true;
        remainingTimeOnPause = Math.max(0, endingTime - Date.now());
        logMessage("Core", `Timer was paused with ${remainingTimeOnPause / 1000} seconds remaining`);
        document.getElementById("startPage").style.visibility = "visible";
        clearInterval(countdownUpdater);
        updateDisplayWhilePaused();
    }
});

Mousetrap.bind(happyHourShort, async function(e){
	specialHourHandler('Happy');
});

Mousetrap.bind(randomHourShort, async function(e){
	specialHourHandler('Random');
});

Mousetrap.bind(addHourShort, function(e) {
    adjustTimeManually(3600); // 3600 seconds = 1 hour
    return false; // Prevent default action
});

Mousetrap.bind(addMinuteShort, function(e) {
    adjustTimeManually(60); // 60 seconds = 1 minute
    return false; // Prevent default action
});

Mousetrap.bind(addSecondShort, function(e) {
    adjustTimeManually(1); // 1 second
    return false; // Prevent default action
});

Mousetrap.bind(subHourShort, function(e) {
    adjustTimeManually(-3600); // 3600 seconds = 1 hour
    return false; // Prevent default action
});

Mousetrap.bind(subMinuteShort, function(e) {
    adjustTimeManually(-60); // 60 seconds = 1 minute
    return false; // Prevent default action
});

Mousetrap.bind(subSecondShort, function(e) {
    adjustTimeManually(-1); // 1 second
    return false; // Prevent default action
});

function adjustTimeManually(seconds) {
    if (countdownEnded && seconds > 0) {
        logMessage("Core", "Cannot add time after the timer has ended");
        return;
    }

    if (paused && !allowTimeAddWhilePaused) {
        logMessage("Core", "Cannot adjust time while paused");
        return;
    }

    let currentTime = new Date();
    let newEndingTime;

    if (paused) {
        remainingTimeOnPause = Math.max(0, remainingTimeOnPause + seconds * 1000);
        updateDisplayWhilePaused();
        logMessage("Core", `Adjusted ${Math.abs(seconds)} seconds while paused`);
    } else {
        newEndingTime = new Date(endingTime.getTime() + seconds * 1000);
        
        // Ensure the new ending time is not in the past
        if (newEndingTime > currentTime) {
            endingTime = newEndingTime;
        } else {
            endingTime = new Date(currentTime.getTime() + 1000); // Set to 1 second from now
        }
        
        // Update the display immediately
        getNextTime();
        
        logMessage("Core", `Adjusted ${Math.abs(seconds)} seconds while running`);
    }

    let action = seconds > 0 ? "Added" : "Subtracted";
    logMessage("Core", `Manually ${action} ${Math.abs(seconds)} seconds ${paused ? "while paused" : "to the timer"}`);

    // If timer was ended and we subtracted time, restart the countdown
    if (countdownEnded && seconds < 0) {
        countdownEnded = false;
        countdownUpdater = setInterval(() => {
            getNextTime();
        }, 1);
    }
}

async function specialHourHandler(type){
	if ((type === 'Happy' && happy_hour) || (type === 'Random' && random_hour)){
		specialHourFunc(type)
	}
	else {
		logMessage("Core", `${type} Hour is not available`)
		document.getElementById("SpecialHourText").innerHTML = `${type} Hour error`;
		document.getElementById("SpecialHourText").animate({opacity: [ 0, 1 ], easing: [ 'ease-in', 'ease-out' ],}, 500);
		document.getElementById("SpecialHourText").style.opacity = "1";
		document.getElementById("SpecialHourHTML").animate({top: [ "-200px", "-250px" ], easing: [ 'ease-in', 'ease-out' ],}, 500);
		document.getElementById("SpecialHourHTML").style.top = "-250px";
		await sleep(5000)
		document.getElementById("SpecialHourText").animate({opacity: [ 1, 0 ], easing: [ 'ease-in', 'ease-out' ],}, 500);
		document.getElementById("SpecialHourText").style.opacity = "0";
	}
}

function calculateMaxDuration() {
    if (maxHours === null && maxMinutes === null && maxSeconds === null) {
        return null;  // Uncapped
    }
    return (maxHours || 0) * 3600 + (maxMinutes || 0) * 60 + (maxSeconds || 0);
}

function updateDisplayWhilePaused() {
    let differenceTime = Math.max(0, remainingTimeOnPause);
    time = `${timeFunc.getHours(differenceTime)}:${timeFunc.getMinutes(differenceTime)}:${timeFunc.getSeconds(differenceTime)}`;
    timeText.innerText = time;
}

async function specialHourFunc(type) {
    let activate = ((type === 'Happy' && !happy_hour_active) || (type === 'Random' && !random_hour_active));
    let toggleText = activate ? 'Activated' : 'Deactivated';

    logMessage("Core", `${type} Hour ${toggleText}`);

    if (type === 'Happy') happy_hour_active = activate;
    if (type === 'Random') random_hour_active = activate;

    let animation = (happy_hour_active || random_hour_active) 
        ? 'moving-gradient 3s linear infinite'
        : 'none';

    document.getElementById("SpecialHourText").innerHTML = `${type} Hour ${toggleText}!`;
    document.getElementById("SpecialHourText").animate({opacity: [0, 1]}, {duration: 500, easing: 'ease-in-out'});
    document.getElementById("SpecialHourText").style.opacity = "1";

    document.getElementById("SpecialHourHTML").animate({top: ["-200px", "-250px"]}, {duration: 500, easing: 'ease-in-out'});
    document.getElementById("SpecialHourHTML").style.top = "-250px";

    const container = document.getElementById("container");
    container.classList.toggle('happyHour', activate);
    container.style.animation = animation;

    await sleep(activate ? 5000 : 10000);

    document.getElementById("SpecialHourText").animate({opacity: [1, 0]}, {duration: 500, easing: 'ease-in-out'});
    document.getElementById("SpecialHourText").style.opacity = "0";
}

let users = [];
let time;

let endingTime = new Date(Date.now());
endingTime = timeFunc.addHours(endingTime, initialHours);
endingTime = timeFunc.addMinutes(endingTime, initialMinutes);
endingTime = timeFunc.addSeconds(endingTime, initialSeconds);

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

var randomHappyBool = false
var scheduleHappyBool = false

const getNextTime = () => {
    let currentTime = new Date(Date.now());
    let differenceTime = endingTime - currentTime;

    // Check if maxTimerDuration is set and if it's been exceeded
    let maxDuration = calculateMaxDuration();
    if (maxDuration !== null) {
        let totalElapsedTime = (currentTime - initialStartTime) / 1000; // in seconds
        let maxRemainingTime = Math.max(0, maxDuration - totalElapsedTime) * 1000; // in milliseconds
        differenceTime = Math.min(differenceTime, maxRemainingTime);
        endingTime = new Date(currentTime.getTime() + differenceTime);
    }

    // Handle sync time and timer end
    if (differenceTime <= 0) {
        if (!countdownEnded && Math.abs(differenceTime) >= syncTime * 1000) {
            clearInterval(countdownUpdater);
            countdownEnded = true;
            logMessage("Core", "Timer Ended");
        }
        differenceTime = 0;
        time = "00:00:00";
    } else {
        time = `${timeFunc.getHours(differenceTime)}:${timeFunc.getMinutes(differenceTime)}:${timeFunc.getSeconds(differenceTime)}`;
    }

    if (!paused) {
        window.localStorage.setItem('initialHours', timeFunc.getHours(differenceTime));
        window.localStorage.setItem('initialMinutes', timeFunc.getMinutes(differenceTime));
        window.localStorage.setItem('initialSeconds', timeFunc.getSeconds(differenceTime));
        window.localStorage.setItem('initialTotalTime', totalElapsedTime.toString());
        window.localStorage.setItem('remainingTime', differenceTime.toString());
        window.localStorage.setItem('initialStartTime', initialStartTime.getTime().toString());
        window.localStorage.setItem('lastSaveTime', currentTime.getTime().toString());

        if (randHappy && happy_hour && !randomHappyBool) {
            randomHappyBool = true;
            setTimeout(randomHappy, 1000);
        }
        if (scheduleHappy && happy_hour && !scheduleHappyBool) {
            scheduleHappyBool = true;
            scheduleHappyFunc();
        }
    }
    timeText.innerText = time;
};

function randomHappy(){
	if (!happy_hour_active){
		if ((getRandomInt(0,10000) == 127)){
			logMessage("RandomHappy","It's not rigged!")
			specialHourFunc()
			setTimeout(specialHourFunc, 3600000)
		}
	setTimeout(randomHappy,1000)
	}
}

function scheduleHappyFunc(){
	let now = new Date()
	if (now.getDay() == scheduleHappyDay){
		if (now.getUTCHours() == scheduleHappyHour){
			if (now.getUTCMinutes() == 0){
				logMessage("Schedule","It's time!")
				specialHourFunc()
				setTimeout(specialHourFunc, 3600000)
				setTimeout(scheduleHappyFunc, 36000000)
			}
		}
	}
}

var firstSub = true;
var endingTimeBeforeCounter;
var addedTimeCounter;
var timeoutID;

const addTime = async (time, s) => {
    let addedTime = Math.floor(s);
    if (!bulk_enabled) {
        if (paused && !allowTimeAddWhilePaused) {
            logMessage("Core", "Cannot add time while paused");
            return;
        }
        endingTimeBeforeCounter = time;
        addedTimeCounter = addedTime;
        addTimeInternal();
        return;
    }
    if (firstSub) {
        firstSub = false;
        endingTimeBeforeCounter = time;
        addedTimeCounter = addedTime;
    } else {
        addedTimeCounter += addedTime;
        window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(addTimeInternal, 1000);
};

const addTimeInternal = async () => {
    let time = endingTimeBeforeCounter;
    let s = addedTimeCounter;
    addedTimeCounter = 0;
    firstSub = true;
    
    let addedTime = document.createElement("p");
    
    happy_hour_active ? addedTime.classList = "gold" : addedTime.classList = "addedTime";
    
    addedTime.innerText = `+${s}s`;
    document.body.appendChild(addedTime);
    addedTime.style.display = "block";
    await sleep(50);
    addedTime.style.left = `${randomInRange(35, 65)}%`;
    addedTime.style.top = `${randomInRange(15, 40)}%`;
    addedTime.style.opacity = "1";

    let currentTime = new Date();
    let remainingTime = endingTime - currentTime;
    
    let maxDuration = calculateMaxDuration();
    if (maxDuration !== null) {
        let currentElapsedTime = (currentTime - initialStartTime) / 1000;
        let maxRemainingTime = Math.max(0, maxDuration - currentElapsedTime); // in seconds
        s = Math.min(s, maxRemainingTime);
    }

    if (paused) {
        if (allowTimeAddWhilePaused) {
            remainingTimeOnPause += s * 1000;
            logMessage("Core", `Added ${s} seconds while paused`);
            updateDisplayWhilePaused();
        } else {
            logMessage("Core", "Cannot add time while paused");
        }
    } else {
        while (s > 0) {
            let timeStep = s > 60 ? s / 30 : 2; // Adjust animation speed
            endingTime = timeFunc.addSeconds(endingTime, timeStep);
            await sleep(50);
            s -= timeStep;
        }
    }

    await sleep(200);
    addedTime.style.opacity = "0";
    await sleep(200);
    addedTime.remove();
}

const testAddTime = (times, delay, s) => {
	let addTimeInterval = setInterval(async () => {
		if (times > 0) {
			await sleep(randomInRange(50, delay-50));
			addTime(endingTime, s);
			--times;
		}
		else {
			clearInterval(addTimeInterval);
		}
	}, delay);
};
