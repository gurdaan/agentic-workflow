import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="company-footer">
      <div class="footer-content">
        <div class="company-info">
          <div class="company-section">
            <h3 class="company-name">Jonas AI Solutions</h3>
            <div class="company-address">
              <p>123 Innovation Drive</p>
              <p>Tech Valley, CA 94043</p>
              <p>United States</p>
            </div>
          </div>
          
          <div class="contact-section">
            <h4 class="contact-title">Contact Us</h4>
            <div class="contact-links">
              <a href="tel:+1-555-123-4567" class="contact-link phone-link">
                <span class="contact-icon">📞</span>
                <span class="contact-text">+1 (555) 123-4567</span>
              </a>
              <a href="mailto:support@jonas-ai.com" class="contact-link email-link">
                <span class="contact-icon">✉️</span>
                <span class="contact-text">support&#64;jonas-ai.com</span>
              </a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">© 2024 Jonas AI Solutions. All rights reserved.</p>
          <p class="tagline">Empowering businesses with intelligent AI solutions</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./company-footer.component.css']
})
export class CompanyFooterComponent {
}