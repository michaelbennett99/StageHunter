package lib

import (
	"fmt"
	"reflect"
	"strconv"
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

func AreNormEqual(a, b string) bool {
	// Strip accents
	unAccentedA, err := StripAccents(a)
	if err != nil {
		return false
	}
	unAccentedB, err := StripAccents(b)
	if err != nil {
		return false
	}

	// Replace underscores with spaces
	unAccentedA = strings.ReplaceAll(unAccentedA, "_", " ")
	unAccentedB = strings.ReplaceAll(unAccentedB, "_", " ")

	// Remove trailing and leading whitespace
	unAccentedA = strings.TrimSpace(unAccentedA)
	unAccentedB = strings.TrimSpace(unAccentedB)

	// Compare the normalised strings
	return strings.EqualFold(unAccentedA, unAccentedB)
}

func ValueToString(v any) (string, error) {
	if v == nil {
		return "", fmt.Errorf("value is nil")
	}

	switch v := v.(type) {
	case fmt.Stringer:
		return v.String(), nil
	case string:
		return v, nil
	case int, int8, int16, int32, int64:
		return strconv.FormatInt(reflect.ValueOf(v).Int(), 10), nil
	case float32, float64:
		return strconv.FormatFloat(reflect.ValueOf(v).Float(), 'f', -1, 64), nil
	default:
		return "", fmt.Errorf("unsupported type: %T", v)
	}
}
