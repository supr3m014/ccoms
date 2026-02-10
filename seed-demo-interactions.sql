-- Insert demo interaction data for testing

INSERT INTO interactions (name, email, phone, company, message, type, status, source, created_at) VALUES
('John Smith', 'john.smith@email.com', '555-0101', 'Acme Corp', 'Interested in your SEO services for our e-commerce website.', 'contact', 'new', 'contact_form', NOW() - INTERVAL '2 hours'),
('Sarah Johnson', 'sarah.j@techstart.com', '555-0102', 'TechStart Inc', 'We need help with local SEO for our three store locations.', 'contact', 'replied', 'contact_form', NOW() - INTERVAL '5 hours'),
('Michael Chen', 'mchen@bizgrowth.com', '555-0103', 'BizGrowth Solutions', 'Looking for a complete website redesign and development.', 'consultation', 'in_progress', 'website', NOW() - INTERVAL '1 day'),
('Emily Rodriguez', 'emily.r@startup.io', '555-0104', 'Startup.io', 'Interested in your mobile app development services.', 'consultation', 'new', 'referral', NOW() - INTERVAL '1 day'),
('David Williams', 'dwilliams@localshop.com', '555-0105', 'Local Shop', 'Need help with Google Business Profile optimization.', 'contact', 'replied', 'contact_form', NOW() - INTERVAL '2 days'),
('Lisa Anderson', 'lisa@brandco.com', '555-0106', 'Brand Co', 'Looking for brand marketing and design services.', 'consultation', 'completed', 'email', NOW() - INTERVAL '3 days'),
('James Taylor', 'jtaylor@retailplus.com', '555-0107', 'Retail Plus', 'Want to discuss video production for product demos.', 'contact', 'new', 'phone', NOW() - INTERVAL '3 days'),
('Jennifer Martinez', 'jmartinez@services.com', '555-0108', 'Pro Services', 'Interested in AEO services to improve our content visibility.', 'consultation', 'in_progress', 'contact_form', NOW() - INTERVAL '4 days'),
('Robert Brown', 'rbrown@enterprise.com', '555-0109', 'Enterprise Solutions', 'Need comprehensive SEO audit and strategy.', 'contact', 'replied', 'website', NOW() - INTERVAL '5 days'),
('Amanda Lee', 'alee@growing.com', '555-0110', 'Growing Business', 'Looking for ongoing SEO maintenance services.', 'contact', 'new', 'contact_form', NOW() - INTERVAL '6 days');
