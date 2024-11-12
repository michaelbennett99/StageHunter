package lib

import (
	"fmt"
	"reflect"
)

func GetFieldByTag(
	s any, tagName string, tagValue string,
) (reflect.Value, error) {
	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Struct {
		error := fmt.Errorf("expected a struct, got %s", v.Kind())
		return reflect.Value{}, error
	}
	numFields := v.NumField()
	for i := 0; i < numFields; i++ {
		tag, ok := v.Type().Field(i).Tag.Lookup(tagName)
		if !ok {
			continue
		}
		if tag == tagValue {
			return v.Field(i), nil
		}
	}
	error := fmt.Errorf("field with tag %s=%s not found", tagName, tagValue)
	return reflect.Value{}, error
}