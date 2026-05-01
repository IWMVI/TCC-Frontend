import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/interfaces-graficas/componentes/form/Calendario/Calendario.module.css';

interface CalendarioProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	min?: string;
	max?: string;
	disabled?: boolean;
	required?: boolean;
	permitirPassado?: boolean;
	clearable?: boolean;
}

type DiaCalendario = {
	data: Date;
	foraDoMesAtual: boolean;
};

type PainelCalendario = 'dia' | 'mes' | 'ano';

const MESES = [
	'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
	'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const TAMANHO_PAGINA_ANOS = 12;

function normalizeDate(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoDate(dateString: string): Date | null {
	if (!dateString) return null;
	const [ano, mes, dia] = dateString.split('-').map(Number);
	if (!ano || !mes || !dia) return null;
	return new Date(ano, mes - 1, dia);
}

function toIsoDate(date: Date): string {
	const ano = date.getFullYear();
	const mes = String(date.getMonth() + 1).padStart(2, '0');
	const dia = String(date.getDate()).padStart(2, '0');
	return `${ano}-${mes}-${dia}`;
}

function isSameDate(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate();
}

function startOfMonth(year: number, month: number): Date { return new Date(year, month, 1); }
function endOfMonth(year: number, month: number): Date { return new Date(year, month + 1, 0); }
function startOfYear(year: number): Date { return new Date(year, 0, 1); }
function endOfYear(year: number): Date { return new Date(year, 11, 31); }

function buildMonthGrid(baseDate: Date): DiaCalendario[] {
	const ano = baseDate.getFullYear();
	const mes = baseDate.getMonth();
	const primeiroDiaMes = startOfMonth(ano, mes);
	const ultimoDiaMes = endOfMonth(ano, mes);
	const diaSemanaInicio = primeiroDiaMes.getDay();
	const totalDiasMes = ultimoDiaMes.getDate();
	const dias: DiaCalendario[] = [];

	for (let i = diaSemanaInicio - 1; i >= 0; i -= 1) {
		dias.push({ data: new Date(ano, mes, -i), foraDoMesAtual: true });
	}
	for (let dia = 1; dia <= totalDiasMes; dia += 1) {
		dias.push({ data: new Date(ano, mes, dia), foraDoMesAtual: false });
	}
	while (dias.length % 7 !== 0) {
		const proximo = new Date(dias[dias.length - 1].data);
		proximo.setDate(proximo.getDate() + 1);
		dias.push({ data: proximo, foraDoMesAtual: true });
	}
	return dias;
}

function isDateBlocked(date: Date, minDate: Date, maxDate: Date | null): boolean {
	const alvo = normalizeDate(date);
	if (alvo < minDate) return true;
	if (maxDate && alvo > maxDate) return true;
	return false;
}

function isMonthBlocked(year: number, month: number, minDate: Date, maxDate: Date | null): boolean {
	return endOfMonth(year, month) < minDate || (maxDate ? startOfMonth(year, month) > maxDate : false);
}

function isYearBlocked(year: number, minDate: Date, maxDate: Date | null): boolean {
	return endOfYear(year) < minDate || (maxDate ? startOfYear(year) > maxDate : false);
}

// ─── Posição calculada para o portal ─────────────────────────────────────────

interface PopoverPos {
	top: number;
	left: number;
	width: number;
}

function calcularPosicao(trigger: HTMLElement): PopoverPos & { paraCima: boolean } {
	const rect = trigger.getBoundingClientRect();
	return {
		top: rect.bottom + 4,
		left: Math.max(0, Math.min(rect.left, window.innerWidth - 300)),
		width: Math.max(rect.width, 280),
		paraCima: false,
	};
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Calendario({
	id, label, value, onChange,
	placeholder = 'Selecione uma data',
	min, max,
	disabled = false,
	required = false,
	permitirPassado = false,
	clearable = true,
}: Readonly<CalendarioProps>) {
	const hoje = useMemo(() => normalizeDate(new Date()), []);
	const selecionada = useMemo(() => parseIsoDate(value), [value]);
	const minDateProp = min ? parseIsoDate(min) : null;
	const maxDate = max ? parseIsoDate(max) : null;
	const minDate = permitirPassado
		? (minDateProp ? normalizeDate(minDateProp) : new Date(0))
		: (minDateProp && minDateProp > hoje ? normalizeDate(minDateProp) : hoje);

	const [aberto, setAberto] = useState(false);
	const [painel, setPainel] = useState<PainelCalendario>('dia');
	const [mesAtual, setMesAtual] = useState<Date>(() => selecionada ?? hoje);
	const [inicioPaginaAnos, setInicioPaginaAnos] = useState(() => (selecionada ?? hoje).getFullYear() - 5);
	const [pos, setPos] = useState<(PopoverPos & { paraCima: boolean }) | null>(null);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const dataBase = selecionada ?? hoje;
		setMesAtual(new Date(dataBase.getFullYear(), dataBase.getMonth(), 1));
		setInicioPaginaAnos(dataBase.getFullYear() - 5);
	}, [selecionada, hoje]);

	// Fecha ao clicar fora ou pressionar Escape
	useEffect(() => {
		if (!aberto) return undefined;

		function handleClick(e: MouseEvent) {
			if (
				popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
				triggerRef.current && !triggerRef.current.contains(e.target as Node)
			) {
				setAberto(false);
				setPainel('dia');
			}
		}
		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape') { setAberto(false); setPainel('dia'); }
		}

		document.addEventListener('mousedown', handleClick);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('mousedown', handleClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [aberto]);

	// Recalcula posição ao rolar ou redimensionar
	useEffect(() => {
		if (!aberto || !triggerRef.current) return undefined;
		function atualizar() {
			if (triggerRef.current) setPos(calcularPosicao(triggerRef.current));
		}
		window.addEventListener('scroll', atualizar, true);
		window.addEventListener('resize', atualizar);
		return () => {
			window.removeEventListener('scroll', atualizar, true);
			window.removeEventListener('resize', atualizar);
		};
	}, [aberto]);

	const diasDoMes = useMemo(() => buildMonthGrid(mesAtual), [mesAtual]);
	const anosDaPagina = useMemo(() =>
		Array.from({ length: TAMANHO_PAGINA_ANOS }, (_, i) => inicioPaginaAnos + i),
		[inicioPaginaAnos]);
	const labelMes = useMemo(() =>
		new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(mesAtual),
		[mesAtual]);
	const labelAno = mesAtual.getFullYear();
	const valorExibicao = useMemo(() =>
		selecionada ? new Intl.DateTimeFormat('pt-BR').format(selecionada) : '',
		[selecionada]);

	const podeIrMesAnterior = !isMonthBlocked(mesAtual.getFullYear(), mesAtual.getMonth() - 1, minDate, maxDate);
	const podeIrMesSeguinte = !isMonthBlocked(mesAtual.getFullYear(), mesAtual.getMonth() + 1, minDate, maxDate);
	const podeIrAnoAnterior = !isYearBlocked(mesAtual.getFullYear() - 1, minDate, maxDate);
	const podeIrAnoSeguinte = !isYearBlocked(mesAtual.getFullYear() + 1, minDate, maxDate);
	const podeIrPaginaAnosAnterior = anosDaPagina.some((a) => !isYearBlocked(a - TAMANHO_PAGINA_ANOS, minDate, maxDate));
	const podeIrPaginaAnosSeguinte = anosDaPagina.some((a) => !isYearBlocked(a + TAMANHO_PAGINA_ANOS, minDate, maxDate));

	function selecionarData(data: Date) {
		if (isDateBlocked(data, minDate, maxDate)) return;
		onChange(toIsoDate(data));
		setAberto(false);
		setPainel('dia');
	}

	function handleAnterior() {
		if (painel === 'dia') {
			if (!podeIrMesAnterior) return;
			setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
		} else if (painel === 'mes') {
			if (!podeIrAnoAnterior) return;
			setMesAtual(new Date(mesAtual.getFullYear() - 1, mesAtual.getMonth(), 1));
		} else {
			if (!podeIrPaginaAnosAnterior) return;
			setInicioPaginaAnos((v) => v - TAMANHO_PAGINA_ANOS);
		}
	}

	function handleSeguinte() {
		if (painel === 'dia') {
			if (!podeIrMesSeguinte) return;
			setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
		} else if (painel === 'mes') {
			if (!podeIrAnoSeguinte) return;
			setMesAtual(new Date(mesAtual.getFullYear() + 1, mesAtual.getMonth(), 1));
		} else {
			if (!podeIrPaginaAnosSeguinte) return;
			setInicioPaginaAnos((v) => v + TAMANHO_PAGINA_ANOS);
		}
	}

	function abrirCalendario() {
		if (disabled) return;
		if (!aberto && triggerRef.current) {
			setPos(calcularPosicao(triggerRef.current));
		}
		setAberto((v) => !v);
		setPainel('dia');
		setInicioPaginaAnos(mesAtual.getFullYear() - 5);
	}

	const popoverContent = aberto && pos ? createPortal(
		<div
			ref={popoverRef}
			className={styles.calendario__popover}
			style={{ top: pos.top, left: pos.left, width: pos.width }}
			role="dialog"
			aria-label={`Selecionar data para ${label}`}
		>
			<div className={styles.calendario__header}>
				<button type="button" className={styles.calendario__nav} onClick={handleAnterior}
					disabled={
						(painel === 'dia' && !podeIrMesAnterior) ||
						(painel === 'mes' && !podeIrAnoAnterior) ||
						(painel === 'ano' && !podeIrPaginaAnosAnterior)
					} aria-label="Anterior">
					<ChevronLeft size={16} />
				</button>
				<div className={styles.calendario__titleGroup}>
					<button type="button" className={styles.calendario__titleButton} onClick={() => setPainel('mes')}>
						{labelMes}
					</button>
					<button type="button" className={styles.calendario__titleButton} onClick={() => setPainel('ano')}>
						{labelAno}
					</button>
				</div>
				<button type="button" className={styles.calendario__nav} onClick={handleSeguinte}
					disabled={
						(painel === 'dia' && !podeIrMesSeguinte) ||
						(painel === 'mes' && !podeIrAnoSeguinte) ||
						(painel === 'ano' && !podeIrPaginaAnosSeguinte)
					} aria-label="Próximo">
					<ChevronRight size={16} />
				</button>
			</div>

			{painel === 'dia' && (
				<>
					<div className={styles.calendario__weekdays}>
						{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
							<span key={d} className={styles.calendario__weekday}>{d}</span>
						))}
					</div>
					<div className={styles.calendario__days}>
						{diasDoMes.map(({ data, foraDoMesAtual }) => {
							const selected = selecionada ? isSameDate(data, selecionada) : false;
							const isToday = isSameDate(data, hoje);
							const blocked = isDateBlocked(data, minDate, maxDate);
							return (
								<button key={toIsoDate(data)} type="button"
									className={[
										styles.calendario__day,
										foraDoMesAtual ? styles['calendario__day--outside'] : '',
										selected ? styles['calendario__day--selected'] : '',
										isToday ? styles['calendario__day--today'] : '', data.getDay() === 0 ? styles['calendario__day--sunday'] : '',].filter(Boolean).join(' ')}
									onClick={() => selecionarData(data)}
									disabled={blocked}>
									{data.getDate()}
								</button>
							);
						})}
					</div>
				</>
			)}

			{painel === 'mes' && (
				<div className={styles.calendario__grid}>
					{MESES.map((mesNome, mesIndice) => {
						const blocked = isMonthBlocked(mesAtual.getFullYear(), mesIndice, minDate, maxDate);
						const active = mesAtual.getMonth() === mesIndice;
						return (
							<button key={mesNome} type="button"
								className={[styles.calendario__cell, active ? styles['calendario__cell--active'] : ''].filter(Boolean).join(' ')}
								disabled={blocked}
								onClick={() => { setMesAtual(new Date(mesAtual.getFullYear(), mesIndice, 1)); setPainel('dia'); }}>
								{mesNome}
							</button>
						);
					})}
				</div>
			)}

			{painel === 'ano' && (
				<div className={styles.calendario__grid}>
					{anosDaPagina.map((ano) => {
						const blocked = isYearBlocked(ano, minDate, maxDate);
						const active = mesAtual.getFullYear() === ano;
						return (
							<button key={ano} type="button"
								className={[styles.calendario__cell, active ? styles['calendario__cell--active'] : ''].filter(Boolean).join(' ')}
								disabled={blocked}
								onClick={() => { setMesAtual(new Date(ano, mesAtual.getMonth(), 1)); setPainel('dia'); }}>
								{ano}
							</button>
						);
					})}
				</div>
			)}
		</div>,
		document.body,
	) : null;

	return (
		<div className={styles.calendario}>
			<label htmlFor={id} className={styles.calendario__label}>
				{label}
				{required ? <span className={styles.calendario__required}>*</span> : null}
			</label>

			<div className={styles.calendario__inputWrapper}>
				<button
					ref={triggerRef}
					id={id}
					type="button"
					className={styles.calendario__trigger}
					onClick={abrirCalendario}
					disabled={disabled}
					aria-haspopup="dialog"
					aria-expanded={aberto}
				>
					<span className={`${styles.calendario__value} ${!valorExibicao ? styles['calendario__value--placeholder'] : ''}`}>
						{valorExibicao || placeholder}
					</span>
					{clearable && valorExibicao && !disabled ? (
						<span
							role="button"
							aria-label="Limpar data"
							className={styles.calendario__clear}
							onClick={(e) => { e.stopPropagation(); onChange(''); }}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(''); } }}
							tabIndex={0}
						>
							✕
						</span>
					) : (
						<Calendar size={18} className={styles.calendario__icon} />
					)}
				</button>
			</div>

			{popoverContent}
		</div>
	);
}
