// Adventure Vault - Childhood Memories
// Password: markdescariopapeng@123

const VAULT_PASSWORD = "markdescariopapeng@123";
let memories = JSON.parse(localStorage.getItem('adventureMemories')) || [];
let currentImageBase64 = null;

// DOM Elements
const passwordScreen = document.getElementById('passwordScreen');
const app = document.getElementById('app');
const passwordInput = document.getElementById('passwordInput');
const currentDate = document.getElementById('dateText');
const photoUpload = document.getElementById('photoUpload');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    updateStats();
    loadMemories();
    setupEventListeners();
    
    // Add 3 sample childhood memories if empty
    if (memories.length === 0) {
        addSampleMemories();
    }
});

// Update current date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Check password
function checkPassword() {
    if (passwordInput.value === VAULT_PASSWORD) {
        passwordScreen.classList.remove('active');
        app.classList.add('active');
        showNotification('🔓 Vault unlocked! Welcome to your adventures!', 'success');
    } else {
        passwordInput.style.borderColor = 'red';
        passwordInput.value = '';
        passwordInput.placeholder = 'Wrong password! Try again...';
        showNotification('❌ Wrong password! Try again.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Photo upload
    uploadArea.addEventListener('click', () => photoUpload.click());
    
    photoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImageBase64 = e.target.result;
                imagePreview.innerHTML = `<img src="${currentImageBase64}" alt="Preview">`;
                uploadArea.style.borderColor = '#4CAF50';
                uploadArea.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Enter key for password
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
}

// Save new memory
function saveMemory() {
    const title = document.getElementById('memoryTitle').value.trim();
    const text = document.getElementById('memoryText').value.trim();
    const activeMoodBtn = document.querySelector('.mood-btn.active');
    const mood = activeMoodBtn ? activeMoodBtn.textContent : '😊 Happy';
    
    if (!title || !text) {
        showNotification('⚠️ Please add a title and story!', 'warning');
        return;
    }
    
    const newMemory = {
        id: Date.now(),
        title: title,
        text: text,
        date: new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        mood: mood,
        image: currentImageBase64,
        timestamp: new Date().getTime()
    };
    
    memories.unshift(newMemory); // Add to beginning
    saveToLocalStorage();
    clearForm();
    loadMemories();
    updateStats();
    
    showNotification('✅ Adventure saved successfully!', 'success');
}

// Clear form
function clearForm() {
    document.getElementById('memoryTitle').value = '';
    document.getElementById('memoryText').value = '';
    imagePreview.innerHTML = '';
    currentImageBase64 = null;
    uploadArea.style.borderColor = '#4FC3F7';
    uploadArea.style.backgroundColor = 'rgba(79, 195, 247, 0.1)';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.mood-btn').classList.add('active'); // Select first mood by default
}

// Load and display memories
function loadMemories(filter = 'all') {
    const container = document.getElementById('memoriesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (memories.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let filteredMemories = [...memories];
    
    if (filter === 'photo') {
        filteredMemories = memories.filter(m => m.image);
    } else if (filter === 'recent') {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        filteredMemories = memories.filter(m => m.timestamp > oneMonthAgo);
    }
    
    let html = '';
    filteredMemories.forEach(memory => {
        html += `
        <div class="memory-card vintage-paper">
            <div class="memory-header">
                <h3 class="memory-title">${memory.title}</h3>
                <span class="memory-date">${memory.date}</span>
            </div>
            
            <div class="memory-content">
                <p>${memory.text}</p>
            </div>
            
            ${memory.image ? `
            <div class="memory-photo-container">
                <img src="${memory.image}" class="memory-photo" alt="${memory.title}">
            </div>
            ` : ''}
            
            <div class="memory-footer">
                <span class="memory-mood">${memory.mood}</span>
                <button onclick="deleteMemory(${memory.id})" class="delete-btn" style="float: right; background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

// Filter memories
function filterMemories(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadMemories(type);
}

// Search memories
function searchMemories() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('memoriesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!searchTerm) {
        loadMemories();
        return;
    }
    
    const filtered = memories.filter(m => 
        m.title.toLowerCase().includes(searchTerm) || 
        m.text.toLowerCase().includes(searchTerm) ||
        m.mood.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h4>No adventures found!</h4>
            <p>No memories match "${searchTerm}"</p>
        </div>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(memory => {
        html += `
        <div class="memory-card vintage-paper">
            <div class="memory-header">
                <h3 class="memory-title">${memory.title}</h3>
                <span class="memory-date">${memory.date}</span>
            </div>
            <div class="memory-content">
                <p>${memory.text}</p>
            </div>
            ${memory.image ? `<img src="${memory.image}" class="memory-photo">` : ''}
            <div class="memory-mood">${memory.mood}</div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

// Delete memory
function deleteMemory(id) {
    if (confirm('Are you sure you want to delete this adventure? It will be gone forever!')) {
        memories = memories.filter(m => m.id !== id);
        saveToLocalStorage();
        loadMemories();
        updateStats();
        showNotification('🗑️ Adventure deleted', 'info');
    }
}

// Update statistics
function updateStats() {
    const photoCount = memories.filter(m => m.image).length;
    document.getElementById('photoCount').textContent = photoCount;
    document.getElementById('memoryCount').textContent = memories.length;
    
    // Calculate days active
    if (memories.length > 0) {
        const firstMemory = Math.min(...memories.map(m => m.timestamp));
        const days = Math.ceil((Date.now() - firstMemory) / (1000 * 60 * 60 * 24));
        document.getElementById('daysActive').textContent = `Day ${days + 1}`;
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('adventureMemories', JSON.stringify(memories));
}

// Export memories
function exportMemories() {
    const dataStr = JSON.stringify(memories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `adventure-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('📥 Backup downloaded! Save this file somewhere safe.', 'success');
}

// Lock vault
function lockVault() {
    app.classList.remove('active');
    passwordScreen.classList.add('active');
    passwordInput.value = '';
    passwordInput.placeholder = 'Type: markdescariopapeng@123';
    showNotification('🔒 Vault locked! See you next time!', 'info');
}

// Show all memories
function showAllMemories() {
    loadMemories('all');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn').classList.add('active');
    scrollToTop();
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else if (type === 'warning') {
        notification.style.background = '#ff9800';
    } else {
        notification.style.background = '#2196F3';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Add sample childhood memories
function addSampleMemories() {
    const sampleMemories = [
        {
            id: 1,
            title: "Treehouse Adventures",
            text: "Built the coolest treehouse with my best friends today. We used old wooden planks and made a secret rope ladder. It's our new secret headquarters!",
            date: "Summer 2018",
            mood: "🏹 Adventurous",
            image: null,
            timestamp: new Date('2018-07-15').getTime()
        },
        {
            id: 2,
            title: "First Bicycle Ride",
            text: "Dad took off the training wheels today! I fell three times but finally rode all the way down the street without falling. My knees are scratched but I feel so proud!",
            date: "Spring 2016",
            mood: "😊 Joyful",
            image: null,
            timestamp: new Date('2016-04-22').getTime()
        },
        {
            id: 3,
            title: "Midnight Feast",
            text: "Had a secret midnight feast with my siblings during sleepover. We ate all the cookies and told scary stories with flashlight shadows on the wall.",
            date: "December 2019",
            mood: "😂 Funny",
            image: null,
            timestamp: new Date('2019-12-28').getTime()
        }
    ];
    
    memories = [...sampleMemories, ...memories];
    saveToLocalStorage();
}

// Import memories from backup
function importMemories() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                memories = [...imported, ...memories];
                saveToLocalStorage();
                loadMemories();
                updateStats();
                showNotification('📤 Memories imported successfully!', 'success');
            } catch (error) {
                showNotification('❌ Error importing file. Make sure it\'s a valid backup.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
// Auto-backup to JSON file every 10 memories
function checkAutoBackup() {
    if (memories.length > 0 && memories.length % 10 === 0) {
        exportMemories();
        showNotification('🔄 Auto-backup created!', 'info');
    }
}

// Then modify the saveMemory function to include backup check:
// Find the saveMemory function and add this line at the end:
function saveMemory() {
    // ... existing code ...
    
    memories.unshift(newMemory);
    saveToLocalStorage();
    checkAutoBackup();  // <-- ADD THIS LINE
    clearForm();
    loadMemories();
    updateStats();
    
    showNotification('✅ Adventure saved successfully!', 'success');
}