import React, { useMemo, useState } from 'react';
import { Check, Copy, Database, Download, X } from 'lucide-react';
import { Coupon, CreditRecord, MerchantProfile, Supplier } from '../types/credit';
import { generateSqlBackup, SqlDialect } from '../utils/sqlBackupExporter';
import mysqlSchemaRaw from '../../sql/mysql_schema.sql?raw';
import postgresSchemaRaw from '../../sql/postgresql_schema.sql?raw';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  merchant: MerchantProfile;
  credits: CreditRecord[];
  coupons: Coupon[];
  suppliers: Supplier[];
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  uid,
  merchant,
  credits,
  coupons,
  suppliers,
}) => {
  const [dialect, setDialect] = useState<SqlDialect>('postgresql');
  const [viewMode, setViewMode] = useState<'backup' | 'schema'>('backup');
  const [copied, setCopied] = useState(false);

  const schemaSql = dialect === 'postgresql' ? postgresSchemaRaw : mysqlSchemaRaw;

  const fullBackupSql = useMemo(() => {
    const dataSql = generateSqlBackup(
      dialect,
      uid,
      merchant,
      credits,
      coupons,
      suppliers
    );
    return `${schemaSql}\n\n${dataSql}`;
  }, [dialect, uid, merchant, credits, coupons, suppliers, schemaSql]);

  if (!isOpen) return null;

  const displayedSql = viewMode === 'schema' ? schemaSql : fullBackupSql;

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullBackupSql], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `kreceagro_respaldo_${dialect}_${dateStamp}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Respaldo de base de datos MySQL y PostgreSQL"
        className="w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Respaldo SQL (PostgreSQL / MySQL)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exporta el esquema relacional y tus registros respaldados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar respaldo SQL"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Dialect and Content Switches */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#151B1C] border border-slate-200 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setDialect('postgresql')}
                className={`min-h-[38px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dialect === 'postgresql'
                    ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413]'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                PostgreSQL 16+
              </button>
              <button
                type="button"
                onClick={() => setDialect('mysql')}
                className={`min-h-[38px] px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dialect === 'mysql'
                    ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413]'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                MySQL 8.0+
              </button>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#151B1C] border border-slate-200 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewMode('backup')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'backup'
                    ? 'bg-white dark:bg-[#20292B] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Respaldo completo
              </button>
              <button
                type="button"
                onClick={() => setViewMode('schema')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'schema'
                    ? 'bg-white dark:bg-[#20292B] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Solo esquema DDL
              </button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-[#141A1B] border border-slate-200 dark:border-white/[0.07]">
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Tablas
              </span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                6
              </span>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-[#141A1B] border border-slate-200 dark:border-white/[0.07]">
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Créditos
              </span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {credits.length}
              </span>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-[#141A1B] border border-slate-200 dark:border-white/[0.07]">
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Cupones
              </span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {coupons.length}
              </span>
            </div>
          </div>

          {/* SQL Code Preview */}
          <pre className="rounded-2xl p-4 bg-slate-950 text-teal-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64 border border-white/10">
            <code>{displayedSql}</code>
          </pre>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[46px] rounded-2xl border border-slate-200 dark:border-white/[0.12] text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL copiado' : 'Copiar SQL'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 min-h-[46px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE0D0] text-white dark:text-[#041413] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .sql ({dialect === 'postgresql' ? 'PostgreSQL' : 'MySQL'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
