document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const fileInput = document.getElementById('file-input');
  const uploadButton = document.getElementById('upload-button');
  const audioInput = document.getElementById('audio-input');
  const uploadAudioButton = document.getElementById('upload-audio-button');

  let chatHistory = [];

  // Fungsi untuk menampilkan pesan di chat
  function displayMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Fungsi untuk mengirim pesan teks
  async function sendTextMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Tampilkan pesan pengguna
    displayMessage(message, true);
    messageInput.value = '';
    
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, message })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      chatHistory = data.history;
      displayMessage(data.output);
    } catch (error) {
      console.error('Error:', error);
      displayMessage('Error: Failed to get response');
    }
  }

  // Fungsi untuk mengupload dokumen
  async function uploadDocument() {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    // Tampilkan notifikasi pengolahan
    displayMessage(`Uploading and processing ${file.name}...`, false);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/generate-from-document', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      displayMessage(`Document analysis: ${data.output}`);
    } catch (error) {
      console.error('Upload error:', error);
      displayMessage(`Error: ${error.message}`);
    } finally {
      // Reset input file
      fileInput.value = '';
    }
  }

  // Fungsi untuk mengupload audio
  async function uploadAudio() {
    const file = audioInput.files[0];
    if (!file) {
      alert('Please select an audio file first!');
      return;
    }

    // Tampilkan notifikasi pengolahan
    displayMessage(`Uploading and processing ${file.name}...`, false);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/generate-from-audio', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      displayMessage(`Audio analysis: ${data.output}`);
    } catch (error) {
      console.error('Audio upload error:', error);
      displayMessage(`Error: ${error.message}`);
    } finally {
      // Reset input audio
      audioInput.value = '';
    }
  }

  // Event listeners
  sendButton.addEventListener('click', sendTextMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendTextMessage();
  });
  
  uploadButton.addEventListener('click', uploadDocument);
  uploadAudioButton.addEventListener('click', uploadAudio);
});