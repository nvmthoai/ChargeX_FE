import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function MainRoutes() {
    return (
        <BrowserRouter>
            <></>
            <Routes>
                <Route path='/' element={<></>} />
                <Route path='*' element={<></>} />
            </Routes>
            <></>
        </BrowserRouter>
    )
}
