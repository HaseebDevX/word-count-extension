document.getElementById('count-words').addEventListener('click', () => {
    const url = document.getElementById('input-url').value;
    const documentIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  
    if (documentIdMatch) {
      const documentId = documentIdMatch[1];
  
      chrome.runtime.sendMessage({action: 'countWords', documentId}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          document.getElementById('result').textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
  
        if (response.error) {
          document.getElementById('result').textContent = 'Error: ' + response.error;
        } else {
          document.getElementById('result').textContent = `Word Count: ${response.wordCount}`;
        }
      });
    } else {
      alert('Please enter a valid Google Docs URL.');
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'extractHeadings') {
        const headingsList = document.getElementById('headings-list');
        message.headings.forEach(heading => {
          const listItem = document.createElement('li');
          listItem.textContent = `${heading.level}: ${heading.text}`;
          headingsList.appendChild(listItem);
        });
      }
    });
  
    // Trigger extraction when the popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const headings = [];
          const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          elements.forEach(element => {
            headings.push({
              level: element.tagName,
              text: element.innerText
            });
          });
          chrome.runtime.sendMessage({ action: 'extractHeadings', headings: headings });
        }
      });
    });
  });
  
  