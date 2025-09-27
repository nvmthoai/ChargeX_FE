import { useState } from 'react';
import './Home.css';

export default function Home() {

    const [count, setCount] = useState(0);

    return (
        <div className='home-container'>
            <h1 className='title'>Welcome to My First Vite + React + TS Page 🎉</h1>
            <p className='text'>
                Đây là trang giao diện đầu tiên được tạo bằng Vite, React và TypeScript.
            </p>
            <button className='button' onClick={() => setCount(p => p + 1)}>Bấm thử {count}</button>
        </div>
    )
}
