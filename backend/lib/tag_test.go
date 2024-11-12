package lib_test

import (
	"testing"

	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func TestGetFieldByTag(t *testing.T) {
	testStruct := struct {
		Field1 string `tag:"value1" other:"other1"`
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
