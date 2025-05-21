document.addEventListener('DOMContentLoaded', () => {
    const optionsForm = document.getElementById('optionsForm');
    
    // Load any previously saved notification time
    chrome.storage.sync.get('notificationTime', (data) => {
      if (data.notificationTime) {
        document.getElementById('notificationTime').value = data.notificationTime;
      }
    });
  
    // Save new settings on form submission
    optionsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const notificationTime = document.getElementById('notificationTime').value;
        chrome.storage.sync.set({ 'notificationTime': notificationTime }, () => {
            alert('Options saved!');
        });
    });
});
  