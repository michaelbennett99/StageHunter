package lib_test

import (
	"testing"

	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func TestOptional(t *testing.T) {
	o := lib.NewOptional(1)
	if !o.HasValue() {
		t.Errorf("expected value")
	}

	if o.MustValue() != 1 {
		t.Errorf("expected value 1, got %d", o.MustValue())
	}

	v, err := o.Value()
	if err != nil {
		t.Errorf("expected value 1, got error %v", err)
	}
	if v != 1 {
		t.Errorf("expected value 1, got %d", v)
	}

	if o.OrElse(2) != 1 {
		t.Errorf("expected value 1, got %d", o.OrElse(2))
	}

	b, err := o.MarshalJSON()
	if err != nil {
		t.Errorf("expected value 1, got error %v", err)
	}
	if string(b) != "1" {
		t.Errorf("expected value 1, got %s", string(b))
	}

	o.Clear()

	if o.HasValue() {
		t.Errorf("expected no value")
	}

	// error if MustValue is called and doesn't panic
	func() {
		defer func() {
			if r := recover(); r == nil {
				t.Errorf("expected panic")
			}
		}()
		o.MustValue()
	}()

	_, err = o.Value()
	if err == nil {
		t.Errorf("expected error")
	}

	if o.OrElse(2) != 2 {
		t.Errorf("expected value 2, got %d", o.OrElse(2))
	}

	b, err = o.MarshalJSON()
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if string(b) != "null" {
		t.Errorf("expected null, got %s", string(b))
	}
}
