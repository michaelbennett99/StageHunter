package server

import (
	"fmt"
	"net/http"
	"strconv"
)

//
// QueryParamInterface
//

type QueryParamInterface interface {
	Name() string
	Hydrated() bool
	SetValue(string) error
	GetValue() any
	SetDefault() error
}

//
// URLQueryParam Struct
//

// URLQueryParam represents a URL query parameter.
//
// It is used to parse URL query parameters from an HTTP request. Parameters
// are coerced to the specified type with a user defined function, and the
// value is hydrated when the parameter is found in the request.
type URLQueryParam[T any] struct {
	name         string
	coerce       func(string) (T, error)
	value        T
	hydrated     bool
	defaultValue *T
}

//
// Methods
//

func (q *URLQueryParam[T]) Name() string {
	return q.name
}

func (q *URLQueryParam[T]) Hydrated() bool {
	return q.hydrated
}

func (q *URLQueryParam[T]) SetValue(value string) error {
	if q.Hydrated() {
		return fmt.Errorf("parameter %s is already hydrated", q.Name())
	}
	v, err := q.coerce(value)
	if err != nil {
		return err
	}
	q.hydrated = true
	q.value = v
	return nil
}

func (q *URLQueryParam[T]) GetValue() any {
	return q.value
}

func (q *URLQueryParam[T]) SetDefault() error {
	if q.defaultValue == nil {
		return fmt.Errorf("parameter %s has no default value", q.Name())
	}
	if q.Hydrated() {
		return fmt.Errorf("parameter %s is already hydrated", q.Name())
	}
	q.hydrated = true
	q.value = *q.defaultValue
	return nil
}

//
// Constructors
//

func NewQueryParamWithDefault[T any](
	name string, coerce func(string) (T, error), defaultValue *T,
) *URLQueryParam[T] {
	return &URLQueryParam[T]{
		name:         name,
		coerce:       coerce,
		value:        *new(T),
		hydrated:     false,
		defaultValue: defaultValue,
	}
}

func NewQueryParam[T any](
	name string, coerce func(string) (T, error),
) *URLQueryParam[T] {
	return NewQueryParamWithDefault(name, coerce, nil)
}

func coerceString(value string) (string, error) {
	return value, nil
}

func NewStringQueryParamWithDefault(
	name string, defaultValue string,
) *URLQueryParam[string] {
	return NewQueryParamWithDefault(name, coerceString, &defaultValue)
}

func NewStringQueryParam(name string) *URLQueryParam[string] {
	return NewQueryParam(name, coerceString)
}

func coerceInt(value string) (int, error) {
	return strconv.Atoi(value)
}

func NewIntQueryParamWithDefault(
	name string, defaultValue int,
) *URLQueryParam[int] {
	return NewQueryParamWithDefault(name, coerceInt, &defaultValue)
}

func NewIntQueryParam(name string) *URLQueryParam[int] {
	return NewQueryParam(name, coerceInt)
}

func coerceBool(value string) (bool, error) {
	return strconv.ParseBool(value)
}

func NewBoolQueryParamWithDefault(
	name string, defaultValue bool,
) *URLQueryParam[bool] {
	return NewQueryParamWithDefault(name, coerceBool, &defaultValue)
}

func NewBoolQueryParam(name string) *URLQueryParam[bool] {
	return NewQueryParam(name, coerceBool)
}

func coerceFloat64(value string) (float64, error) {
	return strconv.ParseFloat(value, 64)
}

func NewFloatQueryParamWithDefault(
	name string, defaultValue float64,
) *URLQueryParam[float64] {
	return NewQueryParamWithDefault(name, coerceFloat64, &defaultValue)
}

func NewFloatQueryParam(name string) *URLQueryParam[float64] {
	return NewQueryParam(name, coerceFloat64)
}

//
// Helpers
//

func GetParamValue[T any](param QueryParamInterface) (T, error) {
	v, ok := param.GetValue().(T)
	if !ok {
		return *new(T), fmt.Errorf("value is not of type %T", v)
	}
	return v, nil
}

// GetQueryParams returns a map of the query parameters, a list of the found
// parameters, and a list of the not found parameters.
func GetQueryParams(
	r *http.Request, required, optional []QueryParamInterface,
) (map[string]QueryParamInterface, []string, []string, error) {
	queryParams := r.URL.Query()

	// Set up data structures to hold results
	queryMap := make(
		map[string]QueryParamInterface, len(required)+len(optional),
	)
	found := make([]string, 0, len(required)+len(optional))
	notFound := make([]string, 0, len(required)+len(optional))

	// Process required parameters
	for _, param := range required {
		value := queryParams.Get(param.Name())
		if value == "" {
			notFound = append(notFound, param.Name())
		} else {
			err := param.SetValue(value)
			if err != nil {
				return nil, found, notFound, err
			}
			queryMap[param.Name()] = param
			found = append(found, param.Name())
		}
	}

	// Check if any required parameters are missing
	if len(notFound) > 0 {
		return nil, found, notFound, fmt.Errorf(
			"query parameters %v are required", notFound,
		)
	}

	// Process optional parameters
	for _, param := range optional {
		value := queryParams.Get(param.Name())
		if value != "" { // Parameter is present
			err := param.SetValue(value)
			if err != nil {
				return nil, found, notFound, err
			}
			queryMap[param.Name()] = param
			found = append(found, param.Name())
		} else { // Parameter is not present, set using default value
			err := param.SetDefault()
			if err != nil {
				return nil, found, notFound, err
			}
			queryMap[param.Name()] = param
			notFound = append(notFound, param.Name())
		}
	}

	return queryMap, found, notFound, nil
}
