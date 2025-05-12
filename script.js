// समय और तारीख अपडेट करने का फंक्शन
function updateDateTime() {
    const now = new Date();
    
    // तारीख और समय फॉर्मेट
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric' };
    
    const formattedDate = now.toLocaleDateString('hi-IN', dateOptions);
    const formattedTime = now.toLocaleTimeString('hi-IN', timeOptions);
    
    // HTML एलिमेंट्स अपडेट करें
    document.getElementById('current-date').textContent = formattedDate;
    document.getElementById('current-time').textContent = formattedTime;
}

// मोबाइल मेनू टॉगल
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('active');
}

// मुख्य समाचार लोड करें
function loadFeaturedNews() {
    const featuredNews = newsArticles.filter(article => article.isFeatured);
    const featuredContainer = document.getElementById('featured-news');
    
    if (featuredContainer) {
        featuredContainer.innerHTML = '';
        
        featuredNews.slice(0, 3).forEach(article => {
            featuredContainer.innerHTML += `
                <div class="featured-news-item">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="featured-news-content">
                        <span class="category">${getCategoryName(article.category)}</span>
                        <h3><a href="#" onclick="showArticle(${article.id}); return false;">${article.title}</a></h3>
                        <p>${article.excerpt}</p>
                        <div class="news-meta">
                            <span class="date"><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                            <span class="author"><i class="fas fa-user"></i> ${article.author}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

// ब्रेकिंग न्यूज़ लोड करें
function loadBreakingNews() {
    const breakingNews = newsArticles.filter(article => article.isBreaking);
    const breakingContainer = document.getElementById('breaking-news-container');
    
    if (breakingContainer) {
        breakingContainer.innerHTML = '';
        
        breakingNews.forEach(article => {
            breakingContainer.innerHTML += `
                <div class="breaking-news-item">
                    <span class="breaking-label">ब्रेकिंग</span>
                    <h4><a href="#" onclick="showArticle(${article.id}); return false;">${article.title}</a></h4>
                </div>
            `;
        });
    }
}

// श्रेणी के अनुसार समाचार लोड करें
function loadCategoryNews(category) {
    const categoryNews = newsArticles.filter(article => article.category === category);
    const categoryContainer = document.getElementById(`${category}-news`);
    
    if (categoryContainer) {
        categoryContainer.innerHTML = '';
        
        categoryNews.slice(0, 4).forEach(article => {
            categoryContainer.innerHTML += `
                <div class="news-card">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="news-card-content">
                        <h3><a href="#" onclick="showArticle(${article.id}); return false;">${article.title}</a></h3>
                        <p>${article.excerpt}</p>
                        <div class="news-meta">
                            <span class="date"><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

// पूरा आर्टिकल दिखाएं
function showArticle(id) {
    const article = newsArticles.find(article => article.id === id);
    const mainContent = document.querySelector('.main-content');
    
    if (article && mainContent) {
        // पिछला कंटेंट सेव करें
        window.previousContent = mainContent.innerHTML;
        
        // आर्टिकल का कंटेंट दिखाएं
        mainContent.innerHTML = `
            <div class="article-container">
                <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i> वापस जाएं</button>
                <div class="article-header">
                    <span class="category">${getCategoryName(article.category)}</span>
                    <h1>${article.title}</h1>
                    <div class="article-meta">
                        <span class="date"><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                        <span class="author"><i class="fas fa-user"></i> ${article.author}</span>
                    </div>
                </div>
                <div class="article-image">
                    <img src="${article.image}" alt="${article.title}">
                </div>
                <div class="article-content">
                    ${article.content}
                </div>
                <div class="share-buttons">
                    <button><i class="fab fa-facebook"></i> शेयर करें</button>
                    <button><i class="fab fa-twitter"></i> ट्वीट करें</button>
                    <button><i class="fab fa-whatsapp"></i> WhatsApp</button>
                </div>
            </div>
        `;
        
        // स्क्रॉल टॉप करें
        window.scrollTo(0, 0);
    }
}

// वापस जाने का फंक्शन
function goBack() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent && window.previousContent) {
        mainContent.innerHTML = window.previousContent;
        window.scrollTo(0, 0);
    }
}

// श्रेणी का नाम प्राप्त करें
function getCategoryName(categorySlug) {
    const categories = {
        'bhilai': 'भिलाई',
        'chhattisgarh': 'छत्तीसगढ़',
        'national': 'राष्ट्रीय',
        'international': 'अंतरराष्ट्रीय',
        'sports': 'खेल',
        'entertainment': 'मनोरंजन',
        'business': 'व्यापार',
        'technology': 'टेक्नोलॉजी'
    };
    
    return categories[categorySlug] || categorySlug;
}

// तारीख को सही फॉर्मेट में बदलें
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('hi-IN', options);
}

// पेज लोड होने पर न्यूज़लेटर सब्सक्रिप्शन फॉर्म का इवेंट हैंडलर
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            if (emailInput && emailInput.value) {
                alert('आपने न्यूज़लेटर के लिए सफलतापूर्वक साइन अप कर लिया है। धन्यवाद!');
                emailInput.value = '';
            }
        });
    }
}

// रैंडम प्रकाशन तिथियां सेट करें (डेमो पेज के लिए)
function setRandomPublishDates() {
    const newsItems = document.querySelectorAll('.news-meta .date');
    
    newsItems.forEach(item => {
        if (!item.getAttribute('data-fixed')) {
            item.textContent = getRandomPublishDate();
        }
    });
}

// रैंडम प्रकाशन तिथि जनरेट करें
function getRandomPublishDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // 0 से 30 दिनों के बीच
    
    now.setDate(now.getDate() - daysAgo);
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('hi-IN', options);
}

// निर्दिष्ट श्रेणी के अनुसार समाचार फ़िल्टर करें
function filterNewsByCategory(category) {
    const allSections = document.querySelectorAll('.category-section');
    const allTabs = document.querySelectorAll('.category-tabs .tab');
    
    // सभी सेक्शन्स छुपाएं
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // सभी टैब्स से एक्टिव क्लास हटाएं
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // सिर्फ चयनित श्रेणी का सेक्शन दिखाएं
    const selectedSection = document.getElementById(`${category}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // चयनित टैब को एक्टिव करें
    const selectedTab = document.querySelector(`.category-tabs .tab[data-category="${category}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// पेज लोड होने पर सभी समाचार दिखाएं
document.addEventListener('DOMContentLoaded', function() {
    // समय और तारीख अपडेट करें
    updateDateTime();
    setInterval(updateDateTime, 60000); // हर मिनट अपडेट करें
    
    // मोबाइल मेनू का इवेंट हैंडलर
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // न्यूज़लेटर फॉर्म सेटअप
    setupNewsletterForm();
    
    // समाचार लोड करें
    loadFeaturedNews();
    loadBreakingNews();
    loadCategoryNews('bhilai');
    loadCategoryNews('chhattisgarh');
    loadCategoryNews('national');
    loadCategoryNews('sports');
    
    // कैटेगरी टैब्स के लिए इवेंट लिसनर्स
    const categoryTabs = document.querySelectorAll('.category-tabs .tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category) {
                filterNewsByCategory(category);
            }
        });
    });
    
    // पहली श्रेणी का टैब एक्टिव करें
    const firstTab = document.querySelector('.category-tabs .tab');
    if (firstTab) {
        firstTab.click();
    }
});