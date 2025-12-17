import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const LoginSignup = () => {

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  })
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  }

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Sign up specific validations
    if (state === "Sign Up") {
      if (!formData.username) {
        newErrors.username = "Username is required";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!agreeChecked) {
        newErrors.agree = "You must agree to the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const login = async () => {
    if (!validateForm()) return;

    console.log("Login Function Executed", formData);
    let responseData;
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      responseData = await response.json();
      
      console.log("Login response:", responseData);
      
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.errors || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error. Please check if backend server is running.");
    }
  }

  const signup = async () => {
    if (!validateForm()) return;

    console.log("Sign Up Function Executed", formData);
    let responseData;
    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });
      
      console.log("Signup response status:", response.status);
      
      const responseText = await response.text();
      console.log("Signup raw response:", responseText);
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        alert("Server returned invalid response. Check if backend is running.");
        return;
      }
      
      console.log("Signup parsed response:", responseData);
      
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.errors || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error. Please check if backend server is running on port 4000.");
    }
  }

  // Reset form when switching between login/signup
  const toggleState = (newState) => {
    setState(newState);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: ""
    });
    setAgreeChecked(false);
    setErrors({});
  }

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:4000/');
      console.log("Backend connection test:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Cannot connect to backend:", error);
      return false;
    }
  }

  return (
    <div>
      <div className="loginsignup">
        <div className="loginsignup-container">
          <h1>{state}</h1>
          
          <div className="loginsignup-fields">
            {state === "Sign Up" && (
              <>
                <input 
                  name="username" 
                  value={formData.username} 
                  onChange={changeHandler} 
                  type="text" 
                  placeholder='Username' 
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </>
            )}
            
            <input 
              name="email" 
              value={formData.email} 
              onChange={changeHandler} 
              type="email" 
              placeholder='E-mail' 
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
            
            <input 
              name="password" 
              value={formData.password} 
              onChange={changeHandler} 
              type="password" 
              placeholder='Password' 
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            {state === "Sign Up" && (
              <>
                <input 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={changeHandler} 
                  type="password" 
                  placeholder='Confirm Password' 
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </>
            )}
          </div>
          
          {state === "Sign Up" && (
            <div className="loginsignup-agree">
              <input 
                type="checkbox" 
                name='agree' 
                id='agree-checkbox'
                checked={agreeChecked}
                onChange={(e) => {
                  setAgreeChecked(e.target.checked);
                  if (errors.agree) {
                    setErrors({ ...errors, agree: '' });
                  }
                }}
              />
              <label htmlFor="agree-checkbox">
                <p>By continuing, I agree to the terms of use and privacy policy.</p>
              </label>
              {errors.agree && <span className="error-message agree-error">{errors.agree}</span>}
            </div>
          )}
          
          <button onClick={() => { state === "Login" ? login() : signup() }}>
            {state === "Login" ? "Login" : "Sign Up"}
          </button>
          
          <p className="loginsignup-login">
            {state === "Sign Up" 
              ? <>Already have an account? <span onClick={() => toggleState("Login")}>Login here</span></>
              : <>Create an account? <span onClick={() => toggleState("Sign Up")}>Click here</span></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup