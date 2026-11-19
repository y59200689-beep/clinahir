import { useEffect, useState } from 'react';
import { useAdminLocale } from '../i18n';

export type RecordTarget = { kind: 'lead' | 'prospect'; id: string; name: string; detail?: string };

export function useRecordSelection(deletedIds?: ReadonlySet<string>) {
  const [records, setRecords] = useState<RecordTarget[]>([]);

  useEffect(() => {
    if (deletedIds) setRecords(current => current.filter(record => !deletedIds.has(record.id)));
  }, [deletedIds]);

  function toggle(record: RecordTarget) {
    setRecords(current => {
      if (current.some(item => item.id === record.id)) return current.filter(item => item.id !== record.id);
      return current.length < 100 ? [...current, record] : current;
    });
  }

  return { records, toggle, clear: () => setRecords([]) };
}

export function RecordCheckbox({ record, selection }: {
  record: RecordTarget;
  selection: ReturnType<typeof useRecordSelection>;
}) {
  const { t } = useAdminLocale();
  const checked = selection.records.some(item => item.id === record.id);
  return <input type="checkbox" checked={checked} disabled={!checked && selection.records.length >= 100}
    aria-label={t('Select {{name}} for deletion', { name: record.name })}
    onClick={event => event.stopPropagation()} onChange={() => selection.toggle(record)}
    className="accent-rose-700" />;
}

export function DeleteSelected({ selection, onDelete }: {
  selection: ReturnType<typeof useRecordSelection>;
  onDelete: (records: RecordTarget[]) => void;
}) {
  const { t } = useAdminLocale();
  if (!selection.records.length) return null;
  return <div className="flex flex-wrap items-center gap-3 text-sm">
    <button type="button" onClick={() => onDelete(selection.records)} className="rounded-lg px-3 py-2 font-medium text-rose-800 hover:bg-rose-50">
      {t('Delete selected ({{count}})', { count: selection.records.length })}
    </button>
    <button type="button" onClick={selection.clear} className="px-2 py-2 underline">{t('Clear deletion selection')}</button>
  </div>;
}
