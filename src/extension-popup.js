// DOM Elements
const inputPrompt = document.getElementById('inputPrompt');
const enhanceBtn = document.getElementById('enhanceBtn');
const newBtn = document.getElementById('newBtn');
const copyBtn = document.getElementById('copyBtn');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const result = document.getElementById('result');
const notification = document.getElementById('notification');
const logoRompt = document.querySelector('.logo-rompt');
const initialButtons = document.getElementById('initialButtons');
const resultButtons = document.getElementById('resultButtons');
const roleSelect = document.getElementById('roleSelect');
const moodSelect = document.getElementById('moodSelect');
const roleLabel = document.getElementById('roleLabel');
const moodLabel = document.getElementById('moodLabel');

// State
let isEnhancing = false;
let currentEnhanced = '';

// Role descriptions mapping
const roleDescriptions = {
  'software-developer': 'an experienced software developer',
  'data-scientist': 'a skilled data scientist',
  'teacher': 'an expert educator',
  'artist': 'a creative artist',
  'writer': 'a professional writer',
  'marketer': 'a marketing specialist',
  'business-analyst': 'a business analyst',
  'designer': 'a creative designer',
  'researcher': 'an academic researcher'
};

// Mood descriptions mapping
const moodDescriptions = {
  'detailed': 'comprehensive and thorough',
  'concise': 'brief and to the point',
  'professional': 'formal and business-appropriate',
  'casual': 'relaxed and conversational',
  'creative': 'innovative and imaginative',
  'technical': 'precise and technical',
  'formal': 'structured and official',
  'friendly': 'warm and approachable'
};

// Mock enhancement function (replace with actual API call)
function generateEnhancedPrompt(original, role, mood) {
  let enhanced = '';
  
  // Add role context if selected
  if (role && roleDescriptions[role]) {
    enhanced += `Acting as ${roleDescriptions[role]}, `;
  }
  
  // Build the main prompt
  enhanced += `${original}`;
  
  // Add mood-based instructions
  let instructions = '\n\nKey Requirements:\n';
  
  if (mood === 'detailed') {
    instructions += '- Provide comprehensive and in-depth information\n';
    instructions += '- Include relevant examples and context\n';
    instructions += '- Cover all aspects thoroughly\n';
  } else if (mood === 'concise') {
    instructions += '- Keep responses brief and focused\n';
    instructions += '- Prioritize essential information\n';
    instructions += '- Avoid unnecessary details\n';
  } else if (mood === 'professional') {
    instructions += '- Maintain formal and professional tone\n';
    instructions += '- Use industry-standard terminology\n';
    instructions += '- Focus on business value\n';
  } else if (mood === 'casual') {
    instructions += '- Use conversational and friendly tone\n';
    instructions += '- Keep it approachable and easy to understand\n';
    instructions += '- Avoid overly formal language\n';
  } else if (mood === 'creative') {
    instructions += '- Think outside the box\n';
    instructions += '- Explore innovative approaches\n';
    instructions += '- Consider unique perspectives\n';
  } else if (mood === 'technical') {
    instructions += '- Use precise technical terminology\n';
    instructions += '- Include specific details and specifications\n';
    instructions += '- Focus on implementation details\n';
  } else if (mood === 'formal') {
    instructions += '- Maintain official and structured tone\n';
    instructions += '- Follow standard conventions\n';
    instructions += '- Ensure clarity and professionalism\n';
  } else if (mood === 'friendly') {
    instructions += '- Be warm and welcoming\n';
    instructions += '- Use encouraging language\n';
    instructions += '- Make it accessible and supportive\n';
  } else {
    // Default instructions
    instructions += '- Maintain clarity and precision\n';
    instructions += '- Focus on actionable outcomes\n';
    instructions += '- Ensure quality and best practices\n';
  }
  
  enhanced += instructions;
  
  // Add mood-specific output expectation
  if (moodDescriptions[mood]) {
    enhanced += `\nExpected Output:\nProvide a ${moodDescriptions[mood]} response that addresses all aspects of the request.`;
  }

  return enhanced;
}

// Enhance prompt
async function handleEnhance() {
  const prompt = inputPrompt.value.trim();
  const role = roleSelect.value;
  const mood = moodSelect.value;
  
  if (!prompt || isEnhancing) return;
  
  isEnhancing = true;
  enhanceBtn.disabled = true;
  
  // Collapse logo
  logoRompt.classList.remove('initial');
  logoRompt.classList.add('collapse');
  
  // Hide input card and show loading
  document.querySelector('.glass-card').classList.add('hidden');
  resultContainer.classList.add('hidden');
  loading.classList.remove('hidden');
  copyBtn.classList.add('hidden');
  
  // Simulate API call
  setTimeout(() => {
    const enhanced = generateEnhancedPrompt(prompt, role, mood);
    currentEnhanced = enhanced;
    
    // Show result
    loading.classList.add('hidden');
    result.textContent = enhanced;
    resultContainer.classList.remove('hidden');
    initialButtons.classList.add('hidden');
    resultButtons.classList.remove('hidden');
    
    isEnhancing = false;
    enhanceBtn.disabled = false;
  }, 1500);
}

// Copy to clipboard
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(currentEnhanced);
    showNotification('Copied to clipboard!');
  } catch (err) {
    showNotification('Failed to copy');
  }
}

// Show notification
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// Reset to input view
function resetView() {
  document.querySelector('.glass-card').classList.remove('hidden');
  resultContainer.classList.add('hidden');
  loading.classList.add('hidden');
  initialButtons.classList.remove('hidden');
  resultButtons.classList.add('hidden');
  inputPrompt.value = '';
  inputPrompt.focus();
  
  // Expand logo smoothly - just remove collapse class and let CSS transition handle it
  logoRompt.classList.remove('collapse');
}

// Event listeners
enhanceBtn.addEventListener('click', handleEnhance);
newBtn.addEventListener('click', resetView);
copyBtn.addEventListener('click', handleCopy);

// Update role label when selection changes
roleSelect.addEventListener('change', (e) => {
  const roleLabels = {
    'software-developer': 'Software Developer',
    'data-scientist': 'Data Scientist',
    'teacher': 'Teacher',
    'artist': 'Artist',
    'writer': 'Writer',
    'marketer': 'Marketer',
    'business-analyst': 'Business Analyst',
    'designer': 'Designer',
    'researcher': 'Researcher'
  };
  
  roleLabel.textContent = e.target.value ? roleLabels[e.target.value] : 'Role';
});

// Update mood label when selection changes
moodSelect.addEventListener('change', (e) => {
  const moodLabels = {
    'detailed': 'Detailed',
    'concise': 'Concise',
    'professional': 'Professional',
    'casual': 'Casual',
    'creative': 'Creative',
    'technical': 'Technical',
    'formal': 'Formal',
    'friendly': 'Friendly'
  };
  
  moodLabel.textContent = e.target.value ? moodLabels[e.target.value] : 'Mood';
});

// Keyboard shortcut
inputPrompt.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleEnhance();
  }
});

// Auto-focus input
inputPrompt.focus();

// History tracking
let promptHistory = [];

// Hamburger menu (history) button
const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', () => {
  showNotification('History feature coming soon!');
});

// Settings modal logic
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const saveApiKey = document.getElementById('saveApiKey');
const apiKeyInput = document.getElementById('apiKeyInput');

// Open settings modal
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('show');
});

// Close settings modal
closeModal.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('show');
  }
});

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.getAttribute('data-tab');
    
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    document.getElementById(`${targetTab}Tab`).classList.add('active');
  });
});

// Save API key
saveApiKey.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    showNotification('API key saved!');
  } else {
    showNotification('Please enter an API key');
  }
});

// Listen for messages from background script (if needed for extension)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'reset') {
      resetView();
      inputPrompt.value = '';
    }
  });
}