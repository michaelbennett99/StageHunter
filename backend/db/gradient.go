package db

import (
	"errors"
	"math"

	"golang.org/x/exp/constraints"
	"golang.org/x/exp/slices"
)

func cmpElevationPoint(i, j ElevationPoint) int {
	if i.Less(j) {
		return -1
	}
	if j.Less(i) {
		return 1
	}
	return 0
}

func isSorted(elevationPoints []ElevationPoint) bool {
	return slices.IsSortedFunc(elevationPoints, cmpElevationPoint)
}

func getInterpolatedElevation(
	elevationPoints []ElevationPoint,
	distance float64,
) (float64, error) {
	// Sort the points if they are not already sorted
	if !isSorted(elevationPoints) {
		slices.SortFunc(elevationPoints, cmpElevationPoint)
	}

	// Search for the points on either side of the distance
	numPoints := len(elevationPoints)

	// Edge cases where the distance is outside the range of the points
	if numPoints == 0 {
		return 0, errors.New("no points")
	}
	if distance < elevationPoints[0].Distance {
		return 0, errors.New("distance is less than the first point")
	}
	if distance > elevationPoints[numPoints-1].Distance {
		return 0, errors.New("distance is greater than the last point")
	}

	// Find the two points that the distance is between
	// Binary search to find the leftmost point >= distance
	left, _ := slices.BinarySearchFunc(
		elevationPoints, ElevationPoint{Distance: distance}, cmpElevationPoint,
	)
	// After binary search, left points to the first element >= distance
	if left > 0 {
		left = left - 1
	}
	right := left + 1

	p1 := elevationPoints[left]
	p2 := elevationPoints[right]
	ratio := (distance - p1.Distance) / (p2.Distance - p1.Distance)
	return float64(p1.Elevation) + ratio*float64(p2.Elevation-p1.Elevation), nil
}

// Calculate the gradient as a percentage.
// changeEle is the change in elevation, changeDist is the change in distance.
// changeEle and changeDist must have the same units.
func calculateGradient[T, U constraints.Float](
	changeEle T,
	changeDist U,
) T {
	return (changeEle / T(changeDist)) * 100
}

func GetInterpolatedGradientPoints(
	elevationPoints []ElevationPoint,
	resolution float64,
) ([]GradientPoint, error) {
	if !isSorted(elevationPoints) {
		slices.SortFunc(elevationPoints, cmpElevationPoint)
	}

	nElevationPoints := len(elevationPoints)
	maxDistance := elevationPoints[nElevationPoints-1].Distance
	finalElevation := float64(elevationPoints[nElevationPoints-1].Elevation)

	// Get number of interior points to interpolate
	numPoints := int(math.Floor(maxDistance / resolution))
	// Add two points to include the first and last points
	gradientPoints := make([]GradientPoint, numPoints+2)

	gradientPoints[0] = GradientPoint{
		Distance:  0,
		Elevation: float64(elevationPoints[0].Elevation),
		Gradient:  0,
	}

	for i := 1; i <= numPoints; i++ {
		distance := resolution * float64(i)
		elevation, err := getInterpolatedElevation(elevationPoints, distance)
		if err != nil {
			return nil, err
		}

		// Decimal gradient
		prevElevation := gradientPoints[i-1].Elevation
		gradient := calculateGradient(elevation-prevElevation, resolution)
		gradientPoints[i] = GradientPoint{
			Distance:  distance,
			Elevation: elevation,
			Gradient:  gradient,
		}
	}

	gradient := calculateGradient(
		finalElevation-gradientPoints[numPoints].Elevation,
		maxDistance-gradientPoints[numPoints].Distance,
	)
	gradientPoints[numPoints+1] = GradientPoint{
		Distance:  maxDistance,
		Elevation: finalElevation,
		Gradient:  gradient,
	}

	return gradientPoints, nil
}
