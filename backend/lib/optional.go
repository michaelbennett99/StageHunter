package lib

import (
	"encoding/json"
	"errors"
)

type Optional[T any] struct {
	value *T
}

func NewOptional[T any](value T) Optional[T] {
	return Optional[T]{value: &value}
}

func NewEmptyOptional[T any]() Optional[T] {
	return Optional[T]{value: nil}
}

func (o *Optional[T]) HasValue() bool {
	return o.value != nil
}

func (o *Optional[T]) Value() (T, error) {
	if !o.HasValue() {
		var zero T
		return zero, errors.New("no value present")
	}
	return *o.value, nil
}

func (o *Optional[T]) MustValue() T {
	if !o.HasValue() {
		panic("no value present")
	}
	return *o.value
}

func (o *Optional[T]) OrElse(other T) T {
	if o.HasValue() {
		return o.MustValue()
	}
	return other
}

func (o *Optional[T]) Clear() {
	o.value = nil
}

func (o *Optional[T]) Set(value T) {
	o.value = &value
}

func (o *Optional[T]) MarshalJSON() ([]byte, error) {
	if o.HasValue() {
		return json.Marshal(o.MustValue())
	}
	return json.Marshal(nil)
}
