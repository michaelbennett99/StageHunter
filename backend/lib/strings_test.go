package lib_test

import (
	"testing"

	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func TestStripAccents(t *testing.T) {
	testPairs := []struct {
		input    string
		expected string
	}{
		{"Tadej Pogačar", "Tadej Pogacar"},
		{"Rémi Cavagnard", "Remi Cavagnard"},
		{"Léonie Pigot", "Leonie Pigot"},
		{"Primož Roglič", "Primoz Roglic"},
		{"Rafał Majka", "Rafal Majka"},
		{"Jérôme Pineau", "Jerome Pineau"},
		{"Fränk Schleck", "Frank Schleck"},
		{"Óscar Pereiro", "Oscar Pereiro"},
		{"José Joaquín Rojas", "Jose Joaquin Rojas"},
		{"Ben O'Connor", "Ben O'Connor"},
	}
	for _, pair := range testPairs {
		actual, err := lib.StripAccents(pair.input)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if actual != pair.expected {
			t.Errorf("expected %s, got %s", pair.expected, actual)
		}
	}
}
