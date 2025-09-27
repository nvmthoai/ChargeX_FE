import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '../layouts/Header/Header';
import About from '../pages/About/About';
import Home from '../pages/Home/Home';

export default function MainRoutes() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </BrowserRouter>
    )
}
