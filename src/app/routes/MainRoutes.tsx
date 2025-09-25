import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '../layouts/Header/Header';
import Home from '../pages/Home/Home';
import About from '../pages/About/About';

const MainRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </BrowserRouter>
    );
};

export default MainRoutes;
