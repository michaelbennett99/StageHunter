package lib

import "time"

func IsToday(t time.Time) bool {
	now := time.Now()
	sameYear := t.Year() == now.Year()
	sameMonth := t.Month() == now.Month()
	sameDay := t.Day() == now.Day()
	return sameYear && sameMonth && sameDay
}
