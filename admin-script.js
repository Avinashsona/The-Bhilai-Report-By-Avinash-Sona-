document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    initAdminPanel();
    
    // Toggle sidebar on mobile
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('open');
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginPage();
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            // Simple validation
            if (username === 'admin' && password === 'password') {
                hideLoginPage();
            } else {
                alert('यूज़रनेम या पासवर्ड गलत है। कृपया पुनः प्रयास करें।');
            }
        });
    }
    
    // Navigation menu functionality
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#') && this.getAttribute('href') !== '#logout') {
                e.preventDefault();
                const targetSection = this.getAttribute('href').substring(1);
                showSection(targetSection);
                
                // Update active state in navigation
                document.querySelectorAll('.nav-menu li').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
            }
        });
    });
    
    // Settings tabs functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            document.getElementById(`${tab}-tab`).classList.add('active');
            
            // Update active state for tab buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Initialize text editor functionality
    initTextEditor();
    
    // File upload preview
    const featuredImageInput = document.getElementById('news-featured-image');
    if (featuredImageInput) {
        featuredImageInput.addEventListener('change', function() {
            previewImage(this, 'image-preview');
        });
    }
    
    // Add news form submission
    const addNewsForm = document.getElementById('add-news-form');
    if (addNewsForm) {
        addNewsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('news-title').value;
            const category = document.getElementById('news-category').value;
            const excerpt = document.getElementById('news-excerpt').value;
            const content = document.getElementById('news-content').value;
            
            // Validate required fields
            if (!title || !category || !excerpt || !content) {
                alert('कृपया सभी आवश्यक फ़ील्ड भरें।');
                return;
            }
            
            // Simulate news creation
            alert('समाचार सफलतापूर्वक प्रकाशित किया गया है!');
            
            // Reset form
            this.reset();
            document.getElementById('image-preview').innerHTML = '';
        });
    }
    
    // Add category form submission
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get category name
            const categoryName = document.getElementById('category-name').value;
            
            if (!categoryName) {
                alert('कृपया श्रेणी का नाम दर्ज करें।');
                return;
            }
            
            // Simulate category creation
            alert(`श्रेणी "${categoryName}" सफलतापूर्वक जोड़ी गई है!`);
            
            // Reset form
            this.reset();
        });
    }
    
    // Delete confirmation modal setup
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showConfirmModal();
        });
    });
    
    // Modal close button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hideConfirmModal();
        });
    }
    
    // Cancel delete action
    const cancelActionBtn = document.getElementById('cancel-action');
    if (cancelActionBtn) {
        cancelActionBtn.addEventListener('click', function() {
            hideConfirmModal();
        });
    }
    
    // Confirm delete action
    const confirmActionBtn = document.getElementById('confirm-action');
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', function() {
            // Simulate deletion
            alert('आइटम सफलतापूर्वक हटा दिया गया है!');
            hideConfirmModal();
        });
    }
    
    // Add automatic slug generation
    const categoryNameInput = document.getElementById('category-name');
    const categorySlugInput = document.getElementById('category-slug');
    if (categoryNameInput && categorySlugInput) {
        categoryNameInput.addEventListener('input', function() {
            // Generate slug from name (simple implementation)
            categorySlugInput.value = this.value
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
        });
    }
    
    // Setup media item click
    const mediaItems = document.querySelectorAll('.media-item');
    mediaItems.forEach(item => {
        item.addEventListener('click', function() {
            // Show media details (simplified)
            const mediaName = this.querySelector('.media-name').textContent;
            alert(`मीडिया "${mediaName}" चयनित किया गया।`);
        });
    });
});

// Function to initialize admin panel
function initAdminPanel() {
    // Check for login status (simplified)
    const isLoggedIn = true; // In a real app, check session/cookie
    
    if (!isLoggedIn) {
        showLoginPage();
    } else {
        hideLoginPage();
    }
    
    // Show dashboard section by default
    showSection('dashboard');
}

// Function to show login page
function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const adminPanel = document.querySelector('.admin-panel');
    
    if (loginPage && adminPanel) {
        loginPage.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
}

// Function to hide login page
function hideLoginPage() {
    const loginPage = document.getElementById('login-page');
    const adminPanel = document.querySelector('.admin-panel');
    
    if (loginPage && adminPanel) {
        loginPage.style.display = 'none';
        adminPanel.style.display = 'flex';
    }
}

// Function to show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Function to initialize text editor
function initTextEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    const textarea = document.getElementById('news-content');
    
    if (!toolbar || !textarea) return;
    
    // Simple text formatting
    const toolbarButtons = toolbar.querySelectorAll('button');
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i').className;
            let tag = '';
            
            // Determine tag based on icon
            if (icon.includes('bold')) tag = 'strong';
            else if (icon.includes('italic')) tag = 'em';
            else if (icon.includes('underline')) tag = 'u';
            else if (icon.includes('link')) {
                const url = prompt('URL दर्ज करें:', 'https://');
                if (url) {
                    tag = `<a href="${url}">` + getSelectedText(textarea) + '</a>';
                    insertTextAtCursor(textarea, tag);
                }
                return;
            } else if (icon.includes('list-ul')) {
                tag = '\n<ul>\n\t<li>' + getSelectedText(textarea) + '</li>\n</ul>';
                insertTextAtCursor(textarea, tag);
                return;
            } else if (icon.includes('list-ol')) {
                tag = '\n<ol>\n\t<li>' + getSelectedText(textarea) + '</li>\n</ol>';
                insertTextAtCursor(textarea, tag);
                return;
            } else if (icon.includes('image')) {
                const url = prompt('छवि URL दर्ज करें:', 'https://');
                if (url) {
                    tag = `<img src="${url}" alt="Image">`;
                    insertTextAtCursor(textarea, tag);
                }
                return;
            } else if (icon.includes('video')) {
                const url = prompt('वीडियो URL दर्ज करें:', 'https://');
                if (url) {
                    tag = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
                    insertTextAtCursor(textarea, tag);
                }
                return;
            } else {
                return;
            }
            
            // Wrap selected text with tag
            const selectedText = getSelectedText(textarea);
            if (selectedText) {
                const formattedText = `<${tag}>${selectedText}</${tag}>`;
                insertTextAtCursor(textarea, formattedText);
            }
        });
    });
}

// Function to get selected text from textarea
function getSelectedText(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    return textarea.value.substring(start, end);
}

// Function to insert text at cursor position
function insertTextAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    textarea.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

// Function to preview uploaded image
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Function to show confirmation modal
function showConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Function to hide confirmation modal
function hideConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Database API Calls (Simulated)
const API = {
    // Function to fetch news items
    async getNews() {
        // In a real app, this would be an API call
        return [
            {
                id: 1,
                title: 'भिलाई स्टील प्लांट में नई तकनीक का शुभारंभ',
                category: 'bhilai',
                status: 'published',
                author: 'अविनाश सोना',
                publishDate: '2023-05-10',
                views: 1245
            },
            // More items would be here
        ];
    },
    
    // Function to create a news item
    async createNews(newsData) {
        // In a real app, this would be an API call
        console.log('Creating news:', newsData);
        return { success: true, id: Date.now() };
    },
    
    // Function to update a news item
    async updateNews(id, newsData) {
        // In a real app, this would be an API call
        console.log(`Updating news ${id}:`, newsData);
        return { success: true };
    },
    
    // Function to delete a news item
    async deleteNews(id) {
        // In a real app, this would be an API call
        console.log(`Deleting news ${id}`);
        return { success: true };
    }
};

// Function to save news to database
async function saveNews(newsData) {
    try {
        const result = await API.createNews(newsData);
        if (result.success) {
            return { success: true, id: result.id };
        }
        return { success: false, error: 'Failed to save news' };
    } catch (error) {
        console.error('Error saving news:', error);
        return { success: false, error: error.message };
    }
}

// Function to initialize date and time
function updateDateTime() {
    const now = new Date();
    
    // Format date: e.g., "10 मई 2023, बुधवार"
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const formattedDate = now.toLocaleDateString('hi-IN', dateOptions);
    
    // Format time: e.g., "दोपहर 2:30 बजे"
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = now.toLocaleTimeString('hi-IN', timeOptions);
    
    // Update header date/time if needed
    // document.getElementById('current-date').textContent = formattedDate;
    // document.getElementById('current-time').textContent = formattedTime;
    
    return { date: formattedDate, time: formattedTime };
}