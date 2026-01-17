import React from 'react'

const Header = () => {
  return (
    <header className="Header">
      <div className="App-container">
        {/* Logo responsivo */}
         <img
          src="/imgs/logo-pedro.jpg"
          alt="Logo Gallego Productos"
          className="Header__logo anim-fade"
        /> 
        {/* <h1 className="Header__title anim-fade">GALLEGO PRODUCTOS & SERVICIOS SL</h1> */}
        <p className="Header__subtitle anim-fade">
          Limpieza Profesional para concesionarios, Oficinas, Chalets, Parkings y más
        </p>
      </div>
    </header>
  )
}

export default Header
