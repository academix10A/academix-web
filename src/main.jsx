import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

createRoot(document.getElementById('root')).render(
  <PayPalScriptProvider options={{ clientId: "AYFuaQtsQeteSBIQAMrb_8z-MUP1zft_gt5m6igebK8fuXhLunfdF106KKUq-jvIA9V9t4HeRIaXqHJs", currency: "MXN" }}>
    <StrictMode>
      <App />
    </StrictMode>
  </PayPalScriptProvider>,
)
