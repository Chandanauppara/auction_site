package models

import "time"

type Item struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	StartingPrice float64   `json:"starting_price"`
	EndTime       time.Time `json:"end_time"`
	SellerID      int       `json:"seller_id"`
}
