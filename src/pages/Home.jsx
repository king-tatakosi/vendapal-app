import { DashboardCard } from '../components/DashboardCard';
import { DebtCard } from '../components/DebtCard';
import { AlertCard } from '../components/AlertCard';
import { formatCurrency } from '../utils/format';
import alertIcon from '../assets/alert.svg';
import productsIcon from '../assets/products.svg';
import cartIcon from '../assets/cart.svg';

export function Home({ debts, products, supplierDebts, onNavigate }) {
  const recentUnpaid = debts.unpaid.slice(0, 3);
  const recentAlerts = [
    ...products.expired.map(p => ({ ...p, _type: 'expired' })),
    ...products.expiringSoon.map(p => ({ ...p, _type: 'expiring' })),
    ...products.lowStock.map(p => ({ ...p, _type: 'low-stock' })),
  ].slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ';
    if (h < 17) return 'Good Afternoon ';
    return 'Good Evening ';
  };

  return (
    <div className="page">
      <div className="page-header page-header--home">
        <div>
          <p className="greeting">{greeting()}</p>
          <h1 className="app-title">VendaPal</h1>
        </div>
        <div className="logo-badge">
          <img src={cartIcon} alt="" width="32" height="32" />
        </div>
      </div>

      <div className="section">
        <div className="dash-grid">
          <DashboardCard
            label="Total Amount Customers Owe Me"
            value={formatCurrency(debts.totalOwed)}
            color="green"
            onClick={() => onNavigate('debts')}
          />
          <DashboardCard
            label="Total Amount I Owe Suppliers"
            value={formatCurrency(supplierDebts.totalIOwe)}
            color="orange"
            onClick={() => onNavigate('debts')}
          />
          <DashboardCard
            icon={alertIcon}
            label="Expiring Soon"
            value={products.expiringSoon.length + products.expired.length}
            color={products.expired.length > 0 ? 'red' : 'yellow'}
            onClick={() => onNavigate('alerts')}
          />
          <DashboardCard
            icon={productsIcon}
            label="Low Stock"
            value={products.lowStock.length}
            color="blue"
            onClick={() => onNavigate('alerts')}
          />
        </div>
      </div>

      {recentUnpaid.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Debts</h2>
            <button className="see-all" onClick={() => onNavigate('debts')}>See all</button>
          </div>
          <div className="card-list">
            {recentUnpaid.map(d => (
              <DebtCard
                key={d.id}
                debt={d}
                onRecordPayment={debts.recordPayment}
                onMarkPaid={debts.markAsPaid}
                onDelete={debts.deleteDebt}
              />
            ))}
          </div>
        </div>
      )}

      {recentAlerts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Alerts</h2>
            <button className="see-all" onClick={() => onNavigate('alerts')}>See all</button>
          </div>
          <div className="card-list">
            {recentAlerts.map(p => (
              <AlertCard key={p.id} product={p} type={p._type} />
            ))}
          </div>
        </div>
      )}

      {recentUnpaid.length === 0 && recentAlerts.length === 0 && (
        <div className="home-empty">
          <h2>All clear!</h2>
          <p>No pending debts or alerts right now.</p>
          <div className="home-quick-actions">
            <button className="btn btn--primary" onClick={() => onNavigate('debts')}>
              + Add Debt Record
            </button>
            <button className="btn btn--outline" onClick={() => onNavigate('products')}>
              + Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
