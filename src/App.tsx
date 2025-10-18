import './App.css'
import MainRoutes from "./app/routes/MainRoutes";
import { App as AntdApp } from "antd";
function App() {

  return (
    <>
 <AntdApp>
      <MainRoutes />
      </AntdApp>
    </>
  )
}

export default App
