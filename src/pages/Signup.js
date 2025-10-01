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
    // later you’ll send this data to your backend API
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
        <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} />
        <input type="number" name="monthlySalary" placeholder="Monthly Salary" value={formData.monthlySalary} onChange={handleChange} />
        <input type="text" name="ghanaCardNumber" placeholder="Ghana Card Number" value={formData.ghanaCardNumber} onChange={handleChange} />
        <input type="text" name="votersIdNumber" placeholder="Voters ID Number" value={formData.votersIdNumber} onChange={handleChange} />
        <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={formData.dateOfBirth} onChange={handleChange} />
        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange}></textarea>
        
        <button type="submit" style={{ marginTop: "10px" }}>Register</button>
      </form>
    </div>
  );
}

export default Signup;
