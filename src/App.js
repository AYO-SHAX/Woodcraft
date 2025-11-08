import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// API Configuration
const API_CONFIG = {
  apiUrl: process.env.REACT_APP_API_URL,
  cognitoUserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  region: process.env.REACT_APP_AWS_REGION,
  s3BucketUrl: process.env.REACT_APP_S3_BUCKET_URL
};

// API Service Functions
const apiService = {
  async signup(email, username, password) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async verifyEmail(email, code) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async login(identifier, password) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createCustomRequest(requestData, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/custom-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCustomRequests(token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/custom-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async sendInvoice(requestId, amount, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, amount })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async rejectRequest(requestId, reason, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, reason })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async addToDelivery(requestId, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async generateAIImage(roomImage, prompt, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/ai/generate-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomImage, prompt })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // NEW METHOD - ADD THIS:
  async getGenerationStatus(generationId, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/ai/generation/${generationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async requestAIAccess(token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/ai/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAIAccessRequests(token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/ai-access-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async grantAIAccess(userId, hours, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/grant-ai-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, hours })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async rejectAIAccess(requestId, reason, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/admin/reject-ai-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, reason })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async checkAIAccess(token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/ai/check-access`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, hasAccess: false };
    }
  },

  async getFurniture(category = null) {
    try {
      const url = category 
        ? `${API_CONFIG.apiUrl}/furniture?category=${category}`
        : `${API_CONFIG.apiUrl}/furniture`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async searchFurniture(query) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/furniture/search?query=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async getFurnitureById(id) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/furniture/${id}`);
      return await response.json();
    } catch (error) {
      return { success: false, data: null };
    }
  },

  async createFurniture(furnitureData, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/furniture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(furnitureData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async sendMessage(toUserId, message, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId, message })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getMessages(otherUserId, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async getConversations(token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  async closeConversation(otherUserId, token) {
    try {
      const response = await fetch(`${API_CONFIG.apiUrl}/messages/close/${otherUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

const FurnitureApp = () => {
  const [currentPage, setCurrentPage] = useState('intro');
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [basket, setBasket] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [history, setHistory] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [aiAccessRequests, setAiAccessRequests] = useState([]);

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setIsAdmin(false);
    setCurrentPage('intro');
  };

  const addToBasket = (item) => {
    const existing = basket.find(b => b.id === item.id);
    if (existing) {
      setBasket(basket.map(b => b.id === item.id ? {...b, quantity: b.quantity + 1} : b));
    } else {
      setBasket([...basket, {...item, quantity: 1}]);
    }
  };

  const removeFromBasket = (itemId) => {
    setBasket(basket.filter(b => b.id !== itemId));
  };

  const updateBasketQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromBasket(itemId);
    } else {
      setBasket(basket.map(b => b.id === itemId ? {...b, quantity} : b));
    }
  };

  return (
    <div className="app">
      {currentPage === 'intro' && <IntroPage setCurrentPage={setCurrentPage} setSelectedItem={setSelectedItem} />}
      {currentPage === 'signup' && <SignupPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} setAuthToken={setAuthToken} setIsAdmin={setIsAdmin} />}
      {currentPage === 'forgot-password' && <ForgotPasswordPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'item-details' && selectedItem && (
        <ItemDetailsPage 
          item={selectedItem} 
          setCurrentPage={setCurrentPage} 
          addToBasket={addToBasket}
          currentUser={currentUser}
          authToken={authToken}
          handleLogout={handleLogout}
        />
      )}
      {currentPage === 'basket' && (
        <BasketPage 
          basket={basket}
          updateQuantity={updateBasketQuantity}
          removeItem={removeFromBasket}
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
          handleLogout={handleLogout}
        />
      )}
      {currentPage === 'home' && !isAdmin && (
        <HomePage 
          setCurrentPage={setCurrentPage} 
          currentUser={currentUser}
          basket={basket}
          delivery={delivery}
          history={history}
          handleLogout={handleLogout}
          setSelectedItem={setSelectedItem}
          authToken={authToken}
        />
      )}
      {currentPage === 'custom' && !isAdmin && (
        <CustomPage 
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
          authToken={authToken}
          customRequests={customRequests}
          setCustomRequests={setCustomRequests}
          history={history}
          setHistory={setHistory}
          handleLogout={handleLogout}
        />
      )}
      {currentPage === 'chat' && (
        <ChatPage
          currentUser={currentUser}
          authToken={authToken}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          isAdmin={isAdmin}
        />
      )}
      {currentPage === 'admin' && isAdmin && (
        <AdminPage
          authToken={authToken}
          customRequests={customRequests}
          setCustomRequests={setCustomRequests}
          delivery={delivery}
          setDelivery={setDelivery}
          aiAccessRequests={aiAccessRequests}
          setAiAccessRequests={setAiAccessRequests}
          handleLogout={handleLogout}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

// INTRO PAGE
const IntroPage = ({ setCurrentPage, setSelectedItem }) => {
  const [featuredItems] = useState([
    { id: 1, name: 'Modern Oak Dining Table', price: 899, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', desc: 'Elegant solid oak with minimalist design', category: 'Tables' },
    { id: 2, name: 'Luxury Velvet Sofa', price: 1299, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', desc: 'Premium velvet upholstery', category: 'Sofas' },
    { id: 3, name: 'Scandinavian Bookshelf', price: 549, image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400', desc: 'Clean lines with natural wood', category: 'Shelves' },
    { id: 4, name: 'Artisan Coffee Table', price: 699, image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400', desc: 'Handcrafted walnut', category: 'Tables' }
  ]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setCurrentPage('item-details');
  };

  return (
    <div className="intro-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">🪑 WoodCraft Studio</div>
          <div className="nav-buttons">
            <button onClick={() => setCurrentPage('signup')} className="btn btn-outline">Sign Up</button>
            <button onClick={() => setCurrentPage('login')} className="btn btn-primary">Login</button>
          </div>
        </div>
      </nav>
      <div className="container">
        <div className="hero-section">
          <h1>Craft Your Perfect Space</h1>
          <p className="subtitle">Discover premium furniture and custom woodwork tailored to your style</p>
        </div>
        <section className="featured-section">
          <h2>New & Popular</h2>
          <div className="featured-grid">
            {featuredItems.map(item => (
              <div key={item.id} className="featured-card" onClick={() => handleItemClick(item)} style={{cursor: 'pointer'}}>
                <div className="featured-image"><img src={item.image} alt={item.name} /></div>
                <div className="featured-content">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <div className="price">${item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="cta-section">
          <div className="cta-content">
            <div className="cta-icon">📸</div>
            <h2>AI-Powered Room Redesign</h2>
            <p>Upload a photo of your room and watch as our AI transforms it with perfect furniture placement.</p>
            <div className="features-grid">
              <div className="feature-box">
                <div className="feature-icon">📸</div>
                <h3>Upload Your Room</h3>
                <p>Take a photo and let AI do the magic</p>
              </div>
              <div className="feature-box">
                <div className="feature-icon">✨</div>
                <h3>AI Redesign</h3>
                <p>Get professional designs instantly</p>
              </div>
              <div className="feature-box">
                <div className="feature-icon">🎨</div>
                <h3>Customize & Order</h3>
                <p>Edit designs and get real quotes</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ITEM DETAILS PAGE
const ItemDetailsPage = ({ item, setCurrentPage, addToBasket, currentUser, authToken, handleLogout }) => {
  const [relatedItems] = useState([
    { id: 5, name: 'Oak Dining Chair', price: 199, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400', category: item.category },
    { id: 6, name: 'Modern Side Table', price: 299, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400', category: item.category },
    { id: 7, name: 'Wooden Console', price: 449, image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400', category: item.category }
  ]);

  const handleAddToBasket = () => {
    addToBasket(item);
    alert('Added to basket!');
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-container">
          <button onClick={() => setCurrentPage(currentUser ? 'home' : 'intro')} className="back-button">← Back</button>
          <div className="logo">🪑 WoodCraft Studio</div>
          {currentUser && (
            <div className="user-section">
              <button onClick={() => setCurrentPage('basket')} className="btn btn-outline">🛒 Basket</button>
              <button onClick={handleLogout} className="btn btn-text">Logout</button>
            </div>
          )}
        </div>
      </nav>
      <div className="container">
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem'}}>
          <div>
            <img src={item.image} alt={item.name} style={{width: '100%', borderRadius: '1rem'}} />
          </div>
          <div>
            <h1>{item.name}</h1>
            <div className="price-large">${item.price}</div>
            <p style={{fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '2rem'}}>{item.desc}</p>
            
            <div style={{marginBottom: '2rem'}}>
              <h3>Product Details</h3>
              <ul style={{lineHeight: '2'}}>
                <li>Category: {item.category}</li>
                <li>Material: Premium hardwood</li>
                <li>Finish: Natural oil finish</li>
                <li>Assembly: Easy assembly required</li>
                <li>Warranty: 5 year manufacturer warranty</li>
              </ul>
            </div>

            <button onClick={handleAddToBasket} className="btn btn-primary btn-large btn-block" style={{marginBottom: '1rem'}}>
              🛒 Add to Basket
            </button>
            <button onClick={() => setCurrentPage('chat')} className="btn btn-outline btn-block">
              💬 Contact Support
            </button>
          </div>
        </div>

        <section>
          <h2>More in {item.category}</h2>
          <div className="featured-grid">
            {relatedItems.map(relatedItem => (
              <div key={relatedItem.id} className="featured-card" onClick={() => window.location.reload()} style={{cursor: 'pointer'}}>
                <div className="featured-image"><img src={relatedItem.image} alt={relatedItem.name} /></div>
                <div className="featured-content">
                  <h3>{relatedItem.name}</h3>
                  <div className="price">${relatedItem.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// BASKET PAGE
const BasketPage = ({ basket, updateQuantity, removeItem, setCurrentPage, currentUser, handleLogout }) => {
  const total = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-container">
          <button onClick={() => setCurrentPage('home')} className="back-button">← Back</button>
          <div className="logo">🪑 WoodCraft Studio</div>
          <div className="user-section">
            <span>Welcome, <strong>{currentUser?.username}</strong></span>
            <button onClick={handleLogout} className="btn btn-text">Logout</button>
          </div>
        </div>
      </nav>
      <div className="container">
        <h1>Your Basket</h1>
        
        {basket.length === 0 ? (
          <div className="empty-state">
            <p>Your basket is empty</p>
            <button onClick={() => setCurrentPage('home')} className="btn btn-primary">Continue Shopping</button>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
            <div>
              {basket.map(item => (
                <div key={item.id} className="content-card" style={{marginBottom: '1rem', display: 'flex', gap: '1.5rem'}}>
                  <img src={item.image} alt={item.name} style={{width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.5rem'}} />
                  <div style={{flex: 1}}>
                    <h3>{item.name}</h3>
                    <p className="price">${item.price}</p>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem'}}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-small">-</button>
                      <span style={{padding: '0 1rem'}}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-small">+</button>
                      <button onClick={() => removeItem(item.id)} className="btn btn-outline btn-small" style={{marginLeft: 'auto'}}>Remove</button>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <strong style={{fontSize: '1.25rem'}}>${item.price * item.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="content-card" style={{height: 'fit-content'}}>
              <h3>Order Summary</h3>
              <div style={{marginTop: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Subtotal:</span>
                  <span>${total}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Shipping:</span>
                  <span>$50</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', marginTop: '1rem', fontSize: '1.25rem', fontWeight: '700'}}>
                  <span>Total:</span>
                  <span>${total + 50}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-block" style={{marginTop: '1.5rem'}}>Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SIGNUP PAGE
const SignupPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [step, setStep] = useState('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await apiService.signup(formData.email, formData.username, formData.password);
    if (result.success) {
      alert(`Verification code sent to ${formData.email}`);
      setStep('verify');
    } else {
      alert(result.error || 'Signup failed');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    const result = await apiService.verifyEmail(formData.email, verificationCode);
    if (result.success) {
      setStep('success');
    } else {
      alert(result.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={() => setCurrentPage('intro')} className="back-button">← Back</button>
        <h2>Create Account</h2>
        {step === 'form' && (
          <div className="form-container">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="username" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-block">{loading ? 'Creating...' : 'Sign Up'}</button>
          </div>
        )}
        {step === 'verify' && (
          <div className="form-container">
            <p className="text-center">Enter verification code</p>
            <div className="form-group">
              <label>Verification Code</label>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="000000" className="code-input" />
            </div>
            <button onClick={handleVerify} disabled={loading} className="btn btn-primary btn-block">{loading ? 'Verifying...' : 'Verify'}</button>
          </div>
        )}
        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h3>Signup Successful!</h3>
            <p>Your account has been created</p>
            <button onClick={() => setCurrentPage('login')} className="btn btn-primary btn-block">Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

// LOGIN PAGE
const LoginPage = ({ setCurrentPage, setCurrentUser, setAuthToken, setIsAdmin }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await apiService.login(formData.identifier, formData.password);
    if (result.success) {
      setCurrentUser(result.user);
      setAuthToken(result.token);
      if (result.user.role === 'admin') {
        setIsAdmin(true);
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    } else {
      alert(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={() => setCurrentPage('intro')} className="back-button">← Back</button>
        <h2>Welcome Back</h2>
        <div className="form-container">
          <div className="form-group">
            <label>Email or Username</label>
            <input type="text" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} placeholder="email or username" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button onClick={() => setCurrentPage('forgot-password')} className="link-button">Forgot Password?</button>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-block">{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </div>
    </div>
  );
};

// FORGOT PASSWORD PAGE
const ForgotPasswordPage = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={() => setCurrentPage('login')} className="back-button">← Back</button>
        <h2>Reset Password</h2>
        {!sent ? (
          <div className="form-container">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button onClick={() => { if(email) setSent(true); }} className="btn btn-primary btn-block">Send Reset Link</button>
          </div>
        ) : (
          <div className="success-container">
            <div className="success-icon">📧</div>
            <p>Check your email for reset instructions</p>
          </div>
        )}
      </div>
    </div>
  );
};

// HOME PAGE WITH SEARCH
const HomePage = ({ setCurrentPage, currentUser, basket, delivery, history, handleLogout, setSelectedItem, authToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const categories = ['Tables', 'Chairs', 'Sofas', 'Cabinets', 'Beds', 'Desks', 'Shelves', 'Outdoor'];
  const newArrivals = [
    { id: 8, name: 'Industrial Loft Table', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600', price: 799, desc: 'Reclaimed wood with metal frame', category: 'Tables' },
    { id: 9, name: 'Mid-Century Chair', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', price: 349, desc: 'Classic design', category: 'Chairs' },
    { id: 10, name: 'Minimalist Wardrobe', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600', price: 1199, desc: 'Sleek storage', category: 'Cabinets' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const result = await apiService.searchFurniture(searchQuery);
    if (result.success) {
      setSearchResults(result.data);
      setShowResults(true);
    }
  };

  const handleCategoryClick = async (category) => {
    const result = await apiService.getFurniture(category);
    if (result.success) {
      setSearchResults(result.data);
      setShowResults(true);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setCurrentPage('item-details');
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">🪑 WoodCraft Studio</div>
          <div className="user-section">
            <button onClick={() => setCurrentPage('basket')} className="btn btn-outline">🛒 Basket ({basket.length})</button>
            <button onClick={() => setCurrentPage('chat')} className="btn btn-outline">💬 Chat</button>
            <span>Welcome, <strong>{currentUser?.username}</strong></span>
            <button onClick={handleLogout} className="btn btn-text">Logout</button>
          </div>
        </div>
        <div className="navbar-container">
          <form onSubmit={handleSearch} className="search-bar" style={{display: 'flex', gap: '0.5rem'}}>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search furniture or categories..." 
              style={{flex: 1}}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </nav>
      
      <div className="container">
        {showResults ? (
          <div>
            <button onClick={() => setShowResults(false)} className="back-button">← Back to Home</button>
            <h2>Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <div className="empty-state">No items found</div>
            ) : (
              <div className="featured-grid">
                {searchResults.map(item => (
                  <div key={item.itemId} className="featured-card" onClick={() => handleItemClick(item)} style={{cursor: 'pointer'}}>
                    <div className="featured-image"><img src={item.image} alt={item.name} /></div>
                    <div className="featured-content">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="price">${item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon basket">🛒</div>
                <h3>Basket</h3>
                <div className="card-value">{basket.length}</div>
                <p>Items pending</p>
              </div>
              <div className="dashboard-card">
                <div className="card-icon delivery">📦</div>
                <h3>In Delivery</h3>
                <div className="card-value">{delivery.length}</div>
                <p>Being delivered</p>
              </div>
              <div className="dashboard-card">
                <div className="card-icon history">✅</div>
                <h3>History</h3>
                <div className="card-value">{history.length}</div>
                <p>Completed orders</p>
              </div>
            </div>
            
            <section>
              <h2>Browse Categories</h2>
              <div className="categories-grid">
                {categories.map(cat => (
                  <button key={cat} className="category-card" onClick={() => handleCategoryClick(cat)}>
                    <div className="category-icon">🪵</div>
                    <p>{cat}</p>
                  </button>
                ))}
              </div>
            </section>
            
            <section>
              <h2>New Arrivals</h2>
              <div className="carousel">
                <div className="carousel-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {newArrivals.map((item) => (
                    <div key={item.id} className="carousel-slide">
                      <div className="slide-image"><img src={item.image} alt={item.name} /></div>
                      <div className="slide-content">
                        <h3>{item.name}</h3>
                        <p>{item.desc}</p>
                        <div className="price-large">${item.price}</div>
                        <button onClick={() => handleItemClick(item)} className="btn btn-primary">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCurrentSlide((currentSlide - 1 + newArrivals.length) % newArrivals.length)} className="carousel-btn carousel-btn-prev">‹</button>
                <button onClick={() => setCurrentSlide((currentSlide + 1) % newArrivals.length)} className="carousel-btn carousel-btn-next">›</button>
              </div>
            </section>
            
            <section className="custom-cta">
              <h2>Create Custom Furniture</h2>
              <p>Design your perfect piece or transform your room with AI</p>
              <button onClick={() => setCurrentPage('custom')} className="btn btn-large">Start Customizing</button>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

// CHAT PAGE
const ChatPage = ({ currentUser, authToken, setCurrentPage, handleLogout, isAdmin }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.otherUserId);
      const interval = setInterval(() => loadMessages(selectedConversation.otherUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    const result = await apiService.getConversations(authToken);
    if (result.success) {
      setConversations(result.data);
    }
  };

  const loadMessages = async (otherUserId) => {
    const result = await apiService.getMessages(otherUserId, authToken);
    if (result.success) {
      setMessages(result.data);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setLoading(true);
    const result = await apiService.sendMessage(selectedConversation.otherUserId, newMessage, authToken);
    if (result.success) {
      setNewMessage('');
      loadMessages(selectedConversation.otherUserId);
    }
    setLoading(false);
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    
    const result = await apiService.closeConversation(selectedConversation.otherUserId, authToken);
    if (result.success) {
      alert('Conversation closed');
      setSelectedConversation(null);
      loadConversations();
    }
  };

  const startNewConversation = () => {
    if (!isAdmin) {
      setSelectedConversation({ otherUserId: 'admin', otherUsername: 'Support Team' });
      setMessages([]);
    }
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-container">
          <button onClick={() => setCurrentPage(isAdmin ? 'admin' : 'home')} className="back-button">← Back</button>
          <div className="logo">💬 Messages</div>
          <div className="user-section">
            <span>Welcome, <strong>{currentUser?.username}</strong></span>
            <button onClick={handleLogout} className="btn btn-text">Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: '600px'}}>
          <div className="content-card" style={{overflow: 'auto'}}>
            <h3>Conversations</h3>
            {!isAdmin && (
              <button onClick={startNewConversation} className="btn btn-primary btn-block" style={{marginBottom: '1rem'}}>
                New Message to Support
              </button>
            )}
            {conversations.length === 0 ? (
              <p style={{color: '#6b7280', textAlign: 'center', marginTop: '2rem'}}>No conversations</p>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.otherUserId} 
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.otherUserId === conv.otherUserId ? '#fef3c7' : 'transparent',
                    marginBottom: '0.5rem'
                  }}
                >
                  <strong>{conv.otherUsername}</strong>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0'}}>
                    {conv.lastMessage?.substring(0, 30)}...
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div className="content-card" style={{display: 'flex', flexDirection: 'column'}}>
            {selectedConversation ? (
              <>
                <div style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3>{selectedConversation.otherUsername}</h3>
                  {isAdmin && (
                    <button onClick={handleCloseConversation} className="btn btn-outline btn-small">
                      Close Conversation
                    </button>
                  )}
                </div>
                
                <div style={{flex: 1, overflow: 'auto', marginBottom: '1rem'}}>
                  {messages.length === 0 ? (
                    <p style={{color: '#6b7280', textAlign: 'center'}}>No messages yet</p>
                  ) : (
                    messages.map(msg => (
                      <div 
                        key={msg.messageId} 
                        style={{
                          marginBottom: '1rem',
                          display: 'flex',
                          justifyContent: msg.fromUserId === currentUser.userId ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '0.75rem 1rem',
                          borderRadius: '1rem',
                          backgroundColor: msg.fromUserId === currentUser.userId ? '#d97706' : '#f3f4f6',
                          color: msg.fromUserId === currentUser.userId ? 'white' : '#111827'
                        }}>
                          <p style={{margin: 0}}>{msg.message}</p>
                          <small style={{opacity: 0.7, fontSize: '0.75rem'}}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    style={{flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem'}}
                  />
                  <button onClick={handleSendMessage} disabled={loading} className="btn btn-primary">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280'}}>
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// REPLACE YOUR EXISTING CustomPage COMPONENT WITH THIS
// Keep everything else in your App.js the same!
// ===========================================

const CustomPage = ({ setCurrentPage, currentUser, authToken, customRequests, setCustomRequests, history, setHistory, handleLogout }) => {
  const [mode, setMode] = useState('description');
  const [description, setDescription] = useState('');
  const [roomImage, setRoomImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [userPreferences, setUserPreferences] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [hasAIAccess, setHasAIAccess] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const [accessTimeRemaining, setAccessTimeRemaining] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const fileInputRef = useRef(null);
  const roomInputRef = useRef(null);
  const canvasRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    checkAIAccess();
    const interval = setInterval(checkAIAccess, 60000);
    return () => {
      clearInterval(interval);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const checkAIAccess = async () => {
    const result = await apiService.checkAIAccess(authToken);
    if (result.success) {
      setHasAIAccess(result.hasAccess);
      setAccessTimeRemaining(result.timeRemaining);
      setAccessRequested(result.requestPending);
    }
  };

  const handleRequestAccess = async () => {
    const result = await apiService.requestAIAccess(authToken);
    if (result.success) {
      alert('✅ Access request sent to admin!');
      setAccessRequested(true);
    } else {
      alert('❌ Failed to request access: ' + (result.error || 'Unknown error'));
    }
  };

  const handleDescriptionSubmit = async () => {
    if (!description) return;
    const request = {
      type: 'description',
      content: description,
      preferences: userPreferences.filter(p => p.trim())
    };
    const result = await apiService.createCustomRequest(request, authToken);
    if (result.success) {
      alert('✅ Request sent to admin!');
      setDescription('');
      setUserPreferences(['']);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const request = {
          type: 'image',
          content: event.target.result,
          preferences: userPreferences.filter(p => p.trim())
        };
        apiService.createCustomRequest(request, authToken);
        alert('✅ Image sent to admin!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRoomImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIGenerate = async () => {
    if (!roomImage || !prompt) {
      alert('⚠️ Please upload room image and enter prompt');
      return;
    }
    
    if (!hasAIAccess) {
      alert('🔒 You need AI access to generate images. Please request access first.');
      return;
    }

    setLoading(true);
    setGenerationProgress('🚀 Starting AI generation...');
    
    // Step 1: Start the generation
    const startResult = await apiService.generateAIImage(roomImage, prompt, authToken);
    
    if (!startResult.success) {
      alert('❌ Failed to start generation: ' + (startResult.error || 'Unknown error'));
      setLoading(false);
      setGenerationProgress('');
      return;
    }

    const generationId = startResult.generationId;
    console.log('✅ Generation started:', generationId);
    setGenerationProgress('🔍 Analyzing your room with AI Vision...');

    // Step 2: Poll for completion
    let pollCount = 0;
    const maxPolls = 50; // 50 polls * 3 seconds = 2.5 minutes max
    
    pollIntervalRef.current = setInterval(async () => {
      pollCount++;
      
      // Update progress message
      if (pollCount === 5) {
        setGenerationProgress('🎨 Generating your design with DALL-E 3...');
      } else if (pollCount === 10) {
        setGenerationProgress('✨ Almost there... creating your custom design...');
      } else if (pollCount > 15 && pollCount % 5 === 0) {
        setGenerationProgress(`⏳ Still generating... (${pollCount * 3} seconds elapsed)`);
      }

      const statusResult = await apiService.getGenerationStatus(generationId, authToken);
      
      if (!statusResult.success) {
        console.error('❌ Status check failed:', statusResult.error);
        return;
      }

      if (statusResult.data) {
        const generation = statusResult.data;
        console.log('📊 Generation status:', generation.status);
        
        if (generation.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          setLoading(false);
          setGenerationProgress('');
          
          console.log('✅ Generation completed! Image URL:', generation.generatedImageUrl);
          
          // Add watermark protection
          const protectedImage = await addWatermarkAndProtection(generation.generatedImageUrl);
          setGeneratedImage(protectedImage);
          
          setHistory([...history, {
            id: Date.now(),
            image: protectedImage,
            prompt: prompt,
            date: new Date().toISOString(),
            roomAnalysis: generation.roomAnalysis
          }]);
          
          alert('✨ Image generated successfully!');
          
        } else if (generation.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setLoading(false);
          setGenerationProgress('');
          alert('❌ Generation failed: ' + (generation.error || 'Unknown error. Please try again.'));
        } else if (generation.status === 'generating') {
          // Still processing - Vision completed, DALL-E in progress
          if (pollCount === 8) {
            setGenerationProgress('🎨 Room analyzed! Now generating your design...');
          }
        }
      }

      if (pollCount >= maxPolls) {
        clearInterval(pollIntervalRef.current);
        setLoading(false);
        setGenerationProgress('');
        alert('⏱️ Generation timed out after 2.5 minutes.\n\nPossible causes:\n• OpenAI API is experiencing delays\n• Your API key has rate limits\n• The request failed\n\nPlease try again or contact support.');
      }
    }, 3000);
  };

  const addWatermarkAndProtection = async (imageUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = '30px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('WoodCraft Studio - Confidential', 50, 50);
        
        // Add diagonal watermark
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.font = '60px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillText('PREVIEW ONLY', -200, 0);
        ctx.restore();
        
        resolve(canvas.toDataURL());
      };
      img.onerror = () => {
        console.error('❌ Failed to load image for watermark');
        resolve(imageUrl); // Return original if watermark fails
      };
      img.src = imageUrl;
    });
  };

  const handleSendToAdmin = async () => {
    if (!generatedImage) return;
    
    const request = {
      type: 'ai-generated',
      generatedImage: generatedImage,
      roomImage: roomImage,
      prompt: prompt,
      preferences: userPreferences.filter(p => p.trim())
    };
    
    const result = await apiService.createCustomRequest(request, authToken);
    if (result.success) {
      alert('✅ Design sent to admin with your preferences!');
      setGeneratedImage(null);
      setPrompt('');
      setUserPreferences(['']);
    } else {
      alert('❌ Failed to send: ' + (result.error || 'Unknown error'));
    }
  };

  const addPreference = () => {
    setUserPreferences([...userPreferences, '']);
  };

  const updatePreference = (index, value) => {
    const updated = [...userPreferences];
    updated[index] = value;
    setUserPreferences(updated);
  };

  const removePreference = (index) => {
    setUserPreferences(userPreferences.filter((_, i) => i !== index));
  };

  return (
    <div className="custom-page" onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <nav className="navbar">
        <div className="navbar-container">
          <button onClick={() => setCurrentPage('home')} className="back-button">← Back</button>
          <div className="logo">🎨 Custom Woodwork</div>
          <button onClick={handleLogout} className="btn btn-text">Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="mode-selector">
          <button onClick={() => setMode('description')} className={`mode-btn ${mode === 'description' ? 'active' : ''}`}>
            📝 Describe Idea
          </button>
          <button onClick={() => setMode('upload')} className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}>
            📤 Upload Image
          </button>
          <button onClick={() => setMode('ai-room')} className={`mode-btn ${mode === 'ai-room' ? 'active' : ''}`}>
            {hasAIAccess ? '✨ AI Room Redesign' : '🔒 AI Room Redesign (Locked)'}
          </button>
        </div>

        {mode === 'description' && (
          <div className="content-card">
            <h2>Describe Your Custom Piece</h2>
            <p style={{color: '#6b7280', marginBottom: '1rem'}}>Tell us about your dream furniture piece</p>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="E.g., I want a rustic dining table made from reclaimed wood, 6 feet long, with a natural edge..." 
              rows="8" 
            />
            
            <h3 style={{marginTop: '1.5rem'}}>Your Preferences</h3>
            {userPreferences.map((pref, idx) => (
              <div key={idx} className="preference-row">
                <input 
                  type="text" 
                  value={pref} 
                  onChange={(e) => updatePreference(idx, e.target.value)} 
                  placeholder={`Preference ${idx + 1} (e.g., dark walnut finish)`} 
                />
                {userPreferences.length > 1 && (
                  <button onClick={() => removePreference(idx)} className="btn-remove">×</button>
                )}
              </div>
            ))}
            <button onClick={addPreference} className="btn btn-outline btn-small" style={{marginTop: '0.5rem'}}>
              + Add Preference
            </button>
            <button onClick={handleDescriptionSubmit} className="btn btn-primary btn-block" style={{marginTop: '1.5rem'}}>
              📤 Send to Admin
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="content-card">
            <h2>Upload Reference Image</h2>
            <p style={{color: '#6b7280', marginBottom: '1rem'}}>Share a photo of furniture you'd like us to recreate</p>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
              📤 Choose Image
            </button>
            
            <h3 style={{marginTop: '1.5rem'}}>Your Preferences</h3>
            {userPreferences.map((pref, idx) => (
              <div key={idx} className="preference-row">
                <input 
                  type="text" 
                  value={pref} 
                  onChange={(e) => updatePreference(idx, e.target.value)} 
                  placeholder={`Preference ${idx + 1}`} 
                />
                {userPreferences.length > 1 && (
                  <button onClick={() => removePreference(idx)} className="btn-remove">×</button>
                )}
              </div>
            ))}
            <button onClick={addPreference} className="btn btn-outline btn-small" style={{marginTop: '0.5rem'}}>
              + Add Preference
            </button>
          </div>
        )}

        {mode === 'ai-room' && (
          <div>
            {!hasAIAccess ? (
              <div className="content-card access-locked">
                <div className="lock-icon">🔒</div>
                <h2>AI Room Redesign - Access Required</h2>
                <p style={{fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem'}}>
                  This premium feature uses <strong>GPT-4 Vision</strong> to analyze your room and <strong>DALL-E 3</strong> to generate professional interior designs.
                </p>
                
                {!accessRequested ? (
                  <>
                    <button onClick={handleRequestAccess} className="btn btn-primary btn-large">
                      🔓 Request Access
                    </button>
                    <div className="access-note" style={{marginTop: '1.5rem'}}>
                      <p><strong>💡 How it works:</strong></p>
                      <p>1. Request access (payment required)</p>
                      <p>2. Admin approves and grants time-limited access</p>
                      <p>3. Upload your room photo & describe your vision</p>
                      <p>4. AI analyzes and generates professional designs</p>
                    </div>
                  </>
                ) : (
                  <div className="access-pending">
                    <h3>⏳ Request Pending</h3>
                    <p>Your access request is waiting for admin approval.</p>
                    <p>You'll receive an email notification once access is granted.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {accessTimeRemaining && (
                  <div className="access-timer">
                    <p>
                      ⏱️ AI Access Time Remaining: 
                      <strong style={{marginLeft: '0.5rem'}}>
                        {Math.floor(accessTimeRemaining / 60)} hours {accessTimeRemaining % 60} minutes
                      </strong>
                    </p>
                  </div>
                )}
                
                <div className="content-card">
                  <h2>🎨 AI-Powered Room Redesign</h2>
                  <p style={{color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.05rem'}}>
                    Upload your room photo and describe your vision. Our AI will analyze your space and create a professional interior design.
                  </p>
                  
                  <div className="form-group">
                    <label style={{fontSize: '1rem', fontWeight: '600'}}>1. Upload Room Photo</label>
                    <input 
                      type="file" 
                      ref={roomInputRef} 
                      onChange={handleRoomImageUpload} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    <button 
                      onClick={() => roomInputRef.current?.click()} 
                      className="btn btn-outline"
                      style={{marginTop: '0.5rem'}}
                    >
                      📷 {roomImage ? 'Change Image' : 'Upload Room Photo'}
                    </button>
                    {roomImage && (
                      <div className="image-preview" style={{marginTop: '1rem'}}>
                        <img src={roomImage} alt="Room" style={{maxHeight: '300px'}} />
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{marginTop: '1.5rem'}}>
                    <label style={{fontSize: '1rem', fontWeight: '600'}}>2. Describe Your Design Vision</label>
                    <textarea 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)} 
                      placeholder="E.g., Transform this into a modern minimalist space with neutral colors, add comfortable seating, wooden furniture, and natural lighting. Include plants and a cozy reading nook." 
                      rows="5"
                      style={{marginTop: '0.5rem'}}
                    />
                    <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
                      💡 Tip: Be specific about colors, style, furniture types, and atmosphere you want.
                    </p>
                  </div>

                  {loading && generationProgress && (
                    <div style={{
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                      border: '2px solid #0ea5e9',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      marginTop: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ 
                        margin: '0 0 0.75rem 0', 
                        color: '#0369a1', 
                        fontWeight: 600, 
                        fontSize: '1.05rem' 
                      }}>
                        {generationProgress}
                      </p>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: '#bae6fd',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: '100%',
                          background: 'linear-gradient(90deg, #0ea5e9, #3b82f6, #0ea5e9)',
                          backgroundSize: '200% 100%',
                          animation: 'slideProgress 2s linear infinite'
                        }}></div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAIGenerate} 
                    disabled={loading || !roomImage || !prompt} 
                    className="btn btn-primary btn-block btn-large"
                    style={{marginTop: '1.5rem'}}
                  >
                    {loading ? '✨ Generating... Please wait (20-40 seconds)' : '✨ Generate AI Design'}
                  </button>
                </div>

                {generatedImage && (
                  <div className="content-card protected-image-container" onContextMenu={(e) => e.preventDefault()} style={{marginTop: '1.5rem'}}>
                    <div className="screenshot-warning">
                      ⚠️ This is a preview with watermarks. Final high-resolution image will be provided after order confirmation.
                    </div>
                    <h3>🎨 Your Generated Design</h3>
                    <div className="protected-image">
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        style={{ 
                          userSelect: 'none', 
                          pointerEvents: 'none', 
                          width: '100%', 
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }} 
                        draggable="false" 
                      />
                    </div>

                    <h3 style={{marginTop: '2rem'}}>✏️ Customize Your Design</h3>
                    <p className="note">Tell us what you'd like to keep, change, or remove from this design:</p>
                    {userPreferences.map((pref, idx) => (
                      <div key={idx} className="preference-row">
                        <input 
                          type="text" 
                          value={pref} 
                          onChange={(e) => updatePreference(idx, e.target.value)} 
                          placeholder={`E.g., Keep the sofa but change wall color to beige, add more plants`} 
                        />
                        {userPreferences.length > 1 && (
                          <button onClick={() => removePreference(idx)} className="btn-remove">×</button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={addPreference} 
                      className="btn btn-outline btn-small"
                      style={{marginTop: '0.5rem'}}
                    >
                      + Add Preference
                    </button>
                    
                    <button 
                      onClick={handleSendToAdmin} 
                      className="btn btn-success btn-block btn-large"
                      style={{marginTop: '1.5rem'}}
                    >
                      📤 Send to Admin for Quote & Production
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ADMIN PAGE WITH ENHANCED FEATURES
const AdminPage = ({ authToken, customRequests, setCustomRequests, delivery, setDelivery, aiAccessRequests, setAiAccessRequests, handleLogout, setCurrentPage }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [accessHours, setAccessHours] = useState('24');
  const [activeTab, setActiveTab] = useState('requests');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Tables',
    description: '',
    image: '',
    stock: 0,
    featured: false
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  useEffect(() => {
    loadAIAccessRequests();
    const interval = setInterval(loadAIAccessRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAIAccessRequests = async () => {
    const result = await apiService.getAIAccessRequests(authToken);
    if (result.success) {
      setAiAccessRequests(result.data);
    }
  };

  const handleGrantAccess = async (userId) => {
    const hours = parseInt(accessHours);
    const result = await apiService.grantAIAccess(userId, hours, authToken);
    if (result.success) {
      alert(`Access granted for ${hours} hours!`);
      loadAIAccessRequests();
    } else {
      alert('Failed to grant access');
    }
  };

  const handleRejectAccess = async (requestId) => {
    setRejectingRequest(requestId);
    setShowRejectModal(true);
  };

  const confirmRejectAccess = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const result = await apiService.rejectAIAccess(rejectingRequest, rejectReason, authToken);
    if (result.success) {
      alert('Access request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingRequest(null);
      loadAIAccessRequests();
    } else {
      alert('Failed to reject request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const result = await apiService.rejectRequest(requestId, reason, authToken);
    if (result.success) {
      alert('Request rejected and user notified');
      // Refresh requests
    } else {
      alert('Failed to reject request');
    }
  };

  const sendInvoice = async (requestId) => {
    if (!invoiceAmount) return alert('Enter amount');
    const result = await apiService.sendInvoice(requestId, invoiceAmount, authToken);
    if (result.success) {
      alert('Invoice sent!');
      setInvoiceAmount('');
      setSelectedRequest(null);
    }
  };

  const approveAndAddToDelivery = (requestId) => {
    const request = customRequests.find(req => req.id === requestId);
    if (request) {
      setDelivery([...delivery, { ...request, deliveryDate: new Date().toISOString() }]);
      alert('Added to delivery!');
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.description) {
      alert('Please fill all required fields');
      return;
    }

    const result = await apiService.createFurniture(newItem, authToken);
    if (result.success) {
      alert('Item added successfully!');
      setNewItem({
        name: '',
        price: '',
        category: 'Tables',
        description: '',
        image: '',
        stock: 0,
        featured: false
      });
      setShowAddItem(false);
    } else {
      alert('Failed to add item');
    }
  };

  return (
    <div className="admin-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">👨‍💼 Admin Panel</div>
          <div className="nav-buttons">
            <button onClick={() => setCurrentPage('chat')} className="btn btn-outline">💬 Messages</button>
            <button onClick={handleLogout} className="btn btn-text">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="admin-tabs">
          <button onClick={() => setActiveTab('requests')} className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}>
            Custom Requests
          </button>
          <button onClick={() => setActiveTab('ai-access')} className={`tab-btn ${activeTab === 'ai-access' ? 'active' : ''}`}>
            AI Access Requests ({aiAccessRequests.length})
          </button>
          <button onClick={() => setActiveTab('delivery')} className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}>
            Delivery Queue
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}>
            Manage Inventory
          </button>
        </div>

        {/* AI Access Requests Tab */}
        {activeTab === 'ai-access' && (
          <section className="admin-section">
            <h2>🔐 AI Access Requests</h2>
            {aiAccessRequests.length === 0 ? (
              <div className="empty-state">No pending access requests</div>
            ) : (
              <div className="access-requests-grid">
                {aiAccessRequests.map(req => (
                  <div key={req.id} className="access-request-card">
                    <h3>{req.username}</h3>
                    <p>Email: {req.email}</p>
                    <p>Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                    <div className="access-grant-form">
                      <label>Grant Access For:</label>
                      <select value={accessHours} onChange={(e) => setAccessHours(e.target.value)}>
                        <option value="1">1 Hour</option>
                        <option value="3">3 Hours</option>
                        <option value="6">6 Hours</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="48">48 Hours (2 Days)</option>
                        <option value="72">72 Hours (3 Days)</option>
                        <option value="168">1 Week</option>
                      </select>
                      <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                        <button onClick={() => handleGrantAccess(req.userId)} className="btn btn-success" style={{flex: 1}}>
                          ✅ Grant
                        </button>
                        <button onClick={() => handleRejectAccess(req.requestId)} className="btn btn-outline" style={{flex: 1}}>
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Custom Requests Tab */}
        {activeTab === 'requests' && (
          <div className="admin-grid">
            <div>
              <h2>Custom Requests</h2>
              <div className="requests-list">
                {customRequests.length === 0 ? (
                  <div className="empty-state">No requests yet</div>
                ) : (
                  customRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <div>
                          <h3>{request.user}</h3>
                          <p className="date">{new Date(request.date).toLocaleString()}</p>
                        </div>
                        <span className={`status-badge ${request.status}`}>{request.status}</span>
                      </div>
                      <div className="request-body">
                        <p><strong>Type:</strong> {request.type}</p>
                        {request.preferences && request.preferences.length > 0 && (
                          <div>
                            <strong>Customer Preferences:</strong>
                            <ul>
                              {request.preferences.map((pref, idx) => (
                                <li key={idx}>{pref}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {request.content && <p>{request.content}</p>}
                        {request.generatedImage && <img src={request.generatedImage} alt="Generated" className="request-image" />}
                      </div>
                      <div className="request-actions">
                        <button onClick={() => setSelectedRequest(request)} className="btn btn-primary btn-small">Send Invoice</button>
                        <button onClick={() => handleRejectRequest(request.id)} className="btn btn-outline btn-small">Reject</button>
                        {request.status === 'invoiced' && (
                          <button onClick={() => approveAndAddToDelivery(request.id)} className="btn btn-success btn-small">Add to Delivery</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2>Send Invoice</h2>
              {selectedRequest ? (
                <div className="content-card">
                  <h3>Invoice for {selectedRequest.user}</h3>
                  <div className="form-group">
                    <label>Total Amount</label>
                    <input type="text" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="$0.00" />
                  </div>
                  <button onClick={() => sendInvoice(selectedRequest.id)} className="btn btn-primary btn-block">Send Invoice</button>
                </div>
              ) : (
                <div className="empty-state">Select a request</div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <section className="admin-section">
            <h2>📦 Delivery Queue</h2>
            {delivery.length === 0 ? (
              <div className="empty-state">No items in delivery</div>
            ) : (
              <div className="delivery-list">
                {delivery.map(item => (
                  <div key={item.id} className="delivery-card">
                    <h3>Order #{item.id}</h3>
                    <p>Customer: {item.user}</p>
                    <p>Added: {new Date(item.deliveryDate).toLocaleDateString()}</p>
                    <span className="status-badge in-delivery">In Delivery</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Inventory Management Tab */}
        {activeTab === 'inventory' && (
          <section className="admin-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2>🏬 Manage Inventory</h2>
              <button onClick={() => setShowAddItem(!showAddItem)} className="btn btn-primary">
                {showAddItem ? 'Cancel' : '+ Add New Item'}
              </button>
            </div>

            {showAddItem && (
              <div className="content-card" style={{marginBottom: '2rem'}}>
                <h3>Add New Furniture Item</h3>
                <div className="form-group">
                  <label>Item Name *</label>
                  <input 
                    type="text" 
                    value={newItem.name} 
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Modern Oak Table"
                  />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div className="form-group">
                    <label>Price *</label>
                    <input 
                      type="number" 
                      value={newItem.price} 
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      placeholder="899"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                      <option value="Tables">Tables</option>
                      <option value="Chairs">Chairs</option>
                      <option value="Sofas">Sofas</option>
                      <option value="Cabinets">Cabinets</option>
                      <option value="Beds">Beds</option>
                      <option value="Desks">Desks</option>
                      <option value="Shelves">Shelves</option>
                      <option value="Outdoor">Outdoor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea 
                    value={newItem.description} 
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Detailed description of the furniture piece"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    value={newItem.image} 
                    onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      value={newItem.stock} 
                      onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <input 
                        type="checkbox" 
                        checked={newItem.featured} 
                        onChange={(e) => setNewItem({...newItem, featured: e.target.checked})}
                      />
                      Feature on homepage
                    </label>
                  </div>
                </div>

                <button onClick={handleAddNewItem} className="btn btn-success btn-block">
                  ✅ Add Item to Catalog
                </button>
              </div>
            )}

            <div className="content-card">
              <h3>Existing Items</h3>
              <p style={{color: '#6b7280'}}>Manage your furniture catalog here. Items added will appear on the homepage and search results.</p>
            </div>
          </section>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="content-card" style={{maxWidth: '500px', width: '90%'}}>
              <h3>Reject Access Request</h3>
              <div className="form-group">
                <label>Reason for Rejection</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows="4"
                />
              </div>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button onClick={confirmRejectAccess} className="btn btn-primary" style={{flex: 1}}>
                  Confirm Rejection
                </button>
                <button onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectingRequest(null);
                }} className="btn btn-outline" style={{flex: 1}}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FurnitureApp;