package models

import "time"

type Bid struct {
	ID        int       `json:"id"`
	ItemID    int       `json:"item_id"`
	UserID    int       `json:"user_id"`
	BidAmount float64   `json:"bid_amount"`
	BidTime   time.Time `json:"bid_time"`
}
