import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';

const NewArrivals = () => {
  const products = [
    {
      id: 1,
      name: 'BREDL SPORTECH TRACKSUIT JACKET BLACK',
      category: 'streetwear',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 139.00,
      salePrice: 125.10,
      isOnSale: true,
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'NIKE SB DUNK LOW PRO',
      category: 'shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 119.00,
      isNew: true,
      shoeSize: ['38', '39', '40', '41', '42', '43', '44', '45']
    },
    {
      id: 3,
      name: 'HOCKEY SKATEBOARDS DECK 8.25"',
      category: 'skate',
      image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 85.00,
      isNew: true,
      deckWidth: '8.25"',
      concave: 'Medium',
      material: '7-Ply Maple'
    },
    {
      id: 4,
      name: 'BREDL SPORTECH TRACKSUIT PANTS GREY',
      category: 'streetwear',
      image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 99.00,
      salePrice: 89.10,
      isOnSale: true,
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 5,
      name: 'CHANNEL ISLANDS SURFBOARD 6\'2"',
      category: 'surf',
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 750.00,
      isNew: true,
      boardLength: '6\'2"',
      boardVolume: '32.5L',
      finSetup: 'Thruster'
    },
    {
      id: 6,
      name: 'SPITFIRE FORMULA FOUR 54MM',
      category: 'skate',
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&h=600&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&h=600&fit=crop&sat=-100',
      regularPrice: 42.00,
      isNew: true,
      wheelSize: '54mm',
      durometer: '99a'
    }
  ];

  return (
    <section className="new-arrivals" id="new-arrivals">
      <div className="container">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="section-cta">
          <a href="#rufus-collection" className="btn-primary">
            BREDL COLLECTION
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
