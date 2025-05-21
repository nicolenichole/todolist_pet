document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const petImg = document.getElementById('petImage');
    const btnComplete = document.getElementById('completeTask');
    const btnRestart = document.getElementById('restart');
  
    // Utility to update UI based on state
    function updateUI(state) {
        petImg.src = chrome.runtime.getURL(`assets/${state}_fish.png`);
    
        // Remove any existing animation class
        petImg.classList.remove('happy-animation');
        btnComplete.style.display = 'none';
        btnRestart.style.display  = 'none';
        
        if (state === 'happy') {
            statusDiv.textContent = "🎉 Your pet is happy!";
            statusDiv.style.backgroundColor = "#e8f5e9";
            statusDiv.style.color = "#2e7d32";
            btnComplete.disabled = false;

            btnComplete.style.display = 'block';
            btnComplete.disabled = false;
            
            // Add bounce animation for happy pet
            petImg.classList.add('happy-animation');
        } else if (state === 'sad') {
            statusDiv.textContent = "😿 Your pet needs your help!";
            statusDiv.style.backgroundColor = "#fff3e0";
            statusDiv.style.color = "#e65100";

            btnComplete.style.display = 'block';
            btnComplete.disabled = false;
        } else if (state === 'dead') {
            statusDiv.textContent = "💀 Your pet passed away...";
            statusDiv.style.backgroundColor = "#ffebee";
            statusDiv.style.color = "#c62828";

            // hide complete, show restart
            btnRestart.style.display = 'block';
        }
    }
  
    // 1) Load initial state
    chrome.storage.local.get(
        { taskCompleted: false, petState: 'sad' },
        data => {
            // if taskCompleted was true at load‑time, show happy, otherwise use petState
            const initial = data.taskCompleted ? 'happy' : data.petState;
            updateUI(initial);
        }
    );
  
    // 2) When the user clicks "I completed my task!"
    btnComplete.addEventListener('click', () => {
        // quick click effect
        btnComplete.style.transform = 'scale(0.95)';
        setTimeout(() => btnComplete.style.transform = '', 150);
    
        chrome.storage.local.set(
            { taskCompleted: true, petState: 'happy' },
            () => updateUI('happy')
        );
    });

    // 3) Restart button → tell background to reset alarm & state
    btnRestart.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'restart' }, response => {
            if (response && response.restarted) {
                updateUI('sad');
            }
        });
    });
    // 4) Settings button → open options page
    const btnOptions = document.getElementById('openOptions');
    btnOptions.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});