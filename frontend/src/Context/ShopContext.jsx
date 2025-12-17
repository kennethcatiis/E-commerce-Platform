import React,  {createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const[all_product, setAll_Product] = useState([]);
    const[cartItems, setCartItems] = useState({});

    useEffect(()=>{
        fetch('http://localhost:4000/allproducts')
        .then((response)=>response.json())
        .then((data)=> {
            setAll_Product(data);
            const initialCart = {};
            data.forEach(product => {
                initialCart[product.id] = 0;
            });
            setCartItems(initialCart);
            syncCartWithServer();
        })
        .catch(error => console.error("Error fetching products:", error));
    },[])

    const syncCartWithServer = async () => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            try {
                const response = await fetch('http://localhost:4000/getcart', {
                    method: "POST",
                    headers: {
                        'Accept': "application/json",
                        'auth-token': token,
                        'Content-Type': "application/json"
                    }
                });
                
                const data = await response.json();
                if (data.success && data.cartData) {
                    setCartItems(prev => ({ ...prev, ...data.cartData }));
                }
            } catch (error) {
                console.error("Error syncing cart:", error);
            }
        }
    };

    const addToCart = (itemId)=> {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}));
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/addtocart',{
                method: "POST",
                headers:{
                    'Accept':"application/json",
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({"itemId":itemId})
            })
            .then((response)=> {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text().then(text => {
                    try {
                        return text ? JSON.parse(text) : {};
                    } catch (err) {
                        console.error("Failed to parse JSON:", text);
                        return {};
                    }
                });
            })
            .then((data)=>console.log("Add to cart response:", data))
            .catch(error => console.error("Error adding to cart:", error));
        }
    }

    const removeFromCart = (itemId)=> {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart',{
                method: "POST",
                headers:{
                    'Accept':"application/json",
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({"itemId":itemId})
            })
            .then((response)=> {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text().then(text => {
                    try {
                        return text ? JSON.parse(text) : {};
                    } catch (err) {
                        console.error("Failed to parse JSON:", text);
                        return {};
                    }
                });
            })
            .then((data)=>console.log("Remove from cart response:", data))
            .catch(error => console.error("Error removing from cart:", error));
        }
    }

    const clearCart = () => {
        setCartItems({});
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/clearcart',{
                method: "POST",
                headers:{
                    'Accept':"application/json",
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type': "application/json"
                }
            })
            .then((response)=> {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text().then(text => {
                    try {
                        return text ? JSON.parse(text) : {};
                    } catch (err) {
                        console.error("Failed to parse JSON:", text);
                        return {};
                    }
                });
            })
            .then((data)=>console.log("Clear cart response:", data))
            .catch(error => console.error("Error clearing cart:", error));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    const getTotalCartItems = ()=>{
        let totalItem=0;
        for (const item in cartItems)
        {
            if (cartItems[item]>0){
                totalItem+=cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = {getTotalCartItems, getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart, clearCart};
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;