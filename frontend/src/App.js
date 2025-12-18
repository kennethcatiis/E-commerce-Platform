import './App.css';
import Navbar from './Components/Navbar/Navbar';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Product from './Pages/Product';
import Footer from './Components/Footer/Footer';
import Transactions from './Components/Transactions/Transactions';
import UserProfile from './Components/UserProfile/UserProfile';
import mens_banner from './Components/Assets/Frontend_Assets/banner_mens.png';
import womens_banner from './Components/Assets/Frontend_Assets/banner_women.png';
import kids_banner from './Components/Assets/Frontend_Assets/banner_kids.png';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner = {mens_banner} category ='mens'/>} />
          <Route path='/womens' element={<ShopCategory banner = {womens_banner}category ='womens'/>} />
          <Route path='/kids' element={<ShopCategory banner = {kids_banner}category ='kids'/>} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path='cart' element={<Cart/>}/>
          <Route path='login' element={<LoginSignup/>}/>
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/userprofile' element={<UserProfile />} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
