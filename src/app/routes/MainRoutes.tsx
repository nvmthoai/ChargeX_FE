import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '../layouts/Header/Header';
import Home from '../pages/Home/Home';
import About from '../pages/About/About';


import ProductDetail from '../pages/Product/ProductDetail';
import Cart from '../pages/Cart/Cart';


const MainRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/productdetail' element={<ProductDetail />} />
                <Route path='/cart' element={<Cart />} />

            </Routes>
        </BrowserRouter>
    );
};

export default MainRoutes;
