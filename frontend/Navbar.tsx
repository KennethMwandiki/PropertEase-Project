
import React from 'react';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="nav-content container">
        <div className="logo">PropertEase</div>
        <div id="auth-container">
          <div className="nav-links">
            <button className="btn btn-secondary">List your space</button>
            <button id="signin-btn" className="btn btn-primary">
              <svg className="icon" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
