import React from "react";

export default function Menu() {
  return (
    <nav>
      <button className="menu" name="menu">
        <i className="fas fa-bars"></i>
      </button>
      <div className="menu-list">
        <a href="#work" name="menuItem">Projects</a>
        <a href="#experience" name="menuItem">About</a>
        <a href="#contact" name="menuItem">Contact</a>
      </div>
    </nav>
  );
}
