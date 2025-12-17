import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import remove_icon from '../../assets/cross_icon.png'
import edit_icon from '../../assets/edit.png' 

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    old_price: '',
    new_price: '',
    category: 'mens'
  });
  const [errors, setErrors] = useState({});

  const fetchInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/allproducts');
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await fetch('http://localhost:4000/removeproduct', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      });
      await fetchInfo();
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product.id || product._id);
    setEditForm({
      name: product.name,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category
    });
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      old_price: '',
      new_price: '',
      category: 'mens'
    });
    setErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'old_price' || name === 'new_price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setEditForm({
          ...editForm,
          [name]: value
        });
        if (errors[name]) {
          setErrors({ ...errors, [name]: '' });
        }
      }
    } else {
      setEditForm({
        ...editForm,
        [name]: value
      });
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!editForm.old_price) {
      newErrors.old_price = "Regular price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(editForm.old_price)) {
      newErrors.old_price = "Enter a valid number";
    }
    
    if (!editForm.new_price) {
      newErrors.new_price = "Sale price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(editForm.new_price)) {
      newErrors.new_price = "Enter a valid number";
    }
    
    const oldPrice = parseFloat(editForm.old_price);
    const newPrice = parseFloat(editForm.new_price);
    
    if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice >= oldPrice) {
      newErrors.new_price = "Sale price must be less than regular price";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const update_product = async (id) => {
    if (!validateEditForm()) {
      alert("Please fix the errors before saving");
      return;
    }

    try {
      const productData = {
        id: id,
        name: editForm.name,
        old_price: parseFloat(editForm.old_price),
        new_price: parseFloat(editForm.new_price),
        category: editForm.category
      };

      const response = await fetch('http://localhost:4000/updateproduct', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      if (data.success) {
        alert("Product updated successfully!");
        setEditingProduct(null);
        await fetchInfo();
      } else {
        alert("Failed to update product: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product: " + error.message);
    }
  };

  return (
    <div className='list-product'>
      <h1>All Products</h1>
      <div className="listproduct-format-main">
        <p>Image</p>
        <p>Name</p>
        <p>Price</p>
        <p>Sale Price</p>
        <p>Category</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        {allproducts.map((product, index) => {
          const isEditing = editingProduct === (product.id || product._id);
          
          return (
            <div key={index} className={`listproduct-format ${isEditing ? 'editing' : ''}`}>
              <img src={product.image} className='listproduct-product-icon' alt={product.name} />
              
              <div className="listproduct-field-container">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className={`listproduct-edit-input ${errors.name ? 'error' : ''}`}
                    />
                    {errors.name && <span className="listproduct-error">{errors.name}</span>}
                  </>
                ) : (
                  <p>{product.name}</p>
                )}
              </div>
              
              <div className="listproduct-field-container">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="old_price"
                      value={editForm.old_price}
                      onChange={handleEditChange}
                      className={`listproduct-edit-input ${errors.old_price ? 'error' : ''}`}
                    />
                    {errors.old_price && <span className="listproduct-error">{errors.old_price}</span>}
                  </>
                ) : (
                  <p>${product.old_price}</p>
                )}
              </div>
              
              <div className="listproduct-field-container">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="new_price"
                      value={editForm.new_price}
                      onChange={handleEditChange}
                      className={`listproduct-edit-input ${errors.new_price ? 'error' : ''}`}
                    />
                    {errors.new_price && <span className="listproduct-error">{errors.new_price}</span>}
                  </>
                ) : (
                  <p>${product.new_price}</p>
                )}
              </div>
              
              <div className="listproduct-field-container">
                {isEditing ? (
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="listproduct-edit-select"
                  >
                    <option value="mens">Men's</option>
                    <option value="womens">Women's</option>
                    <option value="kids">Kids'</option>
                  </select>
                ) : (
                  <p>{product.category}</p>
                )}
              </div>
              
              <div className="listproduct-actions">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => update_product(product.id || product._id)}
                      className="listproduct-save-btn"
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEditing}
                      className="listproduct-cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <img 
                      onClick={() => startEditing(product)} 
                      className='listproduct-edit-icon' 
                      src={edit_icon} 
                      alt="Edit" 
                    />
                    <img 
                      onClick={() => { remove_product(product.id || product._id) }} 
                      className='listproduct-remove-icon' 
                      src={remove_icon} 
                      alt="Remove" 
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListProduct;