import { Navigate } from "react-router"
import { useTranslation } from "react-i18next"

import { ROUTES } from "@/constants/routes"
import { useAdminStatsQuery } from "@/shared/queries/admin.query"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useProductsQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { money } from "@/util/format"

export function AdminPage() {
  const { t } = useTranslation("common")
  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceQuery()
  const isAdmin = workspace?.role === "admin"
  const { data: stats } = useAdminStatsQuery(Boolean(isAdmin))
  const { data: products = [] } = useProductsQuery()
  const { data: catalog } = useCatalogQuery()

  if (workspaceLoading) return null
  if (!isAdmin) return <Navigate to={ROUTES.start} replace />
  if (!stats || !catalog) return null

  return (
    <>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>{t("admin.title")}</h1>
      <p className="muted" style={{ marginBottom: 22 }}>
        {t("admin.subtitle")}
      </p>
      <div className="tiles" style={{ marginBottom: 22 }}>
        <div className="tile">
          <span>{t("admin.subscribers")}</span>
          <b>{stats.subscribers.toLocaleString()}</b>
        </div>
        <div className="tile">
          <span>{t("admin.products_built")}</span>
          <b>{stats.productsBuilt.toLocaleString()}</b>
        </div>
        <div className="tile">
          <span>{t("admin.listed")}</span>
          <b>{stats.listedRate}</b>
        </div>
        <div className="tile">
          <span>{t("admin.sale_by_day_30")}</span>
          <b>{stats.firstSaleRate}</b>
        </div>
      </div>
      <div className="tiles" style={{ marginBottom: 22 }}>
        <div className="tile">
          <span>{t("admin.from_sources")}</span>
          <b>{stats.fromSourcesRate}</b>
        </div>
        <div className="tile">
          <span>{t("admin.outreach_sent")}</span>
          <b>{stats.outreachSent.toLocaleString()}</b>
        </div>
        <div className="tile">
          <span>{t("admin.reply_rate")}</span>
          <b>{stats.replyRate}</b>
        </div>
        <div className="tile">
          <span>{t("admin.partner_live")}</span>
          <b>{stats.partnerLive.toLocaleString()}</b>
        </div>
      </div>
      <div className="card">
        <h3>{t("admin.this_account")}</h3>
        <table className="tbl" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>{t("admin.col_product")}</th>
              <th>{t("admin.col_type")}</th>
              <th>{t("admin.col_stage")}</th>
              <th>{t("admin.col_sales")}</th>
              <th>{t("admin.col_leads")}</th>
              <th>{t("admin.col_spend")}</th>
            </tr>
          </thead>
          <tbody>
            {products.length ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.brand?.title || product.input || "—"}</td>
                  <td>{catalog.types.find((type) => type.id === product.type)?.name || "—"}</td>
                  <td>{product.stage}</td>
                  <td>{product.metrics.sales}</td>
                  <td>{product.metrics.leads}</td>
                  <td>{money(product.spend)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="muted">
                  {t("admin.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
