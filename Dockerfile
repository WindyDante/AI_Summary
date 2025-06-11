# 使用 Golang Alpine 镜像作为后端构建阶段
FROM golang:1.24.3-alpine AS backend-build

# 设置后端工作目录
WORKDIR /app

# 禁用 CGO（提高编译速度，减小镜像体积）
ENV CGO_ENABLED=0

# 复制Go模块文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY cmd ./cmd/
COPY internal ./internal/
COPY config ./config/
# 添加静态文件目录
COPY static ./static/

# 构建 Go 后端应用
RUN go build -o /app/summary ./cmd/server

# 使用更轻量的 Alpine 镜像作为运行时阶段
FROM alpine:latest AS final

# 设置时区为上海
ENV TZ=Asia/Shanghai

WORKDIR /app

# 安装系统根证书
RUN apk add --no-cache ca-certificates tzdata

# 复制构建阶段的文件
COPY --from=backend-build /app/config /app/config
COPY --from=backend-build /app/summary /app/summary
# 复制静态文件目录到运行时镜像
COPY --from=backend-build /app/static /app/static

# 复制 .env 文件（如果存在的话，作为备选）
COPY .env* ./

# 暴露端口
EXPOSE 1234

# 运行后端服务
CMD ["/app/summary"]