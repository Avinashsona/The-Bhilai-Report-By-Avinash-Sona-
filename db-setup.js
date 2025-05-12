// Database setup for The Bhilai Report news website
const { Pool } = require('pg');
const fs = require('fs');

// Connect to database using environment variables
const pool = new Pool({
  // connection details will be read from environment variables
  // DATABASE_URL, or PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
});

// SQL for creating the tables
const createTableQueries = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- News-Tags relationship
CREATE TABLE IF NOT EXISTS news_tags (
  news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, tag_id)
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(255) NOT NULL,
  filetype VARCHAR(50) NOT NULL,
  filesize INTEGER NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string'
);
`;

// SQL for inserting initial data
const insertInitialDataQueries = `
-- Insert default admin user (password should be hashed in production)
INSERT INTO users (username, password, display_name, email, role) 
VALUES ('admin', 'password', 'अविनाश सोना', 'admin@thebhilaireport.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description) 
VALUES 
  ('भिलाई', 'bhilai', 'भिलाई शहर से संबंधित समाचार'),
  ('छत्तीसगढ़', 'chhattisgarh', 'छत्तीसगढ़ राज्य से संबंधित समाचार'),
  ('राष्ट्रीय', 'national', 'भारत से संबंधित समाचार'),
  ('अंतरराष्ट्रीय', 'international', 'दुनिया भर से समाचार'),
  ('खेल', 'sports', 'खेल समाचार और अपडेट'),
  ('व्यापार', 'business', 'व्यापार और आर्थिक समाचार'),
  ('मनोरंजन', 'entertainment', 'फिल्म, संगीत और मनोरंजन समाचार'),
  ('टेक्नोलॉजी', 'technology', 'प्रौद्योगिकी और इंटरनेट समाचार')
ON CONFLICT (slug) DO NOTHING;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES 
  ('site_title', 'The Bhilai Report - भिलाई की आवाज़', 'string'),
  ('site_tagline', 'भिलाई और छत्तीसगढ़ की ताज़ा खबरें', 'string'),
  ('site_logo', 'bhilai-report-logo.png', 'string'),
  ('default_language', 'hi', 'string'),
  ('timezone', 'Asia/Kolkata', 'string'),
  ('date_format', 'd-m-Y', 'string'),
  ('meta_description', 'भिलाई रिपोर्ट (The Bhilai Report) पर भिलाई, छत्तीसगढ़ और भारत की ताज़ा खबरें पढ़ें। राजनीति, व्यापार, खेल, मनोरंजन और अन्य समाचार के लिए हमें फॉलो करें।', 'string'),
  ('meta_keywords', 'भिलाई न्यूज़, छत्तीसगढ़ समाचार, भिलाई स्टील प्लांट, छत्तीसगढ़ खबरें, हिंदी न्यूज़', 'string'),
  ('social_sharing', 'true', 'boolean'),
  ('auto_social_publish', 'true', 'boolean')
ON CONFLICT (setting_key) DO NOTHING;
`;

// Function to set up the database
async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Creating tables...');
    await client.query(createTableQueries);
    
    console.log('Inserting initial data...');
    await client.query(insertInitialDataQueries);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database setup completed successfully!');
  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', err);
    throw err;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Function to add a news article
async function addNews(newsData) {
  const { title, slug, excerpt, content, category_id, author_id, status, featured_image, is_featured, is_breaking, tags } = newsData;
  
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Insert news article
    const newsResult = await client.query(
      `INSERT INTO news 
      (title, slug, excerpt, content, category_id, author_id, status, featured_image, is_featured, is_breaking, published_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id`,
      [title, slug, excerpt, content, category_id, author_id, status, featured_image, is_featured, is_breaking, status === 'published' ? new Date() : null]
    );
    
    const newsId = newsResult.rows[0].id;
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create slug from tag name
        const tagSlug = tagName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
        
        // Insert tag if it doesn't exist
        const tagResult = await client.query(
          `INSERT INTO tags (name, slug) 
           VALUES ($1, $2) 
           ON CONFLICT (slug) DO UPDATE SET name = $1
           RETURNING id`,
          [tagName, tagSlug]
        );
        
        const tagId = tagResult.rows[0].id;
        
        // Create relationship between news and tag
        await client.query(
          `INSERT INTO news_tags (news_id, tag_id) 
           VALUES ($1, $2)
           ON CONFLICT (news_id, tag_id) DO NOTHING`,
          [newsId, tagId]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`News article "${title}" added successfully with ID: ${newsId}`);
    return newsId;
  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error adding news:', err);
    throw err;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Function to update a news article
async function updateNews(id, newsData) {
  const { title, slug, excerpt, content, category_id, status, featured_image, is_featured, is_breaking, tags } = newsData;
  
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Update news article
    await client.query(
      `UPDATE news 
       SET title = $1, 
           slug = $2, 
           excerpt = $3, 
           content = $4, 
           category_id = $5, 
           status = $6, 
           featured_image = $7, 
           is_featured = $8, 
           is_breaking = $9,
           published_at = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11`,
      [
        title, 
        slug, 
        excerpt, 
        content, 
        category_id, 
        status, 
        featured_image, 
        is_featured, 
        is_breaking,
        status === 'published' ? new Date() : null,
        id
      ]
    );
    
    // Update tags if provided
    if (tags && tags.length > 0) {
      // Remove existing tags for this news
      await client.query('DELETE FROM news_tags WHERE news_id = $1', [id]);
      
      // Add new tags
      for (const tagName of tags) {
        // Create slug from tag name
        const tagSlug = tagName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
        
        // Insert tag if it doesn't exist
        const tagResult = await client.query(
          `INSERT INTO tags (name, slug) 
           VALUES ($1, $2) 
           ON CONFLICT (slug) DO UPDATE SET name = $1
           RETURNING id`,
          [tagName, tagSlug]
        );
        
        const tagId = tagResult.rows[0].id;
        
        // Create relationship between news and tag
        await client.query(
          `INSERT INTO news_tags (news_id, tag_id) 
           VALUES ($1, $2)
           ON CONFLICT (news_id, tag_id) DO NOTHING`,
          [id, tagId]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`News article with ID ${id} updated successfully`);
    return true;
  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error updating news:', err);
    throw err;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Function to delete a news article
async function deleteNews(id) {
  try {
    // Delete news article (relationships will be cascade deleted)
    const result = await pool.query('DELETE FROM news WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      throw new Error(`News article with ID ${id} not found`);
    }
    
    console.log(`News article with ID ${id} deleted successfully`);
    return true;
  } catch (err) {
    console.error('Error deleting news:', err);
    throw err;
  }
}

// Function to get all news articles with pagination
async function getNews(page = 1, limit = 10, options = {}) {
  const offset = (page - 1) * limit;
  const { category, status, search } = options;
  
  let query = `
    SELECT n.*, c.name as category_name, u.display_name as author_name
    FROM news n
    JOIN categories c ON n.category_id = c.id
    JOIN users u ON n.author_id = u.id
    WHERE 1=1
  `;
  
  const queryParams = [];
  let paramCounter = 1;
  
  if (category) {
    query += ` AND c.slug = $${paramCounter}`;
    queryParams.push(category);
    paramCounter++;
  }
  
  if (status) {
    query += ` AND n.status = $${paramCounter}`;
    queryParams.push(status);
    paramCounter++;
  }
  
  if (search) {
    query += ` AND (n.title ILIKE $${paramCounter} OR n.content ILIKE $${paramCounter})`;
    queryParams.push(`%${search}%`);
    paramCounter++;
  }
  
  query += ` ORDER BY n.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
  queryParams.push(limit, offset);
  
  try {
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM news n
      JOIN categories c ON n.category_id = c.id
      WHERE 1=1
    `;
    
    let countParams = [];
    let countParamCounter = 1;
    
    if (category) {
      countQuery += ` AND c.slug = $${countParamCounter}`;
      countParams.push(category);
      countParamCounter++;
    }
    
    if (status) {
      countQuery += ` AND n.status = $${countParamCounter}`;
      countParams.push(status);
      countParamCounter++;
    }
    
    if (search) {
      countQuery += ` AND (n.title ILIKE $${countParamCounter} OR n.content ILIKE $${countParamCounter})`;
      countParams.push(`%${search}%`);
      countParamCounter++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return {
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error('Error getting news:', err);
    throw err;
  }
}

// Export functions
module.exports = {
  setupDatabase,
  addNews,
  updateNews,
  deleteNews,
  getNews,
  pool // Export pool for other direct database operations
};

// If this script is run directly, setup the database
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database setup complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}