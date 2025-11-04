import './App.css'
import MainRoutes from "./app/routes/MainRoutes";
import { App as AntdApp } from "antd";
import { ToastContainer } from 'react-toastify';
function App() {

  return (
    <>
 <AntdApp>
      <MainRoutes />
      <ToastContainer />
      </AntdApp>
    </>
  )
}

export default App
