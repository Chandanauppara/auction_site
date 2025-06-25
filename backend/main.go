package main

import (
	"database/sql"
	"log"
	"math/rand"
	"net/http"
	"time"

	"auction-system/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB
var jwtKey = []byte("your_secret_key") // Change this in production

func main() {
	// Load environment variables
	initDB()
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}
	// Connect to database
	if err := config.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer config.Close()

	// Initialize Gin router
	r := gin.Default()

	// Use Gin's official CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		api.POST("/users/register", registerUser)
		api.POST("/users/login", loginUser)
		api.POST("/admin/login", adminLogin)
		api.POST("/sellers/login", sellerLogin)
		api.POST("/sellers/register", registerSeller)

		// Protected routes
		auth := api.Group("/")
		auth.Use(authMiddleware)
		{
			auth.POST("/auctions", createItem)
			auth.POST("/auctions/:itemId/bid", placeBid)
			auth.POST("/auctions/:itemId/cancel", cancelAuction)
			auth.GET("/notifications", func(c *gin.Context) {
				c.JSON(http.StatusOK, []gin.H{})
			})
			auth.PUT("/notifications/:id/read", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
			})
			auth.DELETE("/notifications/clear", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Notifications cleared"})
			})
		}

		// Public routes
		api.GET("/auctions", listItems)
		api.GET("/auctions/:itemId", getItem)

		// Seller routes
		api.GET("/sellers/:id/auctions", getSellerAuctions)
	}

	// Start server
	log.Println("Server started successfully")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDB() {
	var err error
	connStr := "user='postgres' password='chandana' dbname='auction_systems' host='localhost' port='5432' sslmode=disable"

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	var dbNameCheck string
	db.QueryRow("SELECT current_database()").Scan(&dbNameCheck)
	log.Printf("Connected to database: %s", dbNameCheck)

	// Drop existing tables if they exist
	// _, err = db.Exec(`
	// 	DROP TABLE IF EXISTS bids CASCADE;
	// 	DROP TABLE IF EXISTS items CASCADE;
	// 	DROP TABLE IF EXISTS users CASCADE;
	// 	DROP TABLE IF EXISTS sellers CASCADE;
	// 	DROP TABLE IF EXISTS admins CASCADE;
	// `)
	// if err != nil {
	// 	log.Fatal("Error dropping tables:", err)
	// }
	// log.Println("Dropped existing tables")

	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS sellers (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS admins (
			id SERIAL PRIMARY KEY,
			username VARCHAR(100) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS items (
			id SERIAL PRIMARY KEY,
			name VARCHAR(200) NOT NULL,
			description TEXT,
			starting_price DECIMAL(10,2) NOT NULL,
			seller_id INTEGER REFERENCES sellers(id),
			end_time TIMESTAMP NOT NULL,
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS bids (
			id SERIAL PRIMARY KEY,
			item_id INTEGER REFERENCES items(id),
			bidder_id INTEGER REFERENCES users(id),
			bid_amount DECIMAL(10,2) NOT NULL,
			bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Error creating tables:", err)
	}
	log.Println("Created database tables successfully")

	// Create default admin
	var adminCount int
	err = db.QueryRow("SELECT COUNT(*) FROM admins").Scan(&adminCount)
	if err != nil {
		log.Fatal(err)
	}

	if adminCount == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal(err)
		}
		_, err = db.Exec("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", "admin", string(hash))
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Default admin created")
	}

	// Create dummy data
	createDummyData()
}

func createDummyData() {
	log.Println("Starting dummy data creation...")

	// Create first seller
	hash1, _ := bcrypt.GenerateFromPassword([]byte("seller123"), bcrypt.DefaultCost)
	var seller1ID int
	err := db.QueryRow(`
		INSERT INTO sellers (name, email, password_hash) 
		VALUES ($1, $2, $3) 
		RETURNING id`,
		"Demo Seller", "seller@example.com", string(hash1),
	).Scan(&seller1ID)
	if err != nil {
		log.Printf("Error creating first seller: %v", err)
		return
	}
	log.Printf("Created first seller with ID: %d", seller1ID)

	// Create second seller
	hash2, _ := bcrypt.GenerateFromPassword([]byte("seller456"), bcrypt.DefaultCost)
	var seller2ID int
	err = db.QueryRow(`
		INSERT INTO sellers (name, email, password_hash) 
		VALUES ($1, $2, $3) 
		RETURNING id`,
		"Luxury Auctions", "luxury@example.com", string(hash2),
	).Scan(&seller2ID)
	if err != nil {
		log.Printf("Error creating second seller: %v", err)
		return
	}
	log.Printf("Created second seller with ID: %d", seller2ID)

	// Create dummy user
	userHash, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	var userID int
	err = db.QueryRow(`
		INSERT INTO users (name, email, password_hash) 
		VALUES ($1, $2, $3) 
		RETURNING id`,
		"Demo User", "user@example.com", string(userHash),
	).Scan(&userID)
	if err != nil {
		log.Printf("Error creating dummy user: %v", err)
		return
	}
	log.Printf("Created dummy user with ID: %d", userID)

	// Create dummy auctions
	dummyItems := []struct {
		name          string
		description   string
		startingPrice float64
		sellerId      int
		endTime       string
	}{
		{
			name:          "Vintage Rolex Submariner",
			description:   "1960s Rolex Submariner in exceptional condition. Original dial and bezel, recently serviced.",
			startingPrice: 15000.00,
			sellerId:      seller1ID,
			endTime:       "NOW() + INTERVAL '7 days'",
		},
		{
			name:          "First Edition Harry Potter Book",
			description:   "First edition, first printing of Harry Potter and the Philosopher's Stone.",
			startingPrice: 25000.00,
			sellerId:      seller1ID,
			endTime:       "NOW() + INTERVAL '5 days'",
		},
		{
			name:          "Classic Mercedes-Benz 300SL",
			description:   "1955 Mercedes-Benz 300SL Gullwing. Silver exterior, red leather interior.",
			startingPrice: 1500000.00,
			sellerId:      seller2ID,
			endTime:       "NOW() + INTERVAL '10 days'",
		},
		{
			name:          "Rare Wine Collection",
			description:   "Collection of 10 bottles of Château Lafite Rothschild (1982-1990).",
			startingPrice: 45000.00,
			sellerId:      seller2ID,
			endTime:       "NOW() + INTERVAL '3 days'",
		},
	}

	// Insert dummy items
	for _, item := range dummyItems {
		var itemID int
		err := db.QueryRow(`
			INSERT INTO items (name, description, starting_price, seller_id, end_time, status)
			VALUES ($1, $2, $3, $4, `+item.endTime+`, 'active')
			RETURNING id`,
			item.name, item.description, item.startingPrice, item.sellerId,
		).Scan(&itemID)
		if err != nil {
			log.Printf("Error creating auction %s: %v", item.name, err)
			continue
		}
		log.Printf("Created auction: %s (ID: %d)", item.name, itemID)

		// Add some bids
		currentPrice := item.startingPrice
		for i := 0; i < 3; i++ {
			bidIncrease := 1.05 + (rand.Float64() * 0.10)
			currentPrice = currentPrice * bidIncrease

			_, err := db.Exec(`
				INSERT INTO bids (item_id, bidder_id, bid_amount, bid_time)
				VALUES ($1, $2, $3, NOW() - INTERVAL '1 hour' * $4)`,
				itemID, userID, currentPrice, i+1,
			)
			if err != nil {
				log.Printf("Error creating bid for auction %d: %v", itemID, err)
			} else {
				log.Printf("Added bid of %.2f for auction %d", currentPrice, itemID)
			}
		}
	}

	log.Println("Dummy data creation completed")
}

func registerUser(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		return
	}
	_, err = db.Exec(
		"INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
		req.Name, req.Email, string(hash),
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func loginUser(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var id int
	var name, hash string
	err := db.QueryRow("SELECT id, name, password_hash FROM users WHERE email = $1", req.Email).
		Scan(&id, &name, &hash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"name":    name,
		"email":   req.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func authMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid token"})
		return
	}
	tokenStr := authHeader[7:]
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	claims := token.Claims.(jwt.MapClaims)
	// Support both user_id and seller_id
	if userID, ok := claims["user_id"].(float64); ok {
		c.Set("user_id", int(userID))
	}
	if sellerID, ok := claims["seller_id"].(float64); ok {
		c.Set("seller_id", int(sellerID))
	}
	c.Next()
}

func createItem(c *gin.Context) {
	var req struct {
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		StartingPrice float64 `json:"starting_price"`
		EndTime       string  `json:"end_time"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	sellerID := c.GetInt("seller_id")
	if sellerID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: seller_id missing"})
		return
	}
	_, err := db.Exec(
		"INSERT INTO items (name, description, starting_price, seller_id, end_time) VALUES ($1, $2, $3, $4, $5)",
		req.Name, req.Description, req.StartingPrice, sellerID, req.EndTime,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item created"})
}

func listItems(c *gin.Context) {
	rows, err := db.Query(`
		SELECT i.id, i.name, i.description, i.starting_price, COALESCE(MAX(b.bid_amount), i.starting_price) as current_price, u.name, i.end_time
		FROM items i
		JOIN users u ON i.seller_id = u.id
		LEFT JOIN bids b ON b.item_id = i.id
		WHERE i.end_time > NOW()
		GROUP BY i.id, u.name
		ORDER BY i.end_time ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch items"})
		return
	}
	defer rows.Close()
	var items []gin.H
	for rows.Next() {
		var id int
		var name, description, seller string
		var startingPrice, currentPrice float64
		var endTime time.Time
		rows.Scan(&id, &name, &description, &startingPrice, &currentPrice, &seller, &endTime)
		items = append(items, gin.H{
			"id": id, "name": name, "description": description,
			"starting_price": startingPrice, "current_price": currentPrice,
			"seller": seller, "end_time": endTime,
		})
	}
	c.JSON(http.StatusOK, items)
}

func getItem(c *gin.Context) {
	itemId := c.Param("itemId")
	var item struct {
		ID                          int
		Name, Description, Seller   string
		StartingPrice, CurrentPrice float64
		EndTime                     time.Time
	}
	err := db.QueryRow(`
		SELECT i.id, i.name, i.description, u.name, i.starting_price, COALESCE(MAX(b.bid_amount), i.starting_price), i.end_time
		FROM items i
		JOIN users u ON i.seller_id = u.id
		LEFT JOIN bids b ON b.item_id = i.id
		WHERE i.id = $1
		GROUP BY i.id, u.name
	`, itemId).Scan(&item.ID, &item.Name, &item.Description, &item.Seller, &item.StartingPrice, &item.CurrentPrice, &item.EndTime)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	rows, _ := db.Query("SELECT bidder_id, bid_amount, bid_time FROM bids WHERE item_id = $1 ORDER BY bid_time DESC", itemId)
	var bids []gin.H
	for rows.Next() {
		var bidderID int
		var amount float64
		var bidTime time.Time
		rows.Scan(&bidderID, &amount, &bidTime)
		bids = append(bids, gin.H{"bidder_id": bidderID, "amount": amount, "bid_time": bidTime})
	}
	c.JSON(http.StatusOK, gin.H{
		"item": item,
		"bids": bids,
	})
}

func placeBid(c *gin.Context) {
	itemId := c.Param("itemId")
	userID := c.GetInt("user_id")
	var req struct {
		BidAmount float64 `json:"bid_amount"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var sellerID int
	var endTime time.Time
	err := db.QueryRow("SELECT seller_id, end_time FROM items WHERE id = $1", itemId).Scan(&sellerID, &endTime)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	if sellerID == userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot bid on your own item"})
		return
	}
	if endTime.Before(time.Now()) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Auction has ended"})
		return
	}
	var currentPrice float64
	db.QueryRow("SELECT COALESCE(MAX(bid_amount), (SELECT starting_price FROM items WHERE id = $1)) FROM bids WHERE item_id = $1", itemId).Scan(&currentPrice)
	if req.BidAmount <= currentPrice {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bid must be higher than current price"})
		return
	}
	_, err = db.Exec("INSERT INTO bids (item_id, bidder_id, bid_amount) VALUES ($1, $2, $3)", itemId, userID, req.BidAmount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not place bid"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bid placed"})
}

func adminLogin(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var id int
	var hash string
	err := db.QueryRow("SELECT id, password_hash FROM admins WHERE username = $1", req.Username).
		Scan(&id, &hash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin_id": id,
		"username": req.Username,
		"role":     "admin",
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"admin": gin.H{
			"id":       id,
			"username": req.Username,
		},
	})
}

func registerSeller(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if email already exists
	var existingID int
	err := db.QueryRow("SELECT id FROM sellers WHERE email = $1", req.Email).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	} else if err != sql.ErrNoRows {
		log.Printf("Database error checking email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Create password hash
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error creating password hash: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		return
	}

	// Insert new seller
	var id int
	err = db.QueryRow(
		"INSERT INTO sellers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		req.Name, req.Email, string(hash),
	).Scan(&id)

	if err != nil {
		log.Printf("Error creating seller: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create seller"})
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"seller_id": id,
		"name":      req.Name,
		"email":     req.Email,
		"role":      "seller",
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		log.Printf("Error creating token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}

	log.Printf("Successfully registered seller: %s (ID: %d)", req.Email, id)
	c.JSON(http.StatusOK, gin.H{
		"message": "Seller registered successfully",
		"token":   tokenString,
		"seller": gin.H{
			"id":    id,
			"name":  req.Name,
			"email": req.Email,
		},
	})
}

func sellerLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Login request error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	log.Printf("Login attempt for email: %s", req.Email)

	var id int
	var name, hash string
	err := db.QueryRow("SELECT id, name, password_hash FROM sellers WHERE email = $1", req.Email).
		Scan(&id, &name, &hash)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		log.Printf("Password mismatch for email: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"seller_id": id,
		"name":      name,
		"email":     req.Email,
		"role":      "seller",
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		log.Printf("Error creating token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}

	log.Printf("Successful login for seller: %s (ID: %d)", req.Email, id)
	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"seller": gin.H{
			"id":    id,
			"name":  name,
			"email": req.Email,
		},
	})
}

func getSellerAuctions(c *gin.Context) {
	sellerID := c.Param("id")

	// Get all auctions for this seller, including cancelled ones
	rows, err := db.Query(`
		SELECT i.id, i.name, i.description, i.starting_price, 
		       CASE 
		           WHEN i.status = 'cancelled' THEN 'cancelled'
		           WHEN i.end_time < NOW() THEN 'ended'
		           ELSE 'active'
		       END as status,
		       i.end_time,
		       COALESCE(MAX(b.bid_amount), i.starting_price) as current_bid,
		       s.name as seller_name
		FROM items i
		JOIN sellers s ON i.seller_id = s.id
		LEFT JOIN bids b ON b.item_id = i.id
		WHERE i.seller_id = $1
		GROUP BY i.id, s.name, i.status
		ORDER BY i.end_time DESC
	`, sellerID)

	if err != nil {
		log.Printf("Error fetching seller auctions: %v", err)
		c.JSON(http.StatusOK, []gin.H{}) // Return empty array on error
		return
	}
	defer rows.Close()

	var auctions []gin.H = []gin.H{} // Ensure initialized as empty array
	for rows.Next() {
		var id int
		var name, description, status, sellerName string
		var startingPrice, currentBid float64
		var endTime time.Time

		err := rows.Scan(&id, &name, &description, &startingPrice, &status, &endTime, &currentBid, &sellerName)
		if err != nil {
			log.Printf("Error scanning auction row: %v", err)
			continue
		}

		// Get bids for this auction
		bidRows, err := db.Query(`
			SELECT b.bid_amount, b.bid_time, u.name as bidder_name
			FROM bids b
			JOIN users u ON b.bidder_id = u.id
			WHERE b.item_id = $1
			ORDER BY b.bid_time DESC
		`, id)

		if err != nil {
			log.Printf("Error fetching bids for auction %d: %v", id, err)
			continue
		}

		var bids []gin.H
		for bidRows.Next() {
			var amount float64
			var bidTime time.Time
			var bidderName string

			err := bidRows.Scan(&amount, &bidTime, &bidderName)
			if err != nil {
				log.Printf("Error scanning bid row: %v", err)
				continue
			}

			bids = append(bids, gin.H{
				"amount":    amount,
				"timestamp": bidTime,
				"userName":  bidderName,
			})
		}
		bidRows.Close()

		auctions = append(auctions, gin.H{
			"id":          id,
			"title":       name,
			"description": description,
			"basePrice":   startingPrice,
			"currentBid":  currentBid,
			"status":      status,
			"endTime":     endTime,
			"sellerName":  sellerName,
			"bids":        bids,
		})
	}

	// Always return an array, even if empty
	c.JSON(http.StatusOK, auctions)
}

func cancelAuction(c *gin.Context) {
	auctionID := c.Param("itemId")
	_, err := db.Exec("UPDATE items SET status = 'cancelled' WHERE id = $1", auctionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not cancel auction"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Auction cancelled successfully"})
}
