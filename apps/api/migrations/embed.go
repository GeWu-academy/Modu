package migrations

import "embed"

// FS 内嵌版本化迁移 SQL，供启动时执行。
//
//go:embed *.sql
var FS embed.FS
