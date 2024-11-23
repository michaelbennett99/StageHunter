package lib_test

import (
	"testing"

	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func TestGetFieldByTag(t *testing.T) {
	testStruct := struct {
		Field1 string `tag:"value1,other1" other:"other1"`
		Field2 string `tag:"value2" other:"other2"`
	}{
		Field1: "string1",
		Field2: "string2",
	}

	field1, err1 := lib.GetFieldByTag(testStruct, "tag", "value1")
	if err1 != nil {
		t.Fatalf("expected no error, got %s", err1)
	}
	if field1.String() != "string1" {
		t.Fatalf("expected field1 to be string1, got %s", field1.String())
	}

	field1Other, err1Other := lib.GetFieldByTag(testStruct, "other", "other1")
	if err1Other != nil {
		t.Fatalf("expected no error, got %s", err1Other)
	}
	if field1Other.String() != "string1" {
		t.Fatalf(
			"expected field1Other to be string1, got %s",
			field1Other.String(),
		)
	}

	field2, err2 := lib.GetFieldByTag(testStruct, "tag", "value2")
	if err2 != nil {
		t.Fatalf("expected no error, got %s", err2)
	}
	if field2.String() != "string2" {
		t.Fatalf("expected field2 to be string2, got %s", field2.String())
	}

	other1, err3 := lib.GetFieldByTag(testStruct, "other", "other1")
	if err3 != nil {
		t.Fatalf("expected no error, got %s", err3)
	}
	if other1.String() != "string1" {
		t.Fatalf("expected other1 to be string1, got %s", other1.String())
	}

	other2, err4 := lib.GetFieldByTag(testStruct, "other", "other2")
	if err4 != nil {
		t.Fatalf("expected no error, got %s", err4)
	}
	if other2.String() != "string2" {
		t.Fatalf("expected other2 to be string2, got %s", other2.String())
	}

	badTag, err5 := lib.GetFieldByTag(testStruct, "db", "notFound")
	if err5 == nil {
		t.Fatalf("expected error, got nil")
	}
	if badTag.IsValid() {
		t.Fatalf("expected badTag to be invalid, got %s", badTag.String())
	}

	badValue, err6 := lib.GetFieldByTag(testStruct, "tag", "notFound")
	if err6 == nil {
		t.Fatalf("expected error, got nil")
	}
	if badValue.IsValid() {
		t.Fatalf("expected badValue to be invalid, got %s", badValue.String())
	}
}

func TestGetFieldByTagStageInfo(t *testing.T) {
	stageInfo := db.StageInfo{
		GrandTour:   db.GrandTourTour,
		Year:        2024,
		StageNumber: 1,
		StageType:   db.StageTypeRoad,
		StageStart:  "Lyon",
		StageEnd:    "Clermont-Ferrand",
		StageLength: 100.5,
	}
	field, err := lib.GetFieldByTag(stageInfo, "json", "grand_tour")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.String() != "Tour de France" {
		t.Fatalf(
			"expected grand_tour to be Tour de France, got %s",
			field.String(),
		)
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "year")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.Int() != 2024 {
		t.Fatalf("expected year to be 2024, got %d", field.Int())
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "stage_no")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.Int() != 1 {
		t.Fatalf("expected stage_number to be 1, got %d", field.Int())
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "stage_type")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.String() != "Road" {
		t.Fatalf("expected stage_type to be Road, got %s", field.String())
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "stage_start")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.String() != "Lyon" {
		t.Fatalf("expected stage_start to be Lyon, got %s", field.String())
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "stage_end")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.String() != "Clermont-Ferrand" {
		t.Fatalf("expected stage_end to be Clermont-Ferrand, got %s", field.String())
	}

	field, err = lib.GetFieldByTag(stageInfo, "json", "stage_length")
	if err != nil {
		t.Fatalf("expected no error, got %s", err)
	}
	if field.Float() != 100.5 {
		t.Fatalf("expected stage_length to be 100.5, got %f", field.Float())
	}
}
