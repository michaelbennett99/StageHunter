package db

import (
	"errors"
	"fmt"
)

type EnumValue interface {
	~string
}

type EnumMap[T EnumValue] map[string]T

func ScanEnum[T EnumValue](dest *T, src any, mapping EnumMap[T]) error {
	if src == nil {
		return errors.New("null value")
	}

	switch v := src.(type) {
	case string:
		if val, ok := mapping[v]; ok {
			*dest = val
			return nil
		}
		return fmt.Errorf("unsupported value: %s", v)
	case []byte:
		return ScanEnum(dest, string(v), mapping)
	default:
		return fmt.Errorf("unsupported value: %v", src)
	}
}

func IsValidValue[T EnumValue](value T, mapping EnumMap[T]) bool {
	_, ok := mapping[string(value)]
	return ok
}
