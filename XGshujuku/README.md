# XGshujuku

销冠 AI 的本地客户会话与记忆数据库 MVP。项目只使用 Python 标准库和 SQLite，适合单机原型、内部演示和业务规则验证。

## 已实现

- 匿名会话默认保留 7 天，支持过期清理
- 当前会话事实：主意图、预算、设备、偏好、候选 SKU、排除商品和未决问题
- 用户与助手逐条问答记录、来源、意图、会话摘要和历史查询
- 登录客户明确授权后才能写入长期记忆
- 一次性表达不能直接升级为长期偏好，写入时必须传入“已确认稳定”标记
- 结构化会话摘要、推荐结果、报价版本、反馈和知识来源版本
- 按“当前轮 > 已确认会话事实 > 已授权长期偏好 > 系统默认”合并上下文
- 撤回授权或申请删除后立即停止业务查询，物理数据在 24 小时 SLA 内清除
- 银行卡、身份证、密码等敏感信息写入拦截
- 脱敏审计日志：客户和目标标识使用 SHA-256 散列

## 快速开始

要求 Python 3.10 或更高版本，无需安装第三方依赖。

```powershell
.\run.cmd init
.\run.cmd demo
.\run.cmd cleanup
.\run.cmd test
.\run.cmd serve
```

`demo` 会创建一个示例客户、授权、会话事实和长期偏好，并输出合并后的销售上下文。
`serve` 会在 `http://127.0.0.1:8765` 启动网页使用的本地记忆接口；运行网页开发服务时需保持该窗口开启。

## 在业务代码中使用

```python
from xg_database import CustomerDataService

service = CustomerDataService("data/xg.db")
service.initialize()

customer_id = service.create_customer("web-user-001")
session_id = service.create_session(channel="web", customer_id=customer_id)

service.put_session_fact(session_id, "budget", {"max": 500}, "confirmed")
service.grant_consent(customer_id, scope="long_term_memory", consent_version="v1")
service.put_long_term_memory(
    customer_id,
    "common_device",
    {"os": "Windows"},
    confirmed_stable=True,
)

context = service.resolve_context(
    session_id,
    current_turn={"budget": {"max": 400}},
    defaults={"preferred_connection": "wireless"},
)
```

## 定时清理

生产环境至少每小时运行一次：

```powershell
.\run.cmd cleanup D:\data\xg.db
```

清理任务会：

1. 删除已过期匿名会话及其关联事实和摘要。
2. 物理删除已到清理时间的长期记忆。
3. 更新删除请求状态并写入脱敏审计记录。

提交删除申请时，业务查询立即不可见；物理清理时间设为申请后 23 小时，为每小时任务预留执行窗口，满足 24 小时生效要求。

## 生产迁移建议

真实客户、多实例或多渠道环境应把主库迁移至 PostgreSQL，并用 Redis 保存活跃会话和短期缓存。业务服务接口可以保持不变，只替换存储实现。SQLite 文件应放在访问受控的目录中，不要提交到 Git。

向量数据库只用于商品资料检索，不作为客户记忆主库。生产环境还应增加磁盘/备份加密、密钥管理、访问控制、备份删除策略和监控告警。
