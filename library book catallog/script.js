// --- Initial Setup & Data ---
const STORAGE_KEY = 'library_books';
const THEME_KEY = 'library_theme';

// Default mock data if no data in localStorage
const defaultBooks = [
    {
        id: '1',
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        category: 'Technology',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        favorite: true,
        dateAdded: new Date(2023, 1, 15).toISOString()
    },
    {
        id: '2',
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400',
        favorite: false,
        dateAdded: new Date(2023, 2, 10).toISOString()
    },
    {
        id: '3',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        category: 'Science',
        cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
        favorite: true,
        dateAdded: new Date(2023, 3, 5).toISOString()
    },
    {
        id: '4',
        title: '1984',
        author: 'George Orwell',
        category: 'Fiction',
        cover: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400',
        favorite: false,
        dateAdded: new Date(2023, 4, 20).toISOString()
    },
    {
        id: '5',
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        category: 'Biography',
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
        favorite: false,
        dateAdded: new Date(2023, 5, 2).toISOString()
    }
];

let books = [];

// --- DOM Elements ---
const booksGrid = document.getElementById('books-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');

// Modal Elements
const addModal = document.getElementById('add-modal');
const detailsModal = document.getElementById('details-modal');
const openAddModalBtn = document.getElementById('open-add-modal');
const closeBtns = document.querySelectorAll('.close-modal');
const addBookForm = document.getElementById('add-book-form');

// Theme Elements
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const htmlEl = document.documentElement;

// --- Initialize App ---
function init() {
    loadBooks();
    loadTheme();
    renderBooks();
    setupEventListeners();
}

// --- Data Management ---
function loadBooks() {
    const savedBooks = localStorage.getItem(STORAGE_KEY);
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    } else {
        books = [...defaultBooks];
        saveBooks();
    }
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// --- Theme Management ---
function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    if (theme === 'dark') {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

function toggleTheme() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// --- Rendering ---
function renderBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterCategory = categoryFilter.value;
    const sortBy = sortSelect.value;
    
    // Filter
    let filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || 
                              book.author.toLowerCase().includes(searchTerm);
        const matchesCategory = filterCategory === 'All' || book.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === 'az') {
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'za') {
        filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'category') {
        filteredBooks.sort((a, b) => a.category.localeCompare(b.category));
    }

    // Render
    booksGrid.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filteredBooks.forEach(book => {
            const card = createBookCard(book);
            booksGrid.appendChild(card);
        });
    }
}

function createBookCard(book) {
    const defaultCover = 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=400';
    const coverUrl = book.cover || defaultCover;
    
    const card = document.createElement('article');
    card.className = 'book-card';
    
    card.innerHTML = `
        <img src="${coverUrl}" alt="Cover of ${book.title}" class="book-cover" onerror="this.src='${defaultCover}'">
        <div class="book-info">
            <span class="book-category">${book.category}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <div class="book-actions">
                <button class="action-btn details-btn" data-id="${book.id}" aria-label="View Details" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </button>
                <div class="action-group">
                    <button class="action-btn fav-btn ${book.favorite ? 'active' : ''}" data-id="${book.id}" aria-label="Favorite" title="Toggle Favorite">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    <button class="action-btn del-btn" data-id="${book.id}" aria-label="Delete" title="Delete Book">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

// --- Interactions ---
function handleBookActions(e) {
    const target = e.target.closest('.action-btn');
    if (!target) return;

    const bookId = target.getAttribute('data-id');

    if (target.classList.contains('del-btn')) {
        deleteBook(bookId);
    } else if (target.classList.contains('fav-btn')) {
        toggleFavorite(bookId);
    } else if (target.classList.contains('details-btn')) {
        showBookDetails(bookId);
    }
}

function addBook(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('book-title').value.trim();
    const authorInput = document.getElementById('book-author').value.trim();
    const categoryInput = document.getElementById('book-category').value;
    const coverInput = document.getElementById('book-cover').value.trim();
    
    if (!titleInput || !authorInput || !categoryInput) {
        alert("Please fill in all required fields.");
        return;
    }

    const newBook = {
        id: Date.now().toString(),
        title: titleInput,
        author: authorInput,
        category: categoryInput,
        cover: coverInput,
        favorite: false,
        dateAdded: new Date().toISOString()
    };
    
    books.unshift(newBook);
    saveBooks();
    renderBooks();
    
    addBookForm.reset();
    closeModal(addModal);
}

function deleteBook(id) {
    if (confirm('Are you sure you want to remove this book from the catalogue?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        renderBooks();
    }
}

function toggleFavorite(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        book.favorite = !book.favorite;
        saveBooks();
        renderBooks();
    }
}

function showBookDetails(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const defaultCover = 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=400';
    const coverUrl = book.cover || defaultCover;
    const dateAdded = new Date(book.dateAdded).toLocaleDateString();

    const detailsBody = document.getElementById('details-body');
    detailsBody.innerHTML = `
        <div class="details-layout">
            <img src="${coverUrl}" alt="Cover of ${book.title}" class="details-cover" onerror="this.src='${defaultCover}'">
            <div class="details-info">
                <div class="badge">${book.category}</div>
                <h2 class="details-title" style="margin-top: 1rem;">${book.title}</h2>
                <p class="details-author">By ${book.author}</p>
                
                <div class="details-meta">
                    <div class="meta-item">
                        <span class="meta-label">ID</span>
                        <span>#${book.id.slice(-6)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Added</span>
                        <span>${dateAdded}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span>${book.favorite ? '⭐ Favorited' : 'Standard'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal(detailsModal);
}

// --- Modals ---
function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// --- Event Listeners ---
function setupEventListeners() {
    // Search, Filter, Sort
    searchInput.addEventListener('input', renderBooks);
    categoryFilter.addEventListener('change', renderBooks);
    sortSelect.addEventListener('change', renderBooks);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Book actions (delegated)
    booksGrid.addEventListener('click', handleBookActions);
    
    // Modals
    openAddModalBtn.addEventListener('click', () => openModal(addModal));
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal);
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(closeModal);
        }
    });

    // Forms
    addBookForm.addEventListener('submit', addBook);
}

// Run app
document.addEventListener('DOMContentLoaded', init);
