import { useState } from 'react'

import './App.css'

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Index } from '.';
import  CustomerNavbar  from './components/customer/CustomerNavbar.jsx';
import { CartProvider } from './context/CartContext.jsx';
function App() {


  return (
   
       <div>
    
  <Index/>
    </div>
  
   
  )
}

export default App
