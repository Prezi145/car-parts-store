/* app.js - Full application logic
   - product catalog (brand->model->part->year)
   - dynamic dependent dropdowns
   - search
   - cart (with quantity)
   - checkout & invoice (tax, discount, totals)
   - login/register (localStorage-based for demo)
*/

/* ----------------------------
   Data: brands, models, parts
   ---------------------------- */
const carData = {
  Honda: { Civic: ['Engine','Brakes','Suspension','Transmission','Battery'], Accord: ['Engine','Brakes','Transmission'] },
  Toyota: { Corolla: ['Engine','Brakes','Suspension'], Camry: ['Engine','Transmission','Battery'] },
  Subaru: { Impreza: ['Engine','Brakes','Suspension'], Forester: ['Engine','Transmission','Battery'] },
  Mazda: { '3': ['Engine','Brakes','Battery'], '6': ['Engine','Suspension','Transmission'] },
  Mitsubishi: { Lancer: ['Engine','Brakes'], Outlander: ['Engine','Transmission'] },
  Suzuki: { Swift: ['Engine','Brakes'], Vitara: ['Engine','Suspension'] },
  BMW: { '3 Series': ['Engine','Brakes','Suspension'], 'X5': ['Engine','Transmission'] }
};
const YEARS = Array.from({length:14}, (_,i)=>2012+i);

/* ----------------------------
   Product images mapping (part-level)
   Put actual files in images/parts/
   ---------------------------- */
const PART_IMAGES = {
  Engine: 'images/parts/engine.jpg',
  Brakes: 'images/parts/brakes.jpg',
  Suspension: 'images/parts/suspension.jpg',
  Transmission: 'images/parts/transmission.jpg',
  Battery: 'images/parts/battery.jpg'
};

/* ----------------------------
   Build product catalog programmatically
   (one product per brand/model/part/year)
   ---------------------------- */
const PRODUCTS = []; // each: {id, brand, model, part, year, name, price, img}
let pid=1;
for(const brand in carData){
  for(const model in carData[brand]){
    carData[brand][model].forEach(part=>{
      YEARS.forEach(year=>{
        PRODUCTS.push({
          id: pid++,
          brand,
          model,
          part,
          year,
          name: `${brand} ${model} - ${part} (${year})`,
          price: Math.floor(Math.random()*30000) + 3500,
          img: PART_IMAGES[part] || 'images/default.png'
        });
      });
    });
  }
}

/* ----------------------------
   DOM Elements (present on index.html)
   ---------------------------- */
const brandSelectEl = document.getElementById('brand-select');
const modelSelectEl = document.getElementById('model-select');
const partSelectEl  = document.getElementById('part-select');
const yearSelectEl  = document.getElementById('year-select');
const searchInputEl = document.getElementById('search-input');
const productGridEl = document.getElementById('product-grid');

/* Selected filters */
let selBrand='', selModel='', selPart='', selYear='', searchQuery='';

/* Initialize dropdowns on index */
function initFilters(){
  // brand options
  const brands = Object.keys(carData);
  brandSelectEl.innerHTML = `<option value="">All brands</option>` + brands.map(b=>`<option value="${b}">${b}</option>`).join('');
  // year options
  yearSelectEl.innerHTML = `<option value="">Any Year</option>` + YEARS.map(y=>`<option value="${y}">${y}</option>`).join('');
  // model & part start empty
  modelSelectEl.innerHTML = `<option value="">All models</option>`;
  partSelectEl.innerHTML = `<option value="">All parts</option>`;
}
function populateModels(brand){
  modelSelectEl.innerHTML = `<option value="">All models</option>`;
  if(!brand) return;
  Object.keys(carData[brand]).forEach(m=>{
    modelSelectEl.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`);
  });
}
function populateParts(brand, model){
  partSelectEl.innerHTML = `<option value="">All parts</option>`;
  if(!brand || !model) return;
  carData[brand][model].forEach(p=>{
    partSelectEl.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`);
  });
}

/* ----------------------------
   Product rendering & filtering
   ---------------------------- */
function renderProducts(){
  if(!productGridEl) return;
  const filtered = PRODUCTS.filter(p=>{
    if(selBrand && p.brand!==selBrand) return false;
    if(selModel && p.model!==selModel) return false;
    if(selPart && p.part!==selPart) return false;
    if(selYear && String(p.year)!==String(selYear)) return false;
    if(searchQuery){
      const q = searchQuery.toLowerCase();
      if(!(p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.part.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  productGridEl.innerHTML = '';
  if(filtered.length===0){
    productGridEl.innerHTML = `<p class="text-muted">No products match the chosen filters.</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('aria-labelledby', `product-title-${p.id}`);
    card.innerHTML = `
      <img class="product-img" src="${p.img}" alt="${p.name} image" loading="lazy">
      <h3 id="product-title-${p.id}"><img src="images/${p.brand.toLowerCase().replace(/\s+/g,'')}.png" alt="${p.brand} logo" style="width:18px;height:18px;margin-right:8px;vertical-align:middle;">${p.name}</h3>
      <p class="price">JMD ${p.price.toLocaleString()}</p>
      <div class="row">
        <button class="btn" onclick="addToCart(${p.id})" aria-label="Add ${p.name} to cart">Add to cart</button>
        <button class="btn secondary" onclick="viewDetails(${p.id})">Details</button>
      </div>
    `;
    productGridEl.appendChild(card);
  });
}

/* ----------------------------
   Search and event wiring
   ---------------------------- */
function wireFilterEvents(){
  brandSelectEl.addEventListener('change', e=>{
    selBrand = e.target.value;
    populateModels(selBrand);
    selModel=''; selPart=''; selYear='';
    renderProducts();
  });
  modelSelectEl.addEventListener('change', e=>{
    selModel = e.target.value;
    populateParts(selBrand, selModel);
    selPart=''; renderProducts();
  });
  partSelectEl.addEventListener('change', e=>{
    selPart = e.target.value; renderProducts();
  });
  yearSelectEl.addEventListener('change', e=>{
    selYear = e.target.value; renderProducts();
  });
  if(searchInputEl){
    searchInputEl.addEventListener('input', e=>{
      searchQuery = e.target.value.trim(); renderProducts();
    });
  }
}

/* ----------------------------
   Product details (simple modal fallback)
   ---------------------------- */
function viewDetails(pid){
  const p = PRODUCTS.find(x => x.id===pid);
  if(!p) return alert('Product not found');
  alert(`${p.name}\nBrand: ${p.brand}\nModel: ${p.model}\nPart: ${p.part}\nYear: ${p.year}\nPrice: JMD ${p.price.toLocaleString()}`);
}

/* ----------------------------
   Cart: structure, add/remove/update, persisted in localStorage
   Stored as array of {id, qty}
   ---------------------------- */
const CART_KEY = 'cps_cart_v1';
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }

function addToCart(productId){
  const cart = getCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing) existing.qty += 1; else cart.push({id: productId, qty: 1});
  saveCart(cart);
  alert('Added to cart');
}

function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-count').forEach(el=>el.textContent = count);
}

/* Utility: get product by id (fast) */
function getProductById(id){ return PRODUCTS.find(p=>p.id===id); }

/* ----------------------------
   Cart page rendering (cart.html)
   - shows name, price, quantity, sub-total, tax, discount, total
   - discount is demonstration: 5% if subtotal > 100000 JMD
   - tax rate: 12.5% (example)
   ---------------------------- */
function renderCartPage(){
  const container = document.getElementById('cart-container');
  if(!container) return;
  const cart = getCart();
  if(cart.length===0){ container.innerHTML = '<p class="text-muted">Your cart is empty.</p>'; return; }

  let html = `<table class="table" aria-live="polite"><thead><tr>
    <th>#</th><th>Product</th><th>Price (JMD)</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr></thead><tbody>`;
  let subtotal=0;
  cart.forEach((entry, idx)=>{
    const p = getProductById(entry.id);
    const line = p.price * entry.qty;
    subtotal += line;
    html += `<tr>
      <td>${idx+1}</td>
      <td>${p.name}</td>
      <td>${p.price.toLocaleString()}</td>
      <td><input type="number" aria-label="Quantity for ${p.name}" min="1" value="${entry.qty}" style="width:72px" onchange="setCartQty(${entry.id}, this.value)"></td>
      <td>${line.toLocaleString()}</td>
      <td><button class="btn ghost" onclick="removeFromCart(${entry.id})">Remove</button></td>
    </tr>`;
  });
  const discount = subtotal > 100000 ? Math.round(subtotal * 0.05) : 0;
  const taxRate = 0.125;
  const tax = Math.round((subtotal - discount) * taxRate);
  const total = subtotal - discount + tax;
  html += `</tbody></table>
    <div class="form-card">
      <p class="text-muted">Subtotal: JMD ${subtotal.toLocaleString()}</p>
      <p class="text-muted">Discount: JMD ${discount.toLocaleString()}</p>
      <p class="text-muted">Tax (${(taxRate*100).toFixed(1)}%): JMD ${tax.toLocaleString()}</p>
      <p style="font-weight:700">Total: JMD ${total.toLocaleString()}</p>
      <div style="display:flex; gap:8px; margin-top:12px;">
        <button class="btn" onclick="checkoutNow()">Check Out</button>
        <button class="btn secondary" onclick="clearCart()">Clear All</button>
      </div>
    </div>`;
  container.innerHTML = html;
}

/* Cart helpers */
function setCartQty(productId, qty){
  qty = parseInt(qty) || 1;
  const cart = getCart();
  const item = cart.find(i=>i.id===productId);
  if(item) item.qty = qty;
  saveCart(cart);
  renderCartPage();
}
function removeFromCart(productId){
  let cart = getCart();
  cart = cart.filter(i=>i.id!==productId);
  saveCart(cart);
  renderCartPage();
}
function clearCart(){
  if(!confirm('Clear all items from cart?')) return;
  saveCart([]);
  renderCartPage();
}
function checkoutNow(){
  // navigate to checkout page
  window.location.href = 'checkout.html';
}

/* ----------------------------
   Checkout page: gather shipping details, confirm
   store order as 'lastOrder' in localStorage (for invoice)
   ---------------------------- */
function renderCheckoutPage(){
  const cart = getCart();
  const tableBody = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  if(!tableBody) return;
  if(cart.length===0){ tableBody.innerHTML = '<tr><td colspan="4">Cart is empty</td></tr>'; totalEl.textContent = ''; return; }
  let subtotal=0;
  tableBody.innerHTML = '';
  cart.forEach((e, idx)=>{
    const p = getProductById(e.id);
    const line = p.price * e.qty;
    subtotal += line;
    tableBody.insertAdjacentHTML('beforeend', `<tr><td>${idx+1}</td><td>${p.name}</td><td>${e.qty}</td><td>JMD ${line.toLocaleString()}</td></tr>`);
  });
  const discount = subtotal > 100000 ? Math.round(subtotal * 0.05) : 0;
  const tax = Math.round((subtotal - discount) * 0.125);
  const total = subtotal - discount + tax;
  totalEl.textContent = `JMD ${total.toLocaleString()}`;
  // store breakdown in data-* so confirm can read
  document.getElementById('checkout-form').dataset.subtotal = subtotal;
  document.getElementById('checkout-form').dataset.discount = discount;
  document.getElementById('checkout-form').dataset.tax = tax;
  document.getElementById('checkout-form').dataset.total = total;
}

/* confirm checkout - called on form submit in checkout.html */
function confirmCheckout(event){
  event.preventDefault();
  const form = document.getElementById('checkout-form');
  const name = form['ship-name'].value.trim();
  const address = form['ship-address'].value.trim();
  const phone = form['ship-phone'].value.trim();
  if(!name || !address || !phone){ alert('Please fill shipping details'); return; }

  const cart = getCart();
  if(cart.length===0){ alert('Cart is empty'); return; }

  const order = {
    id: 'INV' + Date.now(),
    date: new Date().toISOString(),
    name, address, phone,
    items: cart.map(c=>{
      const p = getProductById(c.id);
      return { id: p.id, name: p.name, price: p.price, qty: c.qty };
    }),
    subtotal: Number(form.dataset.subtotal) || 0,
    discount: Number(form.dataset.discount) || 0,
    tax: Number(form.dataset.tax) || 0,
    total: Number(form.dataset.total) || 0
  };

  localStorage.setItem('lastOrder', JSON.stringify(order));
  // clear cart
  saveCart([]);
  alert('Order confirmed! Redirecting to invoice...');
  window.location.href = 'invoice.html';
}

/* ----------------------------
   Invoice rendering
   ---------------------------- */
function renderInvoicePage(){
  const region = document.getElementById('invoice-content');
  const order = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  if(!region) return;
  if(!order){ region.innerHTML = '<p class="text-muted">No recent invoice available.</p>'; return;}
  const date = new Date(order.date).toLocaleString();
  let html = `<div class="form-card"><h2>Invoice: ${order.id}</h2><p>Date: ${date}</p>
    <p><strong>Customer:</strong> ${order.name}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <table class="table"><thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Line</th></tr></thead><tbody>`;
  order.items.forEach((it, idx)=>{
    html += `<tr><td>${idx+1}</td><td>${it.name}</td><td>${it.qty}</td><td>JMD ${it.price.toLocaleString()}</td><td>JMD ${(it.price*it.qty).toLocaleString()}</td></tr>`;
  });
  html += `</tbody></table>
    <p class="text-muted">Subtotal: JMD ${order.subtotal.toLocaleString()}</p>
    <p class="text-muted">Discount: JMD ${order.discount.toLocaleString()}</p>
    <p class="text-muted">Tax: JMD ${order.tax.toLocaleString()}</p>
    <p style="font-weight:700">Total: JMD ${order.total.toLocaleString()}</p>
    <p class="text-muted">Thank you for shopping with us.</p>
  </div>`;
  region.innerHTML = html;
}

/* ----------------------------
   Login & Register (localStorage demo)
   - registration stores users in localStorage (username,email,password)
   - login sets loggedInUser in localStorage and updates nav
   ---------------------------- */
function registerUser(event){
  if(event) event.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const fullname = document.getElementById('reg-name').value.trim();
  const dob = document.getElementById('reg-dob').value;
  if(!username||!password||!email||!fullname||!dob){ alert('Please fill all registration fields'); return; }
  const users = JSON.parse(localStorage.getItem('cps_users')||'[]');
  if(users.find(u=>u.username===username)){ alert('Username exists'); return;}
  users.push({ username, password, email, fullname, dob });
  localStorage.setItem('cps_users', JSON.stringify(users));
  alert('Registration successful. Please log in.');
  document.getElementById('register-form').reset();
}

function loginUser(event){
  if(event) event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const users = JSON.parse(localStorage.getItem('cps_users')||'[]');
  const user = users.find(u=>u.username===username && u.password===password);
  if(!user){ alert('Invalid credentials'); return; }
  localStorage.setItem('cps_loggedIn', JSON.stringify({ username: user.username, fullname: user.fullname, email: user.email }));
  alert('Login successful');
  updateNavForAuth();
  document.getElementById('login-form')?.reset();
}

/* Update nav to hide login/register if logged in */
function updateNavForAuth(){
  const logged = JSON.parse(localStorage.getItem('cps_loggedIn') || 'null');
  document.querySelectorAll('.auth-area').forEach(el=>{
    if(logged){
      el.innerHTML = `<span class="text-muted">Welcome, ${logged.username}</span> <a href="#" id="logout-link" class="btn ghost">Logout</a>`;
      document.getElementById('logout-link').addEventListener('click', e=>{ e.preventDefault(); localStorage.removeItem('cps_loggedIn'); updateNavForAuth(); });
    } else {
      el.innerHTML = `<a href="login.html" class="btn ghost">Login</a> <a href="register.html" class="btn ghost">Register</a>`;
    }
  });
}

/* ----------------------------
   Global init
   ---------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // index page elements exist?
  if(brandSelectEl){ initFilters(); wireFilterEvents(); updateCartCount(); renderProducts(); }
  // cart page
  if(document.getElementById('cart-container')){ renderCartPage(); updateCartCount(); }
  // checkout page
  if(document.getElementById('checkout-items')){ renderCheckoutPage(); updateCartCount(); document.getElementById('checkout-form')?.addEventListener('submit', confirmCheckout); }
  // invoice page
  if(document.getElementById('invoice-content')){ renderInvoicePage(); }
  // login/register forms
  document.getElementById('register-form')?.addEventListener('submit', registerUser);
  document.getElementById('login-form')?.addEventListener('submit', loginUser);
  updateNavForAuth();
});
