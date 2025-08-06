/**
 * TechStore - Main JavaScript File
 * Handles all interactive functionality for the e-commerce website
 */

// ========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ========================================

const CONFIG = {
    CART_STORAGE_KEY: 'techstore_cart',
    WISHLIST_STORAGE_KEY: 'techstore_wishlist',
    RECENTLY_VIEWED_KEY: 'techstore_recently_viewed',
    USER_PREFERENCES_KEY: 'techstore_preferences',
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    MAX_RECENT_ITEMS: 10
};

// Sample product data for demonstration
const PRODUCTS = [
    {
        id: 1,
        name: 'Premium Laptop',
        price: 1299.99,
        originalPrice: 1599.99,
        category: 'laptops',
        brand: 'apple',
        rating: 4.5,
        reviews: 128,
        image: 'laptop',
        inStock: true,
        description: 'High-performance laptop for professionals'
    },
    {
        id: 2,
        name: 'Smartphone Pro',
        price: 899.99,
        category: 'smartphones',
        brand: 'samsung',
        rating: 4.3,
        reviews: 89,
        image: 'mobile-alt',
        inStock: true,
        description: 'Latest smartphone with advanced features'
    },
    {
        id: 3,
        name: 'Wireless Headphones',
        price: 299.99,
        category: 'audio',
        brand: 'sony',
        rating: 4.7,
        reviews: 156,
        image: 'headphones',
        inStock: true,
        description: 'Premium wireless headphones with noise cancellation'
    },
    {
        id: 4,
        name: 'Tablet Pro',
        price: 599.99,
        category: 'accessories',
        brand: 'apple',
        rating: 4.4,
        reviews: 67,
        image: 'tablet-alt',
        inStock: true,
        description: 'Powerful tablet for work and entertainment'
    },
    {
        id: 5,
        name: 'Gaming Laptop',
        price: 1599.99,
        category: 'laptops',
        brand: 'hp',
        rating: 4.6,
        reviews: 203,
        image: 'laptop',
        inStock: true,
        description: 'High-end gaming laptop with RTX graphics'
    },
    {
        id: 6,
        name: 'Ultrabook Pro',
        price: 999.99,
        category: 'laptops',
        brand: 'dell',
        rating: 4.2,
        reviews: 94,
        image: 'laptop',
        inStock: true,
        description: 'Lightweight ultrabook for professionals'
    },
    {
        id: 7,
        name: 'Wireless Mouse',
        price: 79.99,
        category: 'accessories',
        brand: 'apple',
        rating: 4.1,
        reviews: 45,
        image: 'mouse',
        inStock: true,
        description: 'Ergonomic wireless mouse'
    },
    {
        id: 8,
        name: 'Laptop Stand',
        price: 49.99,
        category: 'accessories',
        brand: 'hp',
        rating: 4.0,
        reviews: 23,
        image: 'laptop',
        inStock: true,
        description: 'Adjustable laptop stand'
    }
];

// Global state
let currentCart = [];
let currentWishlist = [];
let currentFilters = {
    category: 'all',
    priceRange: 2000,
    brands: [],
    ratings: [],
    search: ''
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Get product by ID
 */
function getProductById(id) {
    return PRODUCTS.find(product => product.id === parseInt(id));
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `notification notification-${type} show`;

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Local storage helpers
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================

function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Update active navigation link based on current page
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ========================================
// CART FUNCTIONALITY
// ========================================

function initCart() {
    currentCart = storage.get(CONFIG.CART_STORAGE_KEY, []);
    updateCartDisplay();
    bindCartEvents();
}

function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    const existingItem = currentCart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentCart.push({
            id: productId,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }

    storage.set(CONFIG.CART_STORAGE_KEY, currentCart);
    updateCartDisplay();
    showNotification(`${product.name} added to cart`, 'success');
    
    // Add to recently viewed
    addToRecentlyViewed(productId);
}

function removeFromCart(productId) {
    const product = getProductById(productId);
    currentCart = currentCart.filter(item => item.id !== productId);
    storage.set(CONFIG.CART_STORAGE_KEY, currentCart);
    updateCartDisplay();
    
    if (product) {
        showNotification(`${product.name} removed from cart`, 'info');
    }
}

function updateCartQuantity(productId, quantity) {
    const item = currentCart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            storage.set(CONFIG.CART_STORAGE_KEY, currentCart);
            updateCartDisplay();
        }
    }
}

function clearCart() {
    currentCart = [];
    storage.set(CONFIG.CART_STORAGE_KEY, currentCart);
    updateCartDisplay();
    showNotification('Cart cleared', 'info');
}

function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // Update cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

function renderCartPage() {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItems) return;

    if (currentCart.length === 0) {
        cartItems.style.display = 'none';
        emptyCart.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    cartItems.style.display = 'block';
    emptyCart.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    cartItems.innerHTML = '';

    currentCart.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <div class="placeholder-image">
                    <i class="fas fa-${product.image}"></i>
                </div>
            </div>
            <div class="cart-item-details">
                <h3>${product.name}</h3>
                <p class="cart-item-price">${formatCurrency(product.price)}</p>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity(${product.id}, ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${product.id}, parseInt(this.value))">
                        <button class="quantity-btn" onclick="updateCartQuantity(${product.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn btn-outline" onclick="removeFromCart(${product.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="cart-item-total">
                <strong>${formatCurrency(product.price * item.quantity)}</strong>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    updateCartSummary();
}

function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const taxEl = document.getElementById('tax-amount');
    const totalEl = document.getElementById('total-amount');

    if (!subtotalEl) return;

    const subtotal = currentCart.reduce((sum, item) => {
        const product = getProductById(item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const shipping = subtotal > 500 ? 0 : 19.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    subtotalEl.textContent = formatCurrency(subtotal);
    shippingEl.textContent = formatCurrency(shipping);
    taxEl.textContent = formatCurrency(tax);
    totalEl.textContent = formatCurrency(total);

    // Update checkout summary
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTax = document.getElementById('checkout-tax');
    const checkoutTotal = document.getElementById('checkout-total');

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = formatCurrency(subtotal);
        checkoutShipping.textContent = formatCurrency(shipping);
        checkoutTax.textContent = formatCurrency(tax);
        checkoutTotal.textContent = formatCurrency(total);
    }
}

function bindCartEvents() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            addToCart(productId);
        }
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        });
    }

    // Promo code application
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Shipping option changes
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', updateShippingCost);
    });
}

function applyPromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoInput || !promoMessage) return;

    const code = promoInput.value.trim().toUpperCase();
    const validCodes = {
        'WELCOME10': 0.1,
        'SAVE20': 0.2,
        'STUDENT15': 0.15
    };

    if (validCodes[code]) {
        const discount = validCodes[code];
        promoMessage.innerHTML = `<span style="color: var(--success-color);">Promo code applied! ${(discount * 100)}% off</span>`;
        
        // Apply discount to summary
        const discountRow = document.getElementById('discount-row');
        const discountAmount = document.getElementById('discount-amount');
        
        if (discountRow && discountAmount) {
            const subtotal = currentCart.reduce((sum, item) => {
                const product = getProductById(item.id);
                return sum + (product ? product.price * item.quantity : 0);
            }, 0);
            
            const discountValue = subtotal * discount;
            discountAmount.textContent = `-${formatCurrency(discountValue)}`;
            discountRow.style.display = 'flex';
            
            // Recalculate total
            updateCartSummary();
        }
    } else {
        promoMessage.innerHTML = `<span style="color: var(--error-color);">Invalid promo code</span>`;
    }
}

function updateShippingCost() {
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (!selectedShipping) return;

    const shippingCosts = {
        'standard': 0,
        'express': 19.99,
        'overnight': 39.99
    };

    const cost = shippingCosts[selectedShipping.value] || 0;
    const shippingEl = document.getElementById('shipping-cost');
    if (shippingEl) {
        shippingEl.textContent = formatCurrency(cost);
        updateCartSummary();
    }
}

// ========================================
// WISHLIST FUNCTIONALITY
// ========================================

function initWishlist() {
    currentWishlist = storage.get(CONFIG.WISHLIST_STORAGE_KEY, []);
    updateWishlistDisplay();
    bindWishlistEvents();
}

function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    if (!currentWishlist.includes(productId)) {
        currentWishlist.push(productId);
        storage.set(CONFIG.WISHLIST_STORAGE_KEY, currentWishlist);
        updateWishlistDisplay();
        showNotification(`${product.name} added to wishlist`, 'success');
    } else {
        showNotification(`${product.name} is already in your wishlist`, 'info');
    }
}

function removeFromWishlist(productId) {
    const product = getProductById(productId);
    currentWishlist = currentWishlist.filter(id => id !== productId);
    storage.set(CONFIG.WISHLIST_STORAGE_KEY, currentWishlist);
    updateWishlistDisplay();
    
    if (product) {
        showNotification(`${product.name} removed from wishlist`, 'info');
    }
}

function clearWishlist() {
    currentWishlist = [];
    storage.set(CONFIG.WISHLIST_STORAGE_KEY, currentWishlist);
    updateWishlistDisplay();
    showNotification('Wishlist cleared', 'info');
}

function updateWishlistDisplay() {
    // Update wishlist buttons
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(btn => {
        const productId = parseInt(btn.getAttribute('data-product-id'));
        if (currentWishlist.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update wishlist page if we're on it
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistPage();
    }
}

function renderWishlistPage() {
    const wishlistItems = document.getElementById('wishlist-items');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const itemCount = document.getElementById('wishlist-item-count');

    if (!wishlistItems) return;

    if (itemCount) {
        itemCount.textContent = currentWishlist.length;
    }

    if (currentWishlist.length === 0) {
        wishlistItems.style.display = 'none';
        emptyWishlist.style.display = 'block';
        return;
    }

    wishlistItems.style.display = 'block';
    emptyWishlist.style.display = 'none';

    wishlistItems.innerHTML = '';

    currentWishlist.forEach(productId => {
        const product = getProductById(productId);
        if (!product) return;

        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <div class="placeholder-image">
                        <i class="fas fa-${product.image}"></i>
                    </div>
                    <button class="wishlist-btn active" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="btn btn-outline" onclick="removeFromWishlist(${product.id})">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
        wishlistItems.appendChild(wishlistItem);
    });
}

function bindWishlistEvents() {
    // Wishlist buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('wishlist-btn') || e.target.closest('.wishlist-btn')) {
            const btn = e.target.closest('.wishlist-btn') || e.target;
            const productId = parseInt(btn.getAttribute('data-product-id'));
            
            if (btn.classList.contains('active')) {
                removeFromWishlist(productId);
            } else {
                addToWishlist(productId);
            }
        }
    });

    // Clear wishlist button
    const clearWishlistBtn = document.getElementById('clear-wishlist');
    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your wishlist?')) {
                clearWishlist();
            }
        });
    }

    // Share wishlist
    const shareWishlistBtn = document.getElementById('share-wishlist');
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');

    if (shareWishlistBtn && shareModal) {
        shareWishlistBtn.addEventListener('click', () => {
            shareModal.classList.add('show');
        });
    }

    if (closeShareModal && shareModal) {
        closeShareModal.addEventListener('click', () => {
            shareModal.classList.remove('show');
        });
    }

    // Copy wishlist link
    const copyLinkBtn = document.getElementById('copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const linkInput = document.getElementById('wishlist-link');
            if (linkInput) {
                linkInput.select();
                document.execCommand('copy');
                showNotification('Link copied to clipboard!', 'success');
            }
        });
    }
}

// ========================================
// PRODUCT FILTERING AND SEARCH
// ========================================

function initProductFilters() {
    bindFilterEvents();
    renderProducts();
}

function bindFilterEvents() {
    // Search functionality
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value.trim().toLowerCase();
            renderProducts();
        }, CONFIG.DEBOUNCE_DELAY));
    }

    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                currentFilters.category = e.target.value;
            } else {
                const category = e.target.value;
                if (e.target.checked) {
                    if (!currentFilters.categories) currentFilters.categories = [];
                    currentFilters.categories.push(category);
                } else {
                    currentFilters.categories = currentFilters.categories.filter(cat => cat !== category);
                }
            }
            renderProducts();
        });
    });

    // Brand filters
    const brandFilters = document.querySelectorAll('.brand-filter');
    brandFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            const brand = e.target.value;
            if (e.target.checked) {
                currentFilters.brands.push(brand);
            } else {
                currentFilters.brands = currentFilters.brands.filter(b => b !== brand);
            }
            renderProducts();
        });
    });

    // Rating filters
    const ratingFilters = document.querySelectorAll('.rating-filter');
    ratingFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            const rating = parseInt(e.target.value);
            if (e.target.checked) {
                currentFilters.ratings.push(rating);
            } else {
                currentFilters.ratings = currentFilters.ratings.filter(r => r !== rating);
            }
            renderProducts();
        });
    });

    // Price range filter
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            priceValue.textContent = value;
            currentFilters.priceRange = value;
            debounce(renderProducts, 300)();
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            renderProducts();
        });
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

function clearFilters() {
    currentFilters = {
        category: 'all',
        priceRange: 2000,
        brands: [],
        ratings: [],
        search: ''
    };

    // Reset form inputs
    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';

    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.checked = filter.value === 'all';
    });

    const brandFilters = document.querySelectorAll('.brand-filter');
    brandFilters.forEach(filter => {
        filter.checked = false;
    });

    const ratingFilters = document.querySelectorAll('.rating-filter');
    ratingFilters.forEach(filter => {
        filter.checked = false;
    });

    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    if (priceSlider && priceValue) {
        priceSlider.value = 2000;
        priceValue.textContent = '2000';
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'name';

    renderProducts();
}

function filterProducts(products) {
    return products.filter(product => {
        // Category filter
        if (currentFilters.category && currentFilters.category !== 'all') {
            if (product.category !== currentFilters.category) return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            if (!productText.includes(searchTerm)) return false;
        }

        // Price filter
        if (product.price > currentFilters.priceRange) return false;

        // Brand filter
        if (currentFilters.brands.length > 0) {
            if (!currentFilters.brands.includes(product.brand)) return false;
        }

        // Rating filter
        if (currentFilters.ratings.length > 0) {
            const hasMatchingRating = currentFilters.ratings.some(rating => product.rating >= rating);
            if (!hasMatchingRating) return false;
        }

        return true;
    });
}

function sortProducts(products) {
    const sortBy = currentFilters.sort || 'name';
    
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'newest':
                return b.id - a.id; // Assuming higher ID = newer
            case 'popular':
                return b.reviews - a.reviews;
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const productCount = document.getElementById('product-count');
    const noResults = document.getElementById('no-results');

    if (!productsGrid) return;

    let filteredProducts = filterProducts(PRODUCTS);
    filteredProducts = sortProducts(filteredProducts);

    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }

    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';
    productsGrid.style.display = 'grid';
    productsGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    const discountBadge = product.originalPrice ? 
        `<div class="discount-badge">Save ${Math.round((1 - product.price / product.originalPrice) * 100)}%</div>` : '';
    
    const originalPrice = product.originalPrice ? 
        `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : '';

    card.innerHTML = `
        <div class="product-image">
            <div class="placeholder-image">
                <i class="fas fa-${product.image}"></i>
            </div>
            ${discountBadge}
            <button class="wishlist-btn ${currentWishlist.includes(product.id) ? 'active' : ''}" data-product-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
            <div class="product-rating">
                <div class="stars">
                    ${generateStars(product.rating)}
                </div>
                <span class="rating-text">(${product.rating}/5 - ${product.reviews} reviews)</span>
            </div>
            <p class="product-price">
                ${formatCurrency(product.price)}
                ${originalPrice}
            </p>
            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
            </button>
        </div>
    `;

    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ========================================
// RECENTLY VIEWED FUNCTIONALITY
// ========================================

function addToRecentlyViewed(productId) {
    let recentlyViewed = storage.get(CONFIG.RECENTLY_VIEWED_KEY, []);
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    // Add to beginning
    recentlyViewed.unshift(productId);
    
    // Keep only last 10 items
    recentlyViewed = recentlyViewed.slice(0, CONFIG.MAX_RECENT_ITEMS);
    
    storage.set(CONFIG.RECENTLY_VIEWED_KEY, recentlyViewed);
}

function renderRecentlyViewed() {
    const recentContainer = document.getElementById('recently-viewed-products');
    if (!recentContainer) return;

    const recentlyViewed = storage.get(CONFIG.RECENTLY_VIEWED_KEY, []);
    
    if (recentlyViewed.length === 0) {
        recentContainer.innerHTML = '<p>No recently viewed products</p>';
        return;
    }

    recentContainer.innerHTML = '';
    
    recentlyViewed.slice(0, 4).forEach(productId => {
        const product = getProductById(productId);
        if (product) {
            const productCard = createProductCard(product);
            recentContainer.appendChild(productCard);
        }
    });
}

// ========================================
// FORM VALIDATION AND HANDLING
// ========================================

function initForms() {
    bindFormEvents();
}

function bindFormEvents() {
    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form, #newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    // Password toggles
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', togglePasswordVisibility);
    });

    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    // Real-time validation
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (validateEmail(email)) {
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        form.reset();
    } else {
        showNotification('Please enter a valid email address', 'error');
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (validateForm(form)) {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        form.reset();
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (validateForm(form)) {
        // Simulate login
        showNotification('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (validateForm(form)) {
        // Check password confirmation
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;
        
        if (password !== confirmPassword) {
            showFieldError(form.querySelector('#confirm-password'), 'Passwords do not match');
            return;
        }
        
        showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (validateForm(form)) {
        showNotification('Order placed successfully!', 'success');
        clearCart();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const input = e.target;
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    // Required validation
    if (input.hasAttribute('required') && !value) {
        message = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    else if (input.type === 'email' && value && !validateEmail(value)) {
        message = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Phone validation
    else if (input.type === 'tel' && value && !validatePhone(value)) {
        message = 'Please enter a valid phone number';
        isValid = false;
    }
    
    // Password validation
    else if (input.type === 'password' && input.id === 'password' && value && value.length < 8) {
        message = 'Password must be at least 8 characters long';
        isValid = false;
    }
    
    if (isValid) {
        clearFieldError(input);
    } else {
        showFieldError(input, message);
    }
    
    return isValid;
}

function showFieldError(input, message) {
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    input.classList.add('error');
}

function clearFieldError(input) {
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    input.classList.remove('error');
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
}

function togglePasswordVisibility(e) {
    const button = e.target.closest('.password-toggle');
    const input = button.parentNode.querySelector('input');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let text = 'Weak';
    let color = '#DC3545';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        text = 'Strong';
        color = '#28A745';
    } else if (strength >= 50) {
        text = 'Medium';
        color = '#FFC107';
    }
    
    strengthBar.style.width = strength + '%';
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
}

// ========================================
// TABS AND ACCORDIONS
// ========================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            e.target.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function initAccordions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', (e) => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all other questions
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('show');
            });
            
            // Toggle current question
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('show');
            }
        });
    });
}

// ========================================
// MODAL FUNCTIONALITY
// ========================================

function initModals() {
    // Close modal when clicking backdrop
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    // Close modal when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                openModal.classList.remove('show');
            }
        }
    });

    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// ========================================
// CATEGORY PAGE FUNCTIONALITY
// ========================================

function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (category) {
        updateCategoryDisplay(category);
        currentFilters.category = category;
        renderProducts();
    }
}

function updateCategoryDisplay(category) {
    const categoryTitle = document.getElementById('category-title');
    const categoryBreadcrumb = document.getElementById('category-breadcrumb');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDescription = document.getElementById('banner-description');
    const bannerIcon = document.getElementById('banner-icon');
    
    const categoryData = {
        laptops: {
            title: 'Laptops',
            description: 'High-performance laptops for work and gaming',
            icon: 'laptop'
        },
        smartphones: {
            title: 'Smartphones',
            description: 'Latest smartphones with cutting-edge technology',
            icon: 'mobile-alt'
        },
        audio: {
            title: 'Audio',
            description: 'Premium headphones and audio equipment',
            icon: 'headphones'
        },
        accessories: {
            title: 'Accessories',
            description: 'Essential tech accessories and peripherals',
            icon: 'mouse'
        }
    };
    
    const data = categoryData[category] || categoryData.laptops;
    
    if (categoryTitle) categoryTitle.textContent = data.title;
    if (categoryBreadcrumb) categoryBreadcrumb.textContent = data.title;
    if (bannerTitle) bannerTitle.textContent = data.title;
    if (bannerDescription) bannerDescription.textContent = data.description;
    if (bannerIcon) bannerIcon.className = `fas fa-${data.icon}`;
}

// ========================================
// PRODUCT DETAIL PAGE FUNCTIONALITY
// ========================================

function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        addToRecentlyViewed(parseInt(productId));
        initProductThumbnails();
        initQuantityControls();
        initProductOptions();
    }
}

function initProductThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image .placeholder-image');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            
            // Update main image (in a real app, you'd change the src)
            // For demo purposes, we'll just add a visual effect
            if (mainImage) {
                mainImage.style.opacity = '0.7';
                setTimeout(() => {
                    mainImage.style.opacity = '1';
                }, 200);
            }
        });
    });
}

function initQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 10) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) value = 10;
            quantityInput.value = value;
        });
    }
}

function initProductOptions() {
    // Color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function initSearch() {
    const searchInputs = document.querySelectorAll('#product-search, #faq-search, #error-search');
    
    searchInputs.forEach(input => {
        const searchBtn = input.nextElementSibling;
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                performSearch(input.value.trim());
            });
        }
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(input.value.trim());
            }
        });
    });
}

function performSearch(query) {
    if (!query) return;
    
    // If on products page, filter products
    if (window.location.pathname.includes('products.html') || 
        window.location.pathname.includes('category.html')) {
        currentFilters.search = query.toLowerCase();
        renderProducts();
        return;
    }
    
    // If on FAQ page, filter FAQ items
    if (window.location.pathname.includes('faq.html')) {
        filterFAQs(query);
        return;
    }
    
    // Otherwise, redirect to products page with search
    const params = new URLSearchParams();
    params.set('search', query);
    window.location.href = `products.html?${params.toString()}`;
}

function filterFAQs(query) {
    const faqItems = document.querySelectorAll('.faq-item');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(lowerQuery) || answer.includes(lowerQuery)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show message if no results
    const noResultsMsg = document.getElementById('faq-no-results');
    if (visibleCount === 0 && !noResultsMsg) {
        const msg = document.createElement('div');
        msg.id = 'faq-no-results';
        msg.className = 'no-results';
        msg.innerHTML = `
            <h3>No results found</h3>
            <p>No FAQ items match your search for "${query}". Try different keywords or <a href="contact.html">contact us</a> directly.</p>
        `;
        document.querySelector('.faq-content').appendChild(msg);
    } else if (visibleCount > 0 && noResultsMsg) {
        noResultsMsg.remove();
    }
}

// ========================================
// LIVE CHAT SIMULATION
// ========================================

function initLiveChat() {
    const liveChatButtons = document.querySelectorAll('#live-chat-btn, #live-chat-faq, #live-chat-404');
    
    liveChatButtons.forEach(button => {
        button.addEventListener('click', () => {
            showNotification('Live chat feature coming soon! Please use our contact form or call us directly.', 'info');
        });
    });
}

// ========================================
// SMOOTH SCROLLING AND ANIMATIONS
// ========================================

function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

function initIntersectionObserver() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.product-card, .feature-card, .blog-post-card, .category-card');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// CHECKOUT PROCESS
// ========================================

function initCheckoutProcess() {
    if (!window.location.pathname.includes('checkout.html')) return;
    
    loadCheckoutItems();
    initPaymentMethodToggle();
    initBillingAddressToggle();
    initShippingMethodUpdate();
}

function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkout-items');
    if (!checkoutItems) return;
    
    checkoutItems.innerHTML = '';
    
    currentCart.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="item-details">
                <strong>${product.name}</strong>
                <span>Qty: ${item.quantity}</span>
            </div>
            <span>${formatCurrency(product.price * item.quantity)}</span>
        `;
        checkoutItems.appendChild(orderItem);
    });
    
    updateCartSummary();
}

function initPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('card-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

function initBillingAddressToggle() {
    const sameAsShipping = document.getElementById('same-as-shipping');
    const billingAddress = document.getElementById('billing-address');
    
    if (sameAsShipping && billingAddress) {
        sameAsShipping.addEventListener('change', (e) => {
            billingAddress.style.display = e.target.checked ? 'none' : 'block';
        });
    }
}

function initShippingMethodUpdate() {
    const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
    
    shippingMethods.forEach(method => {
        method.addEventListener('change', updateCartSummary);
    });
}

// ========================================
// URL PARAMETER HANDLING
// ========================================

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle search parameter
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = searchQuery;
            currentFilters.search = searchQuery.toLowerCase();
            renderProducts();
        }
    }
    
    // Handle category parameter
    const category = urlParams.get('cat');
    if (category) {
        currentFilters.category = category;
        updateCategoryDisplay(category);
        renderProducts();
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core functionality
    initNavigation();
    initCart();
    initWishlist();
    initForms();
    initTabs();
    initAccordions();
    initModals();
    initSearch();
    initLiveChat();
    initSmoothScrolling();
    
    // Initialize page-specific functionality
    if (window.location.pathname.includes('products.html') || 
        window.location.pathname.includes('category.html')) {
        initProductFilters();
        handleUrlParameters();
    }
    
    if (window.location.pathname.includes('product-detail.html')) {
        initProductDetailPage();
    }
    
    if (window.location.pathname.includes('category.html')) {
        initCategoryPage();
    }
    
    if (window.location.pathname.includes('checkout.html')) {
        initCheckoutProcess();
    }
    
    // Initialize recently viewed on relevant pages
    if (document.getElementById('recently-viewed-products')) {
        renderRecentlyViewed();
    }
    
    // Initialize intersection observer for animations
    if ('IntersectionObserver' in window) {
        initIntersectionObserver();
    }
    
    console.log('TechStore initialized successfully!');
});

// ========================================
// GLOBAL FUNCTIONS (for inline event handlers)
// ========================================

// Make functions available globally for inline event handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.clearCart = clearCart;
window.clearWishlist = clearWishlist;

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showNotification('An error occurred. Please try again.', 'error');
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    });
}

// ========================================
// SERVICE WORKER REGISTRATION (for future PWA support)
// ========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here in a production app
        console.log('Service worker support detected');
    });
}
