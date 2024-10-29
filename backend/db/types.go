package db

import (
	"github.com/jackc/pgx/v5/pgtype"
)

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

type ElevationPoint struct {
	Distance  float64
	Elevation int
}

type Classification string

const (
	ClassificationStage     Classification = "stage"
	ClassificationGC        Classification = "gc"
	ClassificationPoints    Classification = "points"
	ClassificationMountains Classification = "mountains"
	ClassificationYouth     Classification = "youth"
	ClassificationTeams     Classification = "teams"
)

var classificationMapping = EnumMap[Classification]{
	"stage":     ClassificationStage,
	"general":   ClassificationGC,
	"points":    ClassificationPoints,
	"mountains": ClassificationMountains,
	"youth":     ClassificationYouth,
	"teams":     ClassificationTeams,
}

func (c *Classification) Scan(src any) error {
	return ScanEnum(c, src, classificationMapping)
}

type Result struct {
	Rank           int
	Name           pgtype.Text
	Team           pgtype.Text
	Time           pgtype.Interval
	Points         pgtype.Int8
	Classification Classification
}
