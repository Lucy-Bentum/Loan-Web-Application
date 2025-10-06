import React, { useState } from "react";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    occupation: "",
    monthlySalary: "",
    ghanaCardNumber: "",
    votersIdNumber: "",
    dateOfBirth: "",
    address: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // later you'll send this data to your backend API
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Join our loan platform and get started today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName"
                  name="firstName" 
                  placeholder="Enter your first name" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName"
                  name="lastName" 
                  placeholder="Enter your last name" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  placeholder="Enter your email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone" 
                  placeholder="Enter your phone number" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth"
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea 
                id="address"
                name="address" 
                placeholder="Enter your full address" 
                value={formData.address} 
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Security Section */}
          <div className="form-section">
            <h3>Security</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  placeholder="Create a strong password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Employment Section */}
          <div className="form-section">
            <h3>Employment Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="occupation">Occupation</label>
                <input 
                  type="text" 
                  id="occupation"
                  name="occupation" 
                  placeholder="Your current occupation" 
                  value={formData.occupation} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="monthlySalary">Monthly Salary (GHS)</label>
                <input 
                  type="number" 
                  id="monthlySalary"
                  name="monthlySalary" 
                  placeholder="Your monthly salary" 
                  value={formData.monthlySalary} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Identification Section */}
          <div className="form-section">
            <h3>Identification</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ghanaCardNumber">Ghana Card Number</label>
                <input 
                  type="text" 
                  id="ghanaCardNumber"
                  name="ghanaCardNumber" 
                  placeholder="Enter Ghana Card number" 
                  value={formData.ghanaCardNumber} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="votersIdNumber">Voters ID Number</label>
                <input 
                  type="text" 
                  id="votersIdNumber"
                  name="votersIdNumber" 
                  placeholder="Enter Voters ID number" 
                  value={formData.votersIdNumber} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-button">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
