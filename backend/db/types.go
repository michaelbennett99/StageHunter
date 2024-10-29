package db

import (
	"errors"
)

type Nullable[T any] struct {
	Valid bool
	Value T
}

func (n *Nullable[T]) Extract() (T, error) {
	if !n.Valid {
		var zero T
		return zero, errors.New("null value")
	}
	return n.Value, nil
}

type StageID int

type GrandTour string

const (
	GrandTourTour   GrandTour = "Tour de France"
	GrandTourVuelta GrandTour = "Vuelta a España"
	GrandTourGiro   GrandTour = "Giro d'Italia"
)

var grandTourMapping = EnumMap[GrandTour]{
	"TOUR":   GrandTourTour,
	"VUELTA": GrandTourVuelta,
	"GIRO":   GrandTourGiro,
}

func (gt *GrandTour) Scan(src any) error {
	return ScanEnum(gt, src, grandTourMapping)
}

type StageType string

const (
	StageTypeRoad     StageType = "Road"
	StageTypeITT      StageType = "ITT"
	StageTypeTTT      StageType = "TTT"
	StageTypePrologue StageType = "Prologue"
)

var stageTypeMapping = EnumMap[StageType]{
	"ROAD":     StageTypeRoad,
	"ITT":      StageTypeITT,
	"TTT":      StageTypeTTT,
	"PROLOGUE": StageTypePrologue,
}

func (st *StageType) Scan(src any) error {
	return ScanEnum(st, src, stageTypeMapping)
}

type StageInfo struct {
	GrandTour   GrandTour
	Year        int
	StageNumber int
	StageType   StageType
	StageStart  string
	StageEnd    string
	StageLength float64
}
