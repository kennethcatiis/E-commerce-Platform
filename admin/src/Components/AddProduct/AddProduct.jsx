import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from "../../assets/upload_area.svg"

const AddProduct = () => {
  
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "mens",
    new_price: "",
    old_price: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  }

  const changeHandler = (e) => {
    const { name, value } = e.target;
    if (name === 'old_price' || name === 'new_price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setProductDetails({ ...productDetails, [name]: value });
        if (errors[name]) {
          setErrors({ ...errors, [name]: '' });
        }
      }
    } else {
      setProductDetails({ ...productDetails, [name]: value });
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  }

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!productDetails.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    // Validate image
    if (!image) {
      newErrors.image = "Product image is required";
    }
    
    if (!productDetails.old_price) {
      newErrors.old_price = "Regular price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(productDetails.old_price)) {
      newErrors.old_price = "Please enter a valid number (e.g., 29.99)";
    }
    
    if (!productDetails.new_price) {
      newErrors.new_price = "Sale price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(productDetails.new_price)) {
      newErrors.new_price = "Please enter a valid number (e.g., 19.99)";
    }
    
    const oldPrice = parseFloat(productDetails.old_price);
    const newPrice = parseFloat(productDetails.new_price);
    
    if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice >= oldPrice) {
      newErrors.new_price = "Sale price should be less than regular price";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const resetForm = () => {
    setProductDetails({
      name: "",
      image: "",
      category: "mens",
      new_price: "",
      old_price: ""
    });
    setImage(null);
    setErrors({});
  }

  const Add_Product = async () => {
    if (!validateForm()) {
      alert("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Starting product upload...", productDetails);
      
      // First: Upload image
      let responseData;
      let formData = new FormData();
      formData.append('product', image);

      const uploadResponse = await fetch('http://localhost:4000/upload', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed: ${uploadResponse.status}`);
      }

      responseData = await uploadResponse.json();
      console.log("Upload response:", responseData);
      
      if (responseData.success) {
        // Prepare product data with image URL
        const product = {
          ...productDetails,
          image: responseData.image_url,
          old_price: parseFloat(productDetails.old_price),
          new_price: parseFloat(productDetails.new_price)
        };
        
        console.log("Adding product:", product);
        
        // Second: Add product to database
        const addProductResponse = await fetch('http://localhost:4000/addproduct', {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        const addProductData = await addProductResponse.json();
        console.log("Add product response:", addProductData);
        
        if (addProductData.success) {
          alert("Product added successfully!");
          resetForm(); // Clear all fields
        } else {
          alert("Product was NOT added: " + (addProductData.message || "Unknown error"));
        }
      } else {
        alert("Image upload failed: " + (responseData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Name</p>
        <input 
          value={productDetails.name} 
          onChange={changeHandler} 
          type="text" 
          name="name" 
          placeholder="Product Name"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>
      
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Regular Price</p>
          <input 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            type="text" 
            name="old_price" 
            placeholder="e.g., 29.99"
            className={errors.old_price ? 'error' : ''}
          />
          {errors.old_price && <span className="error-message">{errors.old_price}</span>}
        </div>
        <div className="addproduct-itemfield">
          <p>Sale Price</p>
          <input 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            type="text" 
            name="new_price" 
            placeholder="e.g., 19.99"
            className={errors.new_price ? 'error' : ''}
          />
          {errors.new_price && <span className="error-message">{errors.new_price}</span>}
        </div>
      </div>
      
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select 
          value={productDetails.category} 
          onChange={changeHandler}
          name="category" 
          className="add-product-selector"
        >
          <option value="mens">Men's</option>
          <option value="womens">Women's</option>
          <option value="kids">Kids'</option>
        </select>
      </div>
      
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img 
            src={image ? URL.createObjectURL(image) : upload_area} 
            className='addproduct-thumbnail-img' 
            alt="" 
          />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
        {errors.image && <span className="error-message">{errors.image}</span>}
        {image && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Selected: {image.name}
          </p>
        )}
      </div>
      
      <button 
        onClick={Add_Product} 
        className='addproduct-btn'
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </div>
  )
}

export default AddProduct