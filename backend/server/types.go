package server

import (
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/michaelbennett99/stagehunter/backend/db"
)

type Result struct {
	Rank           int               `json:"rank"`
	Rider          *string           `json:"rider,omitempty"`
	Team           *string           `json:"team,omitempty"`
	Time           *string           `json:"time,omitempty"`
	Points         *int64            `json:"points,omitempty"`
	Classification db.Classification `json:"classification"`
}

func NewResult(dbResult db.Result) Result {
	result := Result{
		Rank:           dbResult.Rank,
		Classification: dbResult.Classification,
	}
	if dbResult.Rider.Valid {
		result.Rider = &dbResult.Rider.String
	}
	if dbResult.Team.Valid {
		result.Team = &dbResult.Team.String
	}
	if dbResult.Time.Valid {
		timeStr := dbResult.Time.Duration.String()
		result.Time = &timeStr
	}
	if dbResult.Points.Valid {
		result.Points = &dbResult.Points.Int64
	}
	return result
}

func NewResults(dbResults []db.Result) []Result {
	results := make([]Result, len(dbResults))
	for i, dbResult := range dbResults {
		results[i] = NewResult(dbResult)
	}
	return results
}

type RiderOrTeam struct {
	isRider bool
	value   string
}

func NewRiderOrTeam(rider, team *string) (RiderOrTeam, error) {
	// Team should always be non-nil
	if team == nil {
		return RiderOrTeam{}, errors.New("team cannot be nil")
	}
	// Set the value to the rider if it is non-nil
	if rider != nil {
		return RiderOrTeam{isRider: true, value: *rider}, nil
	}
	// Otherwise, the value is the team
	return RiderOrTeam{isRider: false, value: *team}, nil
}

func StringRefFromPGText(pgText pgtype.Text) *string {
	if pgText.Valid {
		return &pgText.String
	}
	return nil
}

func NewRiderOrTeamFromDBResult(dbResult db.Result) (RiderOrTeam, error) {
	return NewRiderOrTeam(
		StringRefFromPGText(dbResult.Rider),
		StringRefFromPGText(dbResult.Team),
	)
}

func (r *RiderOrTeam) IsRider() bool {
	return r.isRider
}

func (r *RiderOrTeam) Reduce() string {
	return r.value
}
