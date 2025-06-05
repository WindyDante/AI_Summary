package main

import (
	"ai-summary-app/config"
	"ai-summary-app/routers"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化基本配置
	err := config.Init()

	if err != nil {
		log.Fatalf("Failed to initialize configuration: %v", err)
	}

	// 配置路由
	r := gin.Default()
	routers.Router(r)

	// 启动服务
	err = r.Run("0.0.0.0:6886")
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
