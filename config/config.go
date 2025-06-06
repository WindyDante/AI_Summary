package config

import (
	"errors"
	"log"
	"os"

	"github.com/joho/godotenv"
)

var SecretId, SecretKey string

func Init() error {
	// 加载环境变量
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// 通过系统变量设置对应token
	SecretId, SecretKey = os.Getenv("SecretId"), os.Getenv("SecretKey")
	if SecretId == "" || SecretKey == "" {
		return errors.New("SECRET environment variable is not set")
	}

	return nil
}
