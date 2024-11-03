package db

import (
	"encoding/json"
	"fmt"
	"time"

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

type OrderedElevationPoint interface {
	Less(other OrderedElevationPoint) bool
}

type ElevationPoint struct {
	Distance  float64
	Elevation float64
}

func (ep ElevationPoint) Less(other ElevationPoint) bool {
	return ep.Distance < other.Distance
}

type GradientPoint struct {
	Distance  float64
	Elevation float64
	Gradient  float64
}

func (gp GradientPoint) Less(other GradientPoint) bool {
	return gp.Distance < other.Distance
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

type Result struct {
	Rank           int            `json:"rank"`
	Name           pgtype.Text    `json:"-"`
	Team           pgtype.Text    `json:"-"`
	Time           Duration       `json:"-"`
	Points         pgtype.Int8    `json:"-"`
	Classification Classification `json:"classification"`
}

func (r *Result) MarshalJSON() ([]byte, error) {
	type Alias Result
	aux := struct {
		Alias
		Name   *string `json:"name,omitempty"`
		Team   *string `json:"team,omitempty"`
		Time   *string `json:"time,omitempty"`
		Points *int64  `json:"points,omitempty"`
	}{}

	aux.Alias = Alias(*r)

	if r.Name.Valid {
		aux.Name = &r.Name.String
	}
	if r.Team.Valid {
		aux.Team = &r.Team.String
	}
	if r.Time.Valid {
		timeStr := r.Time.Duration.String()
		aux.Time = &timeStr
	}
	if r.Points.Valid {
		aux.Points = &r.Points.Int64
	}
	return json.Marshal(aux)
}
