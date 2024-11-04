package db_test

import (
	"math"
	"testing"

	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func TestGetInterpolatedGradientPoints(t *testing.T) {
	elevationPoints := []db.ElevationPoint{
		{Distance: 0, Elevation: 0},
		{Distance: 100, Elevation: 10},
		{Distance: 200, Elevation: 10},
		{Distance: 300, Elevation: 0},
		{Distance: 305, Elevation: 1},
	}

	expectedGradientPoints := []db.GradientPoint{
		{Distance: 0, Elevation: 0, Gradient: lib.NewEmptyOptional[float64]()},
		{Distance: 10, Elevation: 1, Gradient: lib.NewOptional(10.0)},
		{Distance: 20, Elevation: 2, Gradient: lib.NewOptional(10.0)},
		{Distance: 30, Elevation: 3, Gradient: lib.NewOptional(10.0)},
		{Distance: 40, Elevation: 4, Gradient: lib.NewOptional(10.0)},
		{Distance: 50, Elevation: 5, Gradient: lib.NewOptional(10.0)},
		{Distance: 60, Elevation: 6, Gradient: lib.NewOptional(10.0)},
		{Distance: 70, Elevation: 7, Gradient: lib.NewOptional(10.0)},
		{Distance: 80, Elevation: 8, Gradient: lib.NewOptional(10.0)},
		{Distance: 90, Elevation: 9, Gradient: lib.NewOptional(10.0)},
		{Distance: 100, Elevation: 10, Gradient: lib.NewOptional(10.0)},
		{Distance: 110, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 120, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 130, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 140, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 150, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 160, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 170, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 180, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 190, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 200, Elevation: 10, Gradient: lib.NewOptional(0.0)},
		{Distance: 210, Elevation: 9, Gradient: lib.NewOptional(-10.0)},
		{Distance: 220, Elevation: 8, Gradient: lib.NewOptional(-10.0)},
		{Distance: 230, Elevation: 7, Gradient: lib.NewOptional(-10.0)},
		{Distance: 240, Elevation: 6, Gradient: lib.NewOptional(-10.0)},
		{Distance: 250, Elevation: 5, Gradient: lib.NewOptional(-10.0)},
		{Distance: 260, Elevation: 4, Gradient: lib.NewOptional(-10.0)},
		{Distance: 270, Elevation: 3, Gradient: lib.NewOptional(-10.0)},
		{Distance: 280, Elevation: 2, Gradient: lib.NewOptional(-10.0)},
		{Distance: 290, Elevation: 1, Gradient: lib.NewOptional(-10.0)},
		{Distance: 300, Elevation: 0, Gradient: lib.NewOptional(-10.0)},
		{Distance: 305, Elevation: 1, Gradient: lib.NewOptional(20.0)},
	}

	gradientPoints, err := db.GetInterpolatedGradientPoints(
		elevationPoints, 10.0,
	)
	if err != nil {
		t.Fatal(err)
	}

	const epsilon = 0.0001
	if len(gradientPoints) != len(expectedGradientPoints) {
		t.Fatalf("expected %d gradient points, got %d", len(expectedGradientPoints), len(gradientPoints))
	}
	for i := range gradientPoints {
		expected := expectedGradientPoints[i]
		actual := gradientPoints[i]
		if !approxEqual(actual.Distance, expected.Distance, epsilon) {
			t.Errorf("expected distance %f, got %f", expected.Distance, actual.Distance)
		}
		if !approxEqual(actual.Elevation, expected.Elevation, epsilon) {
			t.Errorf("expected elevation %f, got %f", expected.Elevation, actual.Elevation)
		}
		if !approxEqualOptional(actual.Gradient, expected.Gradient, epsilon) {
			t.Errorf("expected gradient %v, got %v", expected.Gradient, actual.Gradient)
		}
	}
}

func approxEqual(a, b, epsilon float64) bool {
	return math.Abs(a-b) < epsilon
}

func approxEqualOptional(a, b lib.Optional[float64], epsilon float64) bool {
	if a.HasValue() && b.HasValue() {
		return approxEqual(a.MustValue(), b.MustValue(), epsilon)
	}
	return !a.HasValue() && !b.HasValue()
}
