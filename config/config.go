package config

import (
	"errors"
	"os"
)

var Secret string

func Init() error {
	// 通过系统变量设置对应token
	secret := os.Getenv("SECRET")
	if secret == "" {
		return errors.New("SECRET environment variable is not set")
	}

	return nil
}
