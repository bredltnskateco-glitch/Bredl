import React from 'react';
import './Departments.css';

const Departments = () => {
  const departments = [
    {
      id: 1,
      name: 'HARDWARE',
      image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&h=700&fit=crop',
      link: '#hardware'
    },
    {
      id: 2,
      name: 'SHOES',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=700&fit=crop',
      link: '#shoes'
    },
    {
      id: 3,
      name: 'SOFT GOODS',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=700&fit=crop',
      link: '#soft-goods'
    },
    {
      id: 4,
      name: 'ACCESSORIES',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=700&fit=crop',
      link: '#accessories'
    }
  ];

  return (
    <section className="departments">
      <div className="departments-container">
        <h2 className="section-title">DEPARTMENTS</h2>
        <div className="departments-grid">
          {departments.map((dept) => (
            <a 
              key={dept.id} 
              href={dept.link} 
              className="department-card"
            >
              <div className="department-image-wrapper">
                <img 
                  src={dept.image} 
                  alt={dept.name}
                  className="department-image"
                />
                <div className="department-overlay">
                  <h3 className="department-name">{dept.name}</h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Departments;
