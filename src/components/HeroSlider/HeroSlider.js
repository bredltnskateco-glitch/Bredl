import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import './HeroSlider.css';

const HeroSlider = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  // Array of skateboard videos - one will be randomly selected on each refresh
  const videos = [
    {
      src: 'https://cdn.pixabay.com/video/2020/05/02/37845-415200790_large.mp4',
      poster: 'https://images.unsplash.com/photo-1564429238909-38f12a608ec4?w=1920&h=1080&fit=crop'
    },
    {
      src: 'https://cdn.pixabay.com/video/2022/11/16/139237-771796548_large.mp4',
      poster: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=1920&h=1080&fit=crop'
    },
    {
      src: 'https://cdn.pixabay.com/video/2016/02/29/2295-157183598_medium.mp4',
      poster: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1920&h=1080&fit=crop'
    }
  ];

  // Randomly select a video on component mount
  const [currentVideo] = useState(() => videos[Math.floor(Math.random() * videos.length)]);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 20;
        const y = (clientY / innerHeight - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Trigger animations on load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to content
  const scrollToContent = () => {
    const nextSection = document.querySelector('.new-arrivals');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-video" ref={heroRef}>
      {/* Video Background */}
      <div className="hero-video-container">
        <video
          ref={videoRef}
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          key={currentVideo.src}
        >
          <source 
            src={currentVideo.src} 
            type="video/mp4" 
          />
        </video>
        <div className="hero-video-overlay"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="hero-grid-pattern"></div>

      {/* Floating Elements */}
      <div 
        className="hero-floating-elements"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}
      >
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Main Content */}
      <div className={`hero-content ${isLoaded ? 'loaded' : ''}`}>

        <h1 className="hero-title">
          <span className="title-line">
            <span className="title-word">RIDE</span>
          </span>
          <span className="title-line">
            <span className="title-word">THE</span>
          </span>
          <span className="title-line title-accent">
            <span className="title-word">STREETS</span>
          </span>
        </h1>

        <p className="hero-description">
          Premium skate gear, streetwear & accessories for those who live to ride.
        </p>

        <div className="hero-cta-group">
          <Link to="/shop" className="hero-cta primary">
            <span className="cta-text">Shop Collection</span>
            <span className="cta-icon">→</span>
          </Link>
          <Link to="/shop/skate" className="hero-cta secondary">
            <span className="cta-text">Explore Skate</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Brands</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Riders</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button className="hero-scroll-indicator" onClick={scrollToContent}>
        <span>Scroll to explore</span>
        <FiChevronDown className="scroll-icon" />
      </button>

      {/* 3D Skateboard Image */}
      <div 
        className="hero-skateboard"
        style={{
          transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${mousePosition.y * -0.3}deg)`
        }}
      >
        <img 
          src="/skateboard.png" 
          alt="Skateboard" 
          className="skateboard-image"
        />
      </div>

      {/* Side Text */}
      <div className="hero-side-text left">SKATE • SURF • SNOW</div>
      <div className="hero-side-text right">EST. 2026</div>
    </section>
  );
};

export default HeroSlider;
