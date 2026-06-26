-- Actualizar campos enriquecidos para los 46 escenarios seleccionados
UPDATE scenario_selection SET
  forms = 'Fiscal calendars (GeneralLedgerParameters)',
  biz_question = '¿Cómo está organizado su año fiscal? ¿Cierran por mes, trimestre, semana?',
  key_points = 'Período fiscal, fechas de cierre',
  tip = 'Preguntá si tienen períodos especiales (ej: semana 53). Impacta en el cierre anual.'
WHERE scenario_id = '90.10.020.100';

UPDATE scenario_selection SET
  forms = 'Journal names (LedgerJournalName)',
  biz_question = '¿Cuántos tipos de asiento manejan? ¿Diarios separados por área o uno general?',
  key_points = 'Tipos de diario, workflow de aprobación',
  tip = 'Identificar si quieren workflow por tipo de diario. Muy común que el cliente no lo haya pensado.'
WHERE scenario_id = '90.10.035.200';

UPDATE scenario_selection SET
  forms = 'General ledger parameters (LedgerParameters)',
  biz_question = '¿Cómo controlan asientos en períodos cerrados? ¿Quién puede reabrir un período?',
  key_points = 'Control de períodos, reglas de cierre',
  tip = 'Uno de los primeros formularios a configurar. Bloquea muchos otros si no se hace antes.'
WHERE scenario_id = '90.10.035.400';

UPDATE scenario_selection SET
  forms = 'Journal voucher (LedgerJournalTransDaily) | Journal lines (LedgerJournalTrans)',
  biz_question = '¿Quién registra asientos manuales? ¿Hay proceso de aprobación?',
  key_points = 'Diario general, workflow de aprobación',
  tip = 'Preguntar si usan dimensiones financieras. Si sí, es scope adicional importante.'
WHERE scenario_id = '90.50.010.100';

UPDATE scenario_selection SET
  forms = 'Period close workspace | Closing sheet (LedgerClosingSheet)',
  biz_question = '¿Cuánto tiempo les lleva cerrar el mes? ¿Quién lo hace?',
  key_points = 'Cierre de período, lista de tareas',
  tip = 'Mostrar el Period close workspace primero — es la pantalla que más impresiona en demos.'
WHERE scenario_id = '90.50.030.100';

UPDATE scenario_selection SET
  forms = 'Year-end close (LedgerYearEndClose)',
  biz_question = '¿Cómo pasan los saldos al nuevo año? ¿Es manual o automático?',
  key_points = 'Cierre anual, apertura de ejercicio',
  tip = 'Preguntar si tienen más de una entidad legal — el proceso se puede correr para todas juntas.'
WHERE scenario_id = '90.50.030.200';

UPDATE scenario_selection SET
  forms = 'Consolidate online (LedgerConsolidate) | Consolidation accounts',
  biz_question = '¿Tienen más de una empresa o entidad legal? ¿Cómo consolidan hoy?',
  key_points = 'Multi-entidad, eliminaciones intercompany',
  tip = 'Si tienen más de 2 entidades, este proceso puede ser complejo. Relevarlo con el CFO.'
WHERE scenario_id = '90.50.040.100';

UPDATE scenario_selection SET
  forms = 'Trial balance (LedgerTrialBalance)',
  biz_question = '¿Cómo consultan el estado de cuentas hoy? ¿Tienen reporte en tiempo real?',
  key_points = 'Trial balance, consultas de saldo',
  tip = 'Buena pantalla para mostrar al final de la sesión. El cliente ve el impacto inmediato.'
WHERE scenario_id = '90.70.120.500';

UPDATE scenario_selection SET
  forms = 'AP parameters (VendParameters) | Invoice policies',
  biz_question = '¿Tienen reglas para cargar facturas? ¿Quién puede aprobar antes del pago?',
  key_points = 'Parámetros de AP, flujo de aprobación',
  tip = 'Este escenario se trabaja junto con 75.10.015.200 y .300 en una misma sesión. No separarlos.'
WHERE scenario_id = '75.10.015.100';

UPDATE scenario_selection SET
  forms = 'Vendor invoice (VendEditInvoice) | Pending vendor invoices | Invoice journal',
  biz_question = '¿Cómo ingresan las facturas hoy? ¿Manual, escaneado, EDI?',
  key_points = 'Factura pendiente, registro, matching',
  tip = 'Preguntá el volumen mensual de facturas. Si es alto (>200/mes) el cliente va a preguntar por automatización.'
WHERE scenario_id = '75.50.020.100';

UPDATE scenario_selection SET
  forms = 'Invoice matching details (VendInvoiceMatchingLine) | Matching policy',
  biz_question = '¿Verifican que la factura coincida con la OC y el recibo? ¿Quién lo hace?',
  key_points = '2-way / 3-way matching, tolerancias',
  tip = 'Siempre preguntar si tienen proveedores sin OC (servicios). Esos necesitan override del matching.'
WHERE scenario_id = '75.50.020.300';

UPDATE scenario_selection SET
  forms = 'Vendor invoice automation | Invoice capture (AI Builder)',
  biz_question = '¿Procesan muchas facturas similares que podrían automatizarse?',
  key_points = 'Automatización con IA, captura de documentos',
  tip = 'Gap frecuente. No prometer en el workshop — primero evaluar volumen y complejidad.'
WHERE scenario_id = '75.50.020.600';

UPDATE scenario_selection SET
  forms = 'Vendor payment journal (LedgerJournalTransVendPaym) | Payment proposal',
  biz_question = '¿Cómo arman el listado de pagos? ¿Por vencimiento, banco, proveedor?',
  key_points = 'Propuesta de pago, journal de pago',
  tip = 'Preguntar con qué frecuencia pagan (semanal, quincenal). Define cómo configurar las propuestas.'
WHERE scenario_id = '75.50.090.200';

UPDATE scenario_selection SET
  forms = 'Electronic payment format | Bank account (BankAccountTable) | Payment file',
  biz_question = '¿Hacen transferencias bancarias? ¿Qué formato usa su banco?',
  key_points = 'Formato electrónico, archivo de pago',
  tip = 'El formato del banco local es casi siempre un gap. Documentar banco y formato específico.'
WHERE scenario_id = '75.50.090.220';

UPDATE scenario_selection SET
  forms = 'Vendor settlement (VendOpenTransClient) | Settle open transactions',
  biz_question = '¿Cancelan facturas contra notas de crédito o pagos parciales?',
  key_points = 'Conciliación de facturas, pagos parciales',
  tip = 'Si el cliente tiene muchas notas de crédito pendientes, la migración de saldos abiertos es crítica.'
WHERE scenario_id = '75.50.090.600';

UPDATE scenario_selection SET
  forms = 'Vendor aging report | AP summary report',
  biz_question = '¿Tienen reporte de facturas vencidas? ¿Miden KPIs del área?',
  key_points = 'Aging de proveedores, KPIs de AP',
  tip = 'Mostrar el aging al CFO — suele generar conversación sobre datos actuales que no tienen visibilidad.'
WHERE scenario_id = '75.80.050.100';

UPDATE scenario_selection SET
  forms = 'Credit management (CustCreditLimit) | Credit groups | Blocking rules',
  biz_question = '¿Dan crédito a clientes? ¿Quién aprueba y cómo controlan el límite?',
  key_points = 'Límite de crédito, bloqueo automático',
  tip = 'Si el cliente tiene muchos clientes con crédito, el Credit management workspace es la pantalla clave.'
WHERE scenario_id = '65.05.100.100';

UPDATE scenario_selection SET
  forms = 'Free text invoice (CustFreeInvoice) | Invoice lines | Posting profile',
  biz_question = '¿Tienen facturación que no viene de una venta? ¿Facturas de servicios manuales?',
  key_points = 'Factura libre, servicios no vinculados a OV',
  tip = 'Preguntar si necesitan aprobación antes de enviar la factura al cliente. Hay workflow disponible.'
WHERE scenario_id = '65.30.010.100';

UPDATE scenario_selection SET
  forms = 'Recurring free text invoices | Billing schedule',
  biz_question = '¿Tienen contratos o servicios que facturan mensualmente por el mismo importe?',
  key_points = 'Facturación periódica, contratos',
  tip = 'Muy valorado por empresas de servicios. Si el cliente factura mucho manualmente, este es un win claro.'
WHERE scenario_id = '65.30.010.300';

UPDATE scenario_selection SET
  forms = 'Credit note (CustFreeInvoice with credit) | Return order credit',
  biz_question = '¿Cuándo emiten una nota de crédito? ¿Hay flujo de aprobación?',
  key_points = 'Nota de crédito, devoluciones',
  tip = 'Preguntar si las NC se aplican automáticamente contra la factura original o quedan como saldo.'
WHERE scenario_id = '65.30.030.100';

UPDATE scenario_selection SET
  forms = 'Collection letter sequence (CustCollectionLetterLine)',
  biz_question = '¿Qué hacen cuando un cliente no paga? ¿Tienen seguimiento escalonado?',
  key_points = 'Secuencia de cobranza, morosidad',
  tip = 'Relevarlo con el área de cobranzas, no con el contador. Son procesos distintos.'
WHERE scenario_id = '65.05.100.300';

UPDATE scenario_selection SET
  forms = 'Interest notes (CustInterestNote) | Interest calculation',
  biz_question = '¿Cobran interés por pago tardío? ¿Cómo se calcula?',
  key_points = 'Nota de interés, mora, cálculo automático',
  tip = 'Gap frecuente por regulaciones locales. Validar si la tasa de interés es variable o fija.'
WHERE scenario_id = '65.05.100.400';

UPDATE scenario_selection SET
  forms = 'Revenue analysis workspace | Financial reports',
  biz_question = '¿Tienen un reporte que consolide toda la facturación del período?',
  key_points = 'Reporte de ingresos, análisis AR',
  tip = 'Buena pantalla para cerrar la sesión de AR. Genera impacto visual rápido.'
WHERE scenario_id = '65.60.500.100';

UPDATE scenario_selection SET
  forms = 'Subledger journal | Reconciliation report',
  biz_question = '¿Verifican que el saldo de cuentas a cobrar coincida con el libro mayor?',
  key_points = 'Conciliación de sub-libro, auditoría',
  tip = 'Preguntar con qué frecuencia lo hacen hoy. Si es manual, este proceso les ahorra mucho tiempo.'
WHERE scenario_id = '75.80.050.200';

UPDATE scenario_selection SET
  forms = 'Bank accounts (BankAccountTable) | Bank groups | IBAN setup',
  biz_question = '¿Cuántas cuentas bancarias manejan? ¿En qué monedas?',
  key_points = 'Cuenta bancaria, moneda, entidad legal',
  tip = 'Preguntar si tienen cuentas en moneda extranjera. Implica configuración de tipo de cambio.'
WHERE scenario_id = '90.25.100.100';

UPDATE scenario_selection SET
  forms = 'Bank statement (BankReconciliation) | Bank statement import',
  biz_question = '¿Cuánto tiempo les lleva la conciliación bancaria hoy? ¿La hacen en Excel?',
  key_points = 'Extracto bancario, conciliación, diferencias',
  tip = 'Si dicen más de 1 día, este escenario es un win claro. Mostrar la importación del extracto bancario.'
WHERE scenario_id = '90.25.200.100';

UPDATE scenario_selection SET
  forms = 'Advanced bank reconciliation (BankReconciliationMatchRule) | Matching rules',
  biz_question = '¿Tienen muchas transacciones diarias? ¿Les interesa automatizar el matching?',
  key_points = 'Reglas de matching, conciliación automática',
  tip = 'Requiere que el banco soporte importación en formato BAI2, MT940 o CAMT.053.'
WHERE scenario_id = '90.25.200.200';

UPDATE scenario_selection SET
  forms = 'Cash flow forecast (LedgerCovCashFlowForecast) | Liquidity accounts',
  biz_question = '¿Proyectan el flujo de caja? ¿Con cuántos días de anticipación tienen visibilidad?',
  key_points = 'Cash flow forecast, posición de liquidez',
  tip = 'Gap frecuente. La configuración inicial es compleja — documentar qué fuentes de datos quieren incluir.'
WHERE scenario_id = '90.25.300.100';

UPDATE scenario_selection SET
  forms = 'Cash flow statement report | Financial reporting',
  biz_question = '¿Tienen un estado de flujo de efectivo? ¿Lo arman manualmente?',
  key_points = 'Estado de cash flow, análisis de liquidez',
  tip = 'Si el cliente arma el estado de flujo en Excel, mostrar este reporte genera mucho impacto.'
WHERE scenario_id = '65.60.300.100';

UPDATE scenario_selection SET
  forms = 'Matching rules (BankReconciliationMatchRule) | Matching rule sets',
  biz_question = '¿Tienen reglas estándar? ¿Si el monto y referencia coinciden, concilian automáticamente?',
  key_points = 'Reglas de matching, automatización',
  tip = 'Pedir al cliente que traiga un extracto bancario real al workshop. Ayuda a definir las reglas concretas.'
WHERE scenario_id = '90.10.060.400';

UPDATE scenario_selection SET
  forms = 'Budget plan (BudgetPlan) | Budget planning process | Budget register entry',
  biz_question = '¿Tienen presupuesto anual? ¿Quién lo hace, cómo lo aprueban?',
  key_points = 'Plan presupuestario, proceso de aprobación',
  tip = 'Preguntar quiénes participan en el armado del presupuesto. Si son muchas áreas, evaluar BPP.'
WHERE scenario_id = '50.20.100.100';

UPDATE scenario_selection SET
  forms = 'Business Performance Planning (BPP) | Planning worksheets',
  biz_question = '¿Necesitan colaboración entre áreas para armar el presupuesto?',
  key_points = 'BPP, colaboración, escenarios',
  tip = 'BPP tiene licencia adicional. No prometérsela al cliente sin confirmar con el equipo comercial.'
WHERE scenario_id = '50.20.100.200';

UPDATE scenario_selection SET
  forms = 'Budget register entry (BudgetTransactionLine) | Budget codes | Budget control configuration',
  biz_question = '¿Cómo controlan que no se gaste más de lo presupuestado? ¿Bloquean o solo alertan?',
  key_points = 'Budget register, control presupuestario',
  tip = 'La diferencia entre advertencia y bloqueo duro es una decisión política del cliente, no técnica. Escalarla al CFO.'
WHERE scenario_id = '90.50.015.100';

UPDATE scenario_selection SET
  forms = 'Fixed asset groups (AssetGroup) | Fixed asset (AssetTable) | FA posting profiles',
  biz_question = '¿Cómo categorizan sus activos hoy? ¿Tienen grupos por tipo?',
  key_points = 'Grupo de activo, perfil de contabilización',
  tip = 'Pedir la lista de grupos de activos antes del workshop. Configurarlos en sesión pierde mucho tiempo.'
WHERE scenario_id = '10.05.010.100';

UPDATE scenario_selection SET
  forms = 'Fixed assets journal (AssetJournalTrans) | Acquisition transaction | FA book (AssetBook)',
  biz_question = '¿Cómo dan de alta un activo nuevo? ¿Lo vinculan con la OC o lo cargan manual?',
  key_points = 'Diario FA, adquisición, libro de FA',
  tip = 'Preguntar si la alta viene siempre de una compra o también por producción propia o donaciones.'
WHERE scenario_id = '10.20.800.200';

UPDATE scenario_selection SET
  forms = 'Depreciation proposal (AssetDepreciationProposal) | Depreciation profiles | FA journal',
  biz_question = '¿Calculan la depreciación manualmente o tienen proceso automático?',
  key_points = 'Propuesta de depreciación, cálculo automático',
  tip = 'Relevante: ¿usan el mismo método para impuestos y contabilidad, o tienen libros separados?'
WHERE scenario_id = '10.40.100.300';

UPDATE scenario_selection SET
  forms = 'Reclassification (AssetReclassifyWizard) | Fixed asset book',
  biz_question = '¿Alguna vez necesitaron mover un activo de un grupo a otro?',
  key_points = 'Reclasificación, cambio de grupo',
  tip = 'Proceso poco conocido. Mostrarlo si el cliente tiene muchos activos heredados de sistemas anteriores.'
WHERE scenario_id = '10.40.090.100';

UPDATE scenario_selection SET
  forms = 'Disposal (AssetDisposal) | Free text invoice for disposal | Gain/loss on disposal',
  biz_question = '¿Cuando venden o dan de baja un activo, cómo lo registran contablemente?',
  key_points = 'Baja por venta, ganancia/pérdida',
  tip = 'Preguntar si hay activos totalmente depreciados sin dar de baja. Es muy común y genera ruido en los reportes.'
WHERE scenario_id = '10.60.000.100';

UPDATE scenario_selection SET
  forms = 'Tax authorities (TaxAuthority) | Settlement periods | Tax codes',
  biz_question = '¿A qué organismos fiscales reportan? ¿AFIP, DGI, otros?',
  key_points = 'Autoridad fiscal, cuenta bancaria del organismo',
  tip = 'Validar si tienen más de una entidad legal con distintas jurisdicciones fiscales.'
WHERE scenario_id = '90.10.200.100';

UPDATE scenario_selection SET
  forms = 'Sales tax codes (TaxData) | Sales tax groups | Item sales tax groups',
  biz_question = '¿Qué tipos de IVA manejan? ¿21%, 10.5%, 0%, exento?',
  key_points = 'Código de impuesto, grupo de impuesto, tasa',
  tip = 'Mapear todos los códigos antes del workshop. En América Latina suelen ser más complejos que en Europa.'
WHERE scenario_id = '90.10.200.200';

UPDATE scenario_selection SET
  forms = 'Withholding tax (TaxWithholdData) | Withholding tax codes | Vendor withholding group',
  biz_question = '¿Tienen retenciones de ganancias o IVA sobre proveedores?',
  key_points = 'Retención, agente de retención',
  tip = 'Gap casi garantizado en Argentina. El estándar de D365 no cubre el esquema AFIP sin localización.'
WHERE scenario_id = '90.10.200.700';

UPDATE scenario_selection SET
  forms = 'Sales tax payment (TaxReport) | Tax settlement period | Tax settlement',
  biz_question = '¿Cómo calculan el IVA a pagar cada período? ¿Quién lo presenta?',
  key_points = 'Liquidación de IVA, período, DJ',
  tip = 'Preguntar si el proceso lo hace el contador interno o un estudio contable externo.'
WHERE scenario_id = '90.50.090.100';

UPDATE scenario_selection SET
  forms = 'Audit policy (SysPolicyRuleSQLExpressionDefinition) | Audit workbench',
  biz_question = '¿Tienen controles internos sobre transacciones? ¿Alguien revisa registros raros?',
  key_points = 'Política de auditoría, reglas SQL, alertas',
  tip = 'Relevante especialmente si el cliente tiene auditores externos o está bajo SOX / ISO.'
WHERE scenario_id = '90.70.005.100';

UPDATE scenario_selection SET
  forms = 'Accounting source explorer (AccountingSourceExplorer) | Voucher transactions',
  biz_question = '¿Pueden rastrear de dónde vino un asiento? ¿Saben qué generó un saldo raro?',
  key_points = 'Drill-through contable, trazabilidad',
  tip = 'Excelente pantalla para mostrar en el cierre del workshop. El drill-through impresiona a los contadores.'
WHERE scenario_id = '90.70.120.100';

UPDATE scenario_selection SET
  forms = 'Audit trail (SysAuditLogTable) | Database logging',
  biz_question = '¿Tienen log de quién modificó qué en el sistema financiero?',
  key_points = 'Log de cambios, trazabilidad de usuario',
  tip = 'Mostrarlo cuando el cliente pregunta por seguridad o control de accesos.'
WHERE scenario_id = '90.70.120.200';

UPDATE scenario_selection SET
  forms = 'Database log (DatabaseLog) | Change log setup',
  biz_question = '¿Necesitan saber si alguien modificó una cuenta contable o un parámetro clave?',
  key_points = 'Database logging, campos críticos',
  tip = 'Definir qué campos son críticos antes de activar. Loggear todo genera mucho volumen de datos.'
WHERE scenario_id = '90.70.005.200';
