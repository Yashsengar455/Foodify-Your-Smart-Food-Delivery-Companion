const restaurants = [
    {
        id: 1,
        name: "Bombay Bites",
        cuisine: "North Indian",
        rating: 4.6,
        menu: [
            { id: 101, name: "Dal Makhani", description: "Creamy black lentils cooked overnight.", price: 250 },
            { id: 102, name: "Paneer Tikka", description: "Cottage cheese marinated in spices and grilled.", price: 320 },
            { id: 103, name: "Butter Chicken", description: "Chicken cooked in a mild tomato gravy.", price: 450 }
        ]
    },
    {
        id: 2,
        name: "Pizza Planet",
        cuisine: "Italian",
        rating: 4.4,
        menu: [
            { id: 201, name: "Pepperoni Pizza", description: "Classic pizza with spicy pepperoni.", price: 450 },
            { id: 202, name: "Garlic Bread", description: "Toasted bread with butter and garlic.", price: 150 },
            { id: 203, name: "Margherita Pizza", description: "Simple tomato, basil, and mozzarella.", price: 350 }
        ]
    },
    {
        id: 3,
        name: "Momo Magic",
        cuisine: "Tibetan",
        rating: 4.2,
        menu: [
            { id: 301, name: "Steamed Chicken Momo", description: "Steamed dumplings with savory chicken filling.", price: 180 },
            { id: 302, name: "Fried Veg Momo", description: "Crispy fried dumplings with vegetable filling.", price: 160 },
            { id: 303, name: "Tingmo & Curry", description: "Fluffy steamed bread served with a side curry.", price: 220 }
        ]
    }
];

let cart = [];

// DOM Elements
const allSections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('.nav-link');
const restaurantCards = document.querySelectorAll('.restaurant-grid .card');
const menuItemsContainer = document.getElementById('menu-items');
const cartSummarySection = document.getElementById('cart-summary');
const cartBox = cartSummarySection.querySelector('.card.cart-box');
const checkoutBtn = document.getElementById('checkout-btn');
const backBtn = document.getElementById('back-to-restaurants');
const placeOrderBtn = document.getElementById('place-order-btn');
const historyContainer = document.getElementById('history-container'); // New DOM element

// Contact Form Validation Elements
const contactForm = document.querySelector('.contact-form form');
const nameInput = contactForm.querySelector('input[type="text"]');
const emailInput = contactForm.querySelector('input[type="email"]');
const messageInput = contactForm.querySelector('textarea');

// --- View Control Functions ---

function updateActiveLink(viewId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        }
    });
}

function showView(viewId) {
    // Hide all main content sections
    allSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Update active navbar link
    updateActiveLink(viewId);

    // Special case for cart and history: update content when navigating to them
    if (viewId === 'cart-summary') {
        updateCartDisplay();
    } else if (viewId === 'order-history') { // New logic
        renderOrderHistory();
    }
}

// --- Cart Logic Functions ---

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartDisplay() {
    const total = calculateTotal();
    
    if (cart.length === 0) {
        cartBox.innerHTML = '<p>No items yet. Start adding delicious meals from the menu!</p>';
        checkoutBtn.style.display = 'none';
        return;
    }

    let cartHtml = '<h4>Items in Cart:</h4><ul style="list-style-type: none; padding: 0;">';
    cart.forEach((item, index) => {
        cartHtml += `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px dotted #eee;">
                <span>${item.quantity}x ${item.name} <br><small>(${item.restaurant})</small></span>
                <span style="font-weight: 600;">₹${item.price * item.quantity}</span>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: red; cursor: pointer;">Remove</button>
            </li>`;
    });
    cartHtml += '</ul>';

    cartHtml += `<div style="margin-top: 15px; border-top: 1px dashed #777; padding-top: 10px;">
                    <strong>Total Amount: ₹${total}</strong>
                </div>`;
    
    cartBox.innerHTML = cartHtml;
    checkoutBtn.style.display = 'block';
}

function addToCart(itemId, restaurantId) {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    const item = restaurant.menu.find(m => m.id === itemId);

    const existingItemIndex = cart.findIndex(i => i.id === itemId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            restaurant: restaurant.name,
            quantity: 1
        });
    }
    updateCartDisplay();
}

function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

// --- Menu Detail Functions (No changes needed) ---

function renderMenuDetail(restaurantId) {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;

    document.getElementById('menu-restaurant-name').textContent = restaurant.name;
    menuItemsContainer.innerHTML = ''; 

    restaurant.menu.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('card');
        itemCard.innerHTML = `
            <div class="pad">
                <h4>${item.name}</h4>
                <p style="font-size: 14px; color: #555;">${item.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <strong>₹${item.price}</strong>
                    <button class="btn" style="padding: 6px 10px; margin-bottom: 0;" onclick="addToCart(${item.id}, ${restaurant.id})">Add to Cart</button>
                </div>
            </div>
        `;
        menuItemsContainer.appendChild(itemCard);
    });

    showView('menu-detail');
}

// --- Checkout and Order History Functions ---

function renderCheckoutPage() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        showView('cart-summary');
        return;
    }
    showView('checkout-page');
    const summaryContainer = document.getElementById('checkout-order-summary');
    const total = calculateTotal();
    
    let summaryHtml = '<ul style="list-style-type: none; padding: 0;">';
    cart.forEach(item => {
        summaryHtml += `<li style="padding: 5px 0;">${item.quantity}x ${item.name} (${item.restaurant}) - ₹${item.price * item.quantity}</li>`;
    });
    summaryHtml += '</ul>';
    
    summaryContainer.innerHTML = summaryHtml;
    placeOrderBtn.textContent = `Place Final Order (Total: ₹${total})`;
}

function handlePlaceOrder() {
    if (cart.length === 0) return;

    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: [...cart], // Deep copy of the cart items
        total: calculateTotal(),
        restaurant: cart[0].restaurant // Simple assumption: all items from one restaurant
    };

    // 1. Get existing history, or initialize an empty array
    const history = JSON.parse(localStorage.getItem('eatzyOrderHistory') || '[]');
    
    // 2. Add the new order
    history.push(newOrder);
    
    // 3. Save updated history back to Local Storage
    localStorage.setItem('eatzyOrderHistory', JSON.stringify(history));

    alert(`Order Confirmed! Total amount: ₹${newOrder.total}. Your food is being prepared.`);
    
    cart = []; // Clear cart
    updateCartDisplay();
    showView('order-history'); // Navigate to history to see the new order
}

function renderOrderHistory() {
    const history = JSON.parse(localStorage.getItem('eatzyOrderHistory') || '[]');
    historyContainer.innerHTML = '';
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">You have no past orders.</p>';
        return;
    }
    
    // Reverse the array to show the newest orders first
    history.slice().reverse().forEach(order => {
        let itemsList = order.items.map(item => 
            `<li>${item.quantity}x ${item.name}</li>`
        ).join('');

        const orderCard = document.createElement('div');
        orderCard.classList.add('card');
        orderCard.innerHTML = `
            <div class="pad">
                <h4 style="color: #ff7a00;">Order #${order.id.toString().slice(-4)}</h4>
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Restaurant:</strong> ${order.restaurant}</p>
                <p style="margin-top: 10px;"><strong>Items:</strong></p>
                <ul style="list-style-type: disc; margin-left: 20px; font-size: 14px;">${itemsList}</ul>
                <h4 style="margin-top: 15px;">Total: ₹${order.total}</h4>
            </div>
        `;
        historyContainer.appendChild(orderCard);
    });
}


// --- Contact Form Validation Logic (Kept for completeness) ---

function validateForm(e) {
    e.preventDefault(); 
    let isValid = true;
    let errorMessages = [];

    nameInput.style.border = '1px solid #ccc';
    emailInput.style.border = '1px solid #ccc';

    if (nameInput.value.trim() === '') {
        errorMessages.push('Name is required.');
        nameInput.style.border = '2px solid red';
        isValid = false;
    }

    if (emailInput.value.trim() === '') {
        errorMessages.push('Email is required.');
        emailInput.style.border = '2px solid red';
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        errorMessages.push('Please enter a valid email address.');
        emailInput.style.border = '2px solid red';
        isValid = false;
    }
    
    if (messageInput.value.trim() === '') {
        errorMessages.push('Message cannot be empty.');
        isValid = false;
    }

    if (!isValid) {
        alert('Please correct the following errors:\n' + errorMessages.join('\n'));
    } else {
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset(); 
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


// --- Event Listeners and Initialization ---

// Universal Nav Link Listener
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');
        showView(viewId);
    });
});

restaurantCards.forEach(card => {
    card.addEventListener('click', (e) => {
        const restaurantId = parseInt(card.getAttribute('data-restaurant-id'));
        renderMenuDetail(restaurantId);
    });
});

backBtn.addEventListener('click', () => {
    showView('menu-list');
});

checkoutBtn.addEventListener('click', renderCheckoutPage);

placeOrderBtn.addEventListener('click', handlePlaceOrder);

contactForm.addEventListener('submit', validateForm);

// Initial setup to ensure 'Home' is visible
showView('home');