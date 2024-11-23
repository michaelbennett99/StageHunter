package db

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/michaelbennett99/stagehunter/backend/lib"
)

// GrandTour enum
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

func (gt GrandTour) String() string {
	return string(gt)
}

// StageType enum
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

func (st StageType) String() string {
	return string(st)
}

// StageInfo struct
type StageInfo struct {
	GrandTour   GrandTour `json:"grand_tour"`
	Year        int       `json:"year"`
	StageNumber int       `json:"stage_no"`
	StageType   StageType `json:"stage_type"`
	StageStart  string    `json:"stage_start"`
	StageEnd    string    `json:"stage_end"`
	StageLength float64   `json:"stage_length"`
}

// ElevationPoint struct
type OrderedElevationPoint interface {
	Less(other OrderedElevationPoint) bool
}

type ElevationPoint struct {
	Distance  float64 `json:"distance"`
	Elevation float64 `json:"elevation"`
}

func (ep ElevationPoint) Less(other ElevationPoint) bool {
	return ep.Distance < other.Distance
}

// GradientPoint struct
type GradientPoint struct {
	Distance  float64               `json:"distance"`
	Elevation float64               `json:"elevation"`
	Gradient  lib.Optional[float64] `json:"gradient"`
}

func (gp GradientPoint) Less(other GradientPoint) bool {
	return gp.Distance < other.Distance
}

// Classification enum
type Classification string

const (
	ClassificationStage     Classification = "stage"
	ClassificationGC        Classification = "gc"
	ClassificationPoints    Classification = "points"
	ClassificationMountains Classification = "mountains"
	ClassificationYouth     Classification = "youth"
	ClassificationTeams     Classification = "teams"
)

var ClassificationMapping = EnumMap[Classification]{
	"stage":     ClassificationStage,
	"general":   ClassificationGC,
	"points":    ClassificationPoints,
	"mountains": ClassificationMountains,
	"youth":     ClassificationYouth,
	"teams":     ClassificationTeams,
}

func (c *Classification) Scan(src any) error {
	return ScanEnum(c, src, ClassificationMapping)
}

func (c Classification) IsValid() bool {
	return IsValidValue(c, ClassificationMapping)
}

// Duration struct
type Duration struct {
	Duration time.Duration
	Valid    bool
}

func (d *Duration) MarshalJSON() ([]byte, error) {
	if !d.Valid {
		return []byte("null"), nil
	}
	return []byte(fmt.Sprintf(`"%s"`, d.Duration.String())), nil
}

func (d *Duration) Scan(src any) error {
	if src == nil {
		d.Valid = false
		return nil
	}

	v := pgtype.Interval{}
	if err := v.Scan(src); err != nil {
		return err
	}
	dur := time.Duration(v.Microseconds) * time.Microsecond
	*d = Duration{Duration: dur, Valid: true}
	return nil
}

// Result struct
type Result struct {
	Rank           int
	Rider          pgtype.Text
	Team           pgtype.Text
	Time           Duration
	Points         pgtype.Int8
	Classification Classification
}
