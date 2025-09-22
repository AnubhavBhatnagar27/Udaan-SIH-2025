import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";
import logo from "../assets/logo_landingpage.jpg";
import image from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";


function App() {
  const navigate = useNavigate();
  // ✅ Fade-in & slide-up scroll effect hook
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  // ✅ Ref for Counseling section
  const counselingRef = useRef(null);

  // ✅ Scroll function for Counseling
  const scrollToCounseling = () => {
    counselingRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-container">
      {/* ✅ Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Udaan Logo" className="navbar-logo" />
        </div>
        <nav className="navbar-right">
          <a href="#about">About Us</a>
          <a href="#alerts">Alerts</a>
          {/* ✅ Counseling scroll button */}
          <button
            onClick={scrollToCounseling}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "550",
              fontSize: "1.1rem",
              transition: "color 0.3s ease",
            }}
          >
            Counseling
          </button>
        </nav>
      </header>

      {/* ✅ Hero Section */}
      <div className="hero-container">
        <h1 className="hero-title">
          Because Every Student <br />Deserves a Chance to Fly High.
        </h1>
        <p className="hero-subtitle">
        Empowering Every Student with Personalized Counseling, Real-Time Alerts, and Data-Driven Insights to Ensure Success and Prevent Dropouts
        </p>
        <div className="hero-buttons">
          <button className="hero-button" onClick={() => navigate('/login')}>Proceed with Udaan</button>
          
        </div>

        {/* ✅ Services Section */}
        <div className="services" id="services">
          <div className="service-card fade-in">
            <div className="icon" role="img" aria-label="Risk Analysis">💻</div>
            <h3>Risk Analysis</h3>
            <p>Understanding Risk, Guiding Every Student to Success</p>
          </div>
          <div className="service-card fade-in">
            <div className="icon" role="img" aria-label="Counseling">🎬</div>
            <h3>Counseling System</h3>
            <p>Counseling That Understands, Guides, and Inspires</p>
          </div>
          <div className="service-card fade-in">
            <div className="icon" role="img" aria-label="Alert">📄</div>
            <h3>Alert Notification</h3>
            <p>Alert: Time to Support a Learner and Keep Them on Track</p>
          </div>
        </div>
      </div>

      {/* ✅ About Section */}
      <div className="about-section" id="about">
        <div className="about-content">
          <div className="about-image fade-in">
            <img src={image} alt="About Us" />
          </div>
          <div className="about-text fade-in">
            <h2>About Us</h2>
            <p>
              At BitCrew, we are dedicated to building an AI-powered <span className="highlight">dropout prediction</span> and counseling system designed to support students, mentors, and institutions.
              <br /><br />
              Our solution integrates attendance, test scores, and academic records into a single smart dashboard that highlights <span className="highlight">at-risk students</span> early. This enables timely action and ensures no student is left behind.
              <br /><br />
              By combining simple rules with <span className="highlight">machine learning insights</span>, we deliver clear, actionable alerts to mentors and parents—helping reduce dropout rates, improve student success, and strengthen institutional outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Alert Section */}
      <div className="Alert-section" id="alerts">
        <div className="-content">
          <div className="Alert-image fade-in">
            <img src={image2} alt="Alerts" />
          </div>
          <div className="Alert-text fade-in">
            <h2>Our Smart Alert System</h2>
            <p>
              Traditional systems often miss early warning signs due to scattered data. 
              UDAAN integrates all <span className="highlight">student data</span> into a single view, moving from reactive responses to proactive intervention.
              <br /><br />
              Our dashboard uses clear rules to identify <span className="highlight">at-risk students</span>, highlighting them intuitively. 
              This transparent logic empowers educators, providing quick insights without overriding their expertise.
              <br /><br />
              The Smart Alert System automatically notifies <span className="highlight">mentors and guardians</span> promptly. 
              This ensures early, data-driven intervention, significantly reducing dropout rates before disengagement is irreversible.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Counseling Section */}
      <div className="counseling-section" id="counseling" ref={counselingRef}>
        <h2 className="section-title fade-in">Counseling System</h2>
        <div className="counseling-cards">
          <div className="counseling-card fade-in">
            <div className="icon">🧑‍🏫</div>
            <h3>One-on-One Counseling</h3>
            <p>Personal guidance for each student to support academic and emotional needs.</p>
          </div>

          <div className="counseling-card fade-in">
            <div className="icon">👥</div>
            <h3>Group Sessions</h3>
            <p>Interactive workshops to build skills, manage stress, and enhance learning.</p>
          </div>

          <div className="counseling-card fade-in">
            <div className="icon">📊</div>
            <h3>Progress Monitoring</h3>
            <p>Track performance and engagement to ensure students stay on track.</p>
          </div>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <img src={logo} alt="Udaan Logo" className="footer-logo" />
            <p>
              Udaan is committed to guiding students towards success with insightful
              risk analysis, counseling, and timely alerts.
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#alerts">Alerts</a></li>
              <li><a href="Counseling">Counseling</a></li>
            </ul>
          </div>
          <div className="footer-contact" id="contact">
            <h4>Contact Us</h4>
            <p>Email: support@udaan.com</p>
            <p>Phone: +91 123 456 7890</p>
            <p>Address: 123, Knowledge Street, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Udaan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
