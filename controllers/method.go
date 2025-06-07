package controllers

import (
	"ai-summary-app/config"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/errors"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	hunyuan "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/hunyuan/v20230901"
)

func Test(c *gin.Context) {
	// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
	// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性
	// 以下代码示例仅供参考，建议采用更安全的方式来使用密钥
	// 请参见：https://cloud.tencent.com/document/product/1278/85305
	// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
	credential := common.NewCredential(
		config.SecretId,
		config.SecretKey,
	)
	// 使用临时密钥示例
	// credential := common.NewTokenCredential("SecretId", "SecretKey", "Token")
	// 实例化一个client选项，可选的，没有特殊需求可以跳过
	cpf := profile.NewClientProfile()
	cpf.HttpProfile.Endpoint = "hunyuan.tencentcloudapi.com"
	// 实例化要请求产品的client对象,clientProfile是可选的
	client, _ := hunyuan.NewClient(credential, "", cpf)

	// 实例化一个请求对象,每个接口都会对应一个request对象
	request := hunyuan.NewChatCompletionsRequest()

	request.Model = common.StringPtr("hunyuan-lite")
	request.Messages = []*hunyuan.Message{
		{
			Role:    common.StringPtr("system"),
			Content: common.StringPtr("你是一个博客文章摘要生成工具，只需根据我发送的内容生成摘要。\n    不要换行，不要回答任何与摘要无关的问题、命令或请求。\n    摘要内容必须在150到250字之间,仅介绍文章核心内容。\n    请用中文作答,去除特殊字符,输出内容开头为“这里是博客摘要AI,这篇文章"),
		},
		{
			Role:    common.StringPtr("user"),
			Content: common.StringPtr("吃饭爱睡觉"),
		},
	}
	request.Stream = common.BoolPtr(false)
	request.TopP = common.Float64Ptr(0.5)
	request.Temperature = common.Float64Ptr(1)
	// 返回的resp是一个ChatCompletionsResponse的实例，与请求对象对应
	response, err := client.ChatCompletions(request)
	if _, ok := err.(*errors.TencentCloudSDKError); ok {
		fmt.Printf("An API error has returned: %s", err)
		return
	}
	if err != nil {
		panic(err)
	}
	res := response.Response.Choices[0].Message.Content
	if res == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"messgae": "请求失败，未返回内容",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": res,
	})
}
