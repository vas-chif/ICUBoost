<script setup lang="ts">
/**
 * SavedCalculations Component
 *
 * Componente riutilizzabile per visualizzare calcoli salvati
 * Compatibile con tutti i calcolatori (MP, QR, futuri)
 *
 * @component
 * @example
 * <SavedCalculations
 *   calculator-type="mp"
 *   :calculations="savedCalculations"
 *   @remove="removeSavedCalculation"
 * />
 */

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SavedCalculation } from 'src/composables/useSavedCalculations';

interface Props {
  calculatorType: 'mp' | 'qr';
  calculations: SavedCalculation[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  remove: [index: number];
}>();

const { t } = useI18n();

/**
 * 🎓 CONCETTO: Unit dinamica basata su tipo calcolatore
 * - MP: J/min
 * - QR: ml-O₂/dL
 * - Futuri: aggiungere qui
 */
const resultUnit = computed((): string => {
  switch (props.calculatorType) {
    case 'mp':
      return 'J/min';
    case 'qr':
      return 'ml-O₂/dL';
    default:
      return '';
  }
});

/**
 * Colonne tabella (riutilizzabili per tutti i calcolatori)
 */
const columns = computed(() => [
  {
    name: 'initials',
    align: 'left' as const,
    label: (t('common.patientInitials').split('(')[0] || '').trim(),
    field: 'initials',
    sortable: true,
  },
  {
    name: 'result',
    align: 'center' as const,
    label: `${t('common.result')} (${resultUnit.value})`,
    field: 'result',
    sortable: true,
  },
  {
    name: 'time',
    align: 'center' as const,
    label: t('common.time'),
    field: 'time',
    sortable: true,
  },
  {
    name: 'date',
    align: 'center' as const,
    label: t('common.date'),
    field: 'date',
    sortable: true,
  },
  {
    name: 'actions',
    align: 'right' as const,
    label: t('common.actions'),
    field: 'actions',
  },
]);

/**
 * Handler rimozione calcolo
 */
function handleRemove(index: number): void {
  emit('remove', index);
}

/**
 * 🎓 CONCETTO: Export PDF
 * Genera PDF con jsPDF e autoTable
 */
async function exportPDF(): Promise<void> {
  try {
    // Import dinamici
    const jsPDFModule = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const { jsPDF } = jsPDFModule;
    const doc = new jsPDF();

    // Titolo
    const title =
      props.calculatorType === 'mp'
        ? 'Mechanical Power - Calcoli Salvati'
        : 'Respiratory Quotient - Calcoli Salvati';

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 14, 22);

    // Tabella
    const tableData = props.calculations.map((calc) => [
      calc.initials,
      calc.date,
      calc.time,
      `${calc.result} ${resultUnit.value}`,
    ]);

    // Usa autoTable (importato come modulo)
    autoTable(doc, {
      startY: 28,
      head: [
        [
          (t('common.patientInitials').split('(')[0] || '').trim(),
          t('common.date'),
          t('common.time'),
          `${t('common.result')} (${resultUnit.value})`,
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });

    // Download
    const filename = `${props.calculatorType}_calcoli_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Errore export PDF:', error);
  }
}

/**
 * 🎓 CONCETTO: Export Excel
 * Genera Excel con SheetJS (xlsx)
 */
async function exportExcel(): Promise<void> {
  try {
    const XLSX = await import('xlsx');

    // Prepara dati
    const worksheetData = [
      [
        (t('common.patientInitials').split('(')[0] || '').trim(),
        t('common.date'),
        t('common.time'),
        `${t('common.result')} (${resultUnit.value})`,
      ],
      ...props.calculations.map((calc) => [calc.initials, calc.date, calc.time, calc.result]),
    ];

    // Crea worksheet e workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    const sheetName = props.calculatorType === 'mp' ? 'Mechanical Power' : 'Respiratory Quotient';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Download
    const filename = `${props.calculatorType}_calcoli_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Errore export Excel:', error);
  }
}
</script>

<template>
  <div v-if="calculations.length > 0" class="saved-calculations q-mt-md">
    <q-card flat bordered>
      <q-card-section class="bg-grey-2">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="history" class="q-mr-sm" />
              {{ t('common.savedCalculations') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              icon="picture_as_pdf"
              color="negative"
              size="sm"
              @click="exportPDF"
            >
              <q-tooltip>Export PDF</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="table_chart"
              color="positive"
              size="sm"
              class="q-ml-xs"
              @click="exportExcel"
            >
              <q-tooltip>Export Excel</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="calculations"
          :columns="columns"
          row-key="id"
          flat
          dense
          :rows-per-page-options="[5, 10]"
          :pagination="{ rowsPerPage: 5 }"
          :grid="$q.screen.lt.sm"
          wrap-cells
        >
          <!-- Grid mode per mobile -->
          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center q-gutter-sm">
                    <div class="col">
                      <div class="text-weight-bold text-h6 text-primary">
                        {{ props.row.initials }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ props.row.date }} {{ props.row.time }}
                      </div>
                      <div class="text-body1 text-weight-bold q-mt-xs">
                        {{ props.row.result }} {{ resultUnit }}
                      </div>
                    </div>
                    <div>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click="handleRemove(props.rowIndex)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
          <!-- Result con formattazione -->
          <template #body-cell-result="slotProps">
            <q-td :props="slotProps">
              <span class="text-weight-bold text-primary">
                {{ slotProps.row.result }}
              </span>
            </q-td>
          </template>

          <!-- Azioni (pulsante elimina) -->
          <template #body-cell-actions="slotProps">
            <q-td :props="slotProps">
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="handleRemove(slotProps.rowIndex)"
              >
                <q-tooltip>{{ t('common.actions') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.saved-calculations {
  width: 100%;
  margin-bottom: 20px;

  :deep(.q-table) {
    thead tr {
      th {
        font-weight: 600;
        font-size: 0.75rem;
        padding: 8px 4px;
      }
    }

    tbody tr {
      td {
        font-size: 0.875rem;
        padding: 8px 4px;
      }
    }
  }

  // Grid mode ottimizzato per mobile
  :deep(.q-table__grid-content) {
    padding: 8px;
  }
}
</style>
