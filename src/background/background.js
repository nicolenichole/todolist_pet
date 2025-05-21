// helper to schedule the daily alarm at the stored HH:MM
function scheduleDailyAlarm() {
    chrome.storage.sync.get('notificationTime', data => {
        // default to 09:00 if nothing saved yet
        const [hour, minute] = (data.notificationTime || '09:00')
            .split(':')
            .map(num => parseInt(num, 10));
        
        const now = Date.now();
        const today = new Date(now);
        // build a Date for today at the desired hour/minute
        let firstAlarm = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            hour,
            minute, 0, 0
        ).getTime();
    
        // if that time is already past, schedule for tomorrow
        if (firstAlarm <= now) {
            firstAlarm += 24 * 60 * 60 * 1000;
        }
    
        // clear any existing alarm, then create a new repeating one
        chrome.alarms.clear('dailyReminder', () => {
            chrome.alarms.create('dailyReminder', {
                when: firstAlarm,
                periodInMinutes: 24 * 60
            });
            console.log(`Scheduled dailyReminder at ${new Date(firstAlarm).toLocaleString()}`);
        });
    });
  }
  
  // 1) On installation or browser startup, schedule the alarm
  chrome.runtime.onInstalled.addListener(scheduleDailyAlarm);
  chrome.runtime.onStartup.addListener(scheduleDailyAlarm);
  
  // 2) If the user changes the time in options, re‑schedule
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.notificationTime) {
      scheduleDailyAlarm();
    }
  });
  
  // 3) Your existing alarm handler stays the same:
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name !== 'dailyReminder') return;
  
    chrome.storage.local.get(
        { taskCompleted: false, petState: 'sad' },
        data => {
            if (data.petState === 'dead') {
                // pet is dead → stop reminding
                chrome.alarms.clear('dailyReminder');
                return;
            }
    
            const newState = data.taskCompleted ? 'sad' : 'dead';
            chrome.storage.local.set({
                taskCompleted: false,
                petState: newState
            }, () => {
                // only notify if still alive
                if (newState !== 'dead') {
                    chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('assets/icon48.png'),
                    title: '⏰ Daily Reminder',
                    message: newState === 'sad'
                        ? 'Your pet is waiting for you.'
                        : 'Your pet is happy!',
                    priority: 2
                    });
                }
            });
        }
    );
});

// 4) **Add your message listener here** **
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'restart') {
      // reset pet and task state
      chrome.storage.local.set({
        taskCompleted: false,
        petState: 'sad'
      }, () => {
        // re‐schedule the daily alarm
        if (typeof scheduleDailyAlarm === 'function') {
          scheduleDailyAlarm();
        } else {
          chrome.alarms.create('dailyReminder', { periodInMinutes: 1440 });
        }
        sendResponse({ restarted: true });
      });
      return true; // keep the message channel open for sendResponse
    }
});
  