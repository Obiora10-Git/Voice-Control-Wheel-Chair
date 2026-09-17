

const infoMessageBox = document.querySelector('.info_message_box')
const infoMessage = document.getElementById('info_message')


const currentTheme = localStorage.getItem('theme');

 const splash = document.getElementById('splash_screen');
const appContent = document.getElementById('app_content');

//Gotten from the Internet(A.I)
// Function triggered by a button click on your website
async function connectBluetooth() {
  try {
    // Request a Bluetooth device matching specific filters
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true // Or filter by services/name
    });

    // Connect to the device's server
    const server = await device.gatt.connect();
    console.log('Connected to: ' + device.name);
  } catch (error) {
    console.log('User cancelled or connection failed: ' + error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash_screen');
  const appContent = document.getElementById('app_content');

  // If the splash has already been shown this session, bypass everything immediately
  if (sessionStorage.getItem('splashShown') === 'true') {
    if (splash) splash.remove(); // Safely clear splash
    appContent.classList.remove('hidden');
    appContent.style.display = 'block';
    document.body.style.overflow = 'auto';
    return; // 🛑 STOP HERE: Do not set timeouts if already shown
  }

  // FIRST TIME USERS ONLY: Run the timer animations
  setTimeout(() => {
    appContent.classList.remove('hidden');
    appContent.style.display = 'block';
    
    if (splash) {
      splash.classList.add('fade-out');
      
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        splash.remove(); 
        // Save to session memory only AFTER the full splash cycle ends
        sessionStorage.setItem('splashShown', 'true');
      }, 600); 
    }
  }, 1500); 
});





// 1. Check for saved theme preference on page load
if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
} else {
  document.body.classList.remove('dark-mode');
}


// 2. Add click event listener to the single button
function bgSwitch() {
  // Toggle the dark mode class on the body
  document.body.classList.toggle('dark-mode');
  
  // 3. Save the current choice permanently in localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
};

function checkInfo(){
  infoMessageBox.classList.toggle('active_info');
  infoMessage.classList.toggle('active_info');
  
}

const micOn = document.getElementById('mic_on');
const micOff = document.getElementById('mic_off');


    const speechErrorMessageText = document.getElementById('error_message');
const voiceErrorMessageText = document.getElementById('voice_message');
const statusText = document.getElementById('status_message');
const outputText = document.getElementById('hidden_commands');




const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 

if (!SpeechRecognition) { 
    speechErrorMessageText.textContent = "Speech recognition not supported in this browser."; 
} else { 
    const recognition = new SpeechRecognition(); 
    recognition.lang = 'en-US'; 
    recognition.continuous = false; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1; 

    // Target phrases to recognize 
    const targetPhrases = ["open settings", "background"]; 

    function getSimilarity(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // <--- FIXED: Now correctly applies 0 for a match
      );
    }
  }
  const distance = track[str2.length][str1.length];
  const longestLength = Math.max(str1.length, str2.length);
  return longestLength === 0 ? 1 : (longestLength - distance) / longestLength;
}

    let isListening = false;

    micOn.addEventListener('click', () => {

    if (isListening) {
        return;
    }

    try {
        isListening = true;

        document.body.classList.add('active-speech');
        recognition.start();

        statusText.textContent = "Status: Listening...";

    } catch (e) {
        isListening = false;
        recognition.abort();
    
    }
});

    micOff.addEventListener('click', () => {

    if (!isListening) {
        return;
    }

    try {
        recognition.stop();

    } catch (e) {
        recognition.abort();
    }

    isListening = false;

    document.body.classList.remove('active-speech');
    statusText.textContent = "Status: Not Listening...";
});

    let isProcessingCommand = false;
    let lastCommand = "";
    let lastCommandTime = 0;

    // Capture the speech result
recognition.onresult = (event) => {

    // Prevent duplicate processing
    if (isProcessingCommand) {
        return;
    }

    const currentResultIndex = event.resultIndex;

    const transcript =
        event.results[currentResultIndex][0].transcript
        .toLowerCase()
        .trim();

    // Prevent the exact same command from being processed twice
    const now = Date.now();

    if (
        transcript === lastCommand &&
        now - lastCommandTime < 2000
    ) {
        return;
    }

    lastCommand = transcript;
    lastCommandTime = now;

    outputText.textContent = `You said: "${transcript}"`;

    const spokenWords = transcript.split(/\s+/);

    let bestMatchPhrase = null;
    let highestScore = 0;

    const CONFIDENCE_THRESHOLD = 0.80;

    targetPhrases.forEach(targetPhrase => {

        const targetWordsCount =
            targetPhrase.split(/\s+/).length;

        if (spokenWords.length < targetWordsCount) {

            const score =
                getSimilarity(transcript, targetPhrase);

            if (score > highestScore) {
                highestScore = score;
                bestMatchPhrase = targetPhrase;
            }

        } else {

            for (
                let i = 0;
                i <= spokenWords.length - targetWordsCount;
                i++
            ) {

                const segmentToCheck =
                    spokenWords
                        .slice(i, i + targetWordsCount)
                        .join(' ');

                const score =
                    getSimilarity(segmentToCheck, targetPhrase);

                if (score > highestScore) {
                    highestScore = score;
                    bestMatchPhrase = targetPhrase;
                }
            }
        }
    });

    if (highestScore >= CONFIDENCE_THRESHOLD) {

        // Lock command processing
        isProcessingCommand = true;

        statusText.textContent =
            `Success! Action triggered for: "${bestMatchPhrase}"`;

        triggerPhraseAction(bestMatchPhrase);


    } else {

        statusText.textContent =
            `Status: Command not recognized (Best match: ${Math.round(highestScore * 100)}%)`;
    }
};


    recognition.onend = () => {

    isListening = false;
    isProcessingCommand = false;

    document.body.classList.remove('active-speech');

    if (statusText.textContent === "Status: Listening...") {
        statusText.textContent = "Status: Stopped listening.";
    }
};

    recognition.onerror = (event) => { 
        statusText.textContent = `Error occurred: ${event.error}`; 
        voiceErrorMessageText.textContent = `Error occurred: ${event.error}`; 
    }; 

    function triggerPhraseAction(phrase) { 
        statusText.textContent = `Success! Action triggered for: "${phrase}"`; 
        switch (phrase) { 
            case "open settings": 
                console.log("Opening settings modal..."); 
                outputText.textContent = "Open Settings";
                connectBluetooth() 
                break; 
            case "background": 
                bgSwitch()
                outputText.textContent = "Dark Theme"; 
                break; 
            default:
                console.log("No action assigned to this phrase.");
                break; 
        } 
    } 

    // FIX #2: Moved inside the else wrapper so it has access to `recognition` and `targetPhrases`
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList; 
    if (SpeechGrammarList) { 
        const speechRecognitionList = new SpeechGrammarList(); 
        const grammar = '#JSGF V1.0; grammar phrases; public <phrase> = ' + targetPhrases.join(' | ') + ' ;'; 
        speechRecognitionList.addFromString(grammar, 1); 
        recognition.grammars = speechRecognitionList; 
    } 
} // Closing else block


