# Harness Gates

## Gate 1: Spec Ready
- OpenSpec proposal/spec/plan/tasks 已创建。
- API 缺口已明确，不把 mock 当生产接口。

## Gate 2: Code Quality
- `npm run typecheck`
- `npm run build`

## Gate 3: Runtime Smoke
- 后端 `/api/health` 返回 ok。
- 前端四个页面可切换。
- 能源页面请求文档中的能源接口路径。

## Gate 4: Visual Smoke
- 使用本地浏览器检查桌面宽度下页面非空、布局接近原型。
- 对能源页至少核对：顶部导航、筛选条、单箱三组结构、两张趋势图、两张表格。
