package lib

import (
	"strings"
	"unicode"

	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

var specialChars = map[rune]string{
	'ł': "l",
	'Ł': "L",
	'ø': "o",
	'Ø': "O",
	'æ': "ae",
	'Æ': "AE",
	'ß': "ss",
	'œ': "oe",
	'Œ': "OE",
	'þ': "th",
	'Þ': "TH",
	'ð': "dh",
	'Ð': "DH",
}

func StripAccents(s string) (string, error) {
	// Normalise the string to decomposed form
	result, _, err := transform.String(norm.NFD, s)
	if err != nil {
		return "", err
	}
	// Remove diacritical marks
	t := strings.Map(func(r rune) rune {
		if unicode.Is(unicode.Mn, r) {
			return -1
		}
		return r
	}, result)
	// Replace special characters
	for r, replacement := range specialChars {
		t = strings.ReplaceAll(t, string(r), replacement)
	}
	return t, nil
}
