import {useEffect, useMemo, useRef, useState} from 'react';
import {Calendar, ChevronLeft, ChevronRight} from 'lucide-react';
import styles from './Calendario.module.css';

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
}

type DiaCalendario = {
	data: Date;
	foraDoMesAtual: boolean;
};

type PainelCalendario = 'dia' | 'mes' | 'ano';

const MESES = [
	'Janeiro',
	'Fevereiro',
	'Março',
	'Abril',
	'Maio',
	'Junho',
	'Julho',
	'Agosto',
	'Setembro',
	'Outubro',
	'Novembro',
	'Dezembro',
];

const TAMANHO_PAGINA_ANOS = 12;

function normalizeDate(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoDate(dateString: string): Date | null {
	if (!dateString) {
		return null;
	}
	
	const [ano, mes, dia] = dateString.split('-').map(Number);
	if (!ano || !mes || !dia) {
		return null;
	}
	
	return new Date(ano, mes - 1, dia);
}

function toIsoDate(date: Date): string {
	const ano = date.getFullYear();
	const mes = String(date.getMonth() + 1).padStart(2, '0');
	const dia = String(date.getDate()).padStart(2, '0');
	return `${ano}-${mes}-${dia}`;
}

function isSameDate(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function startOfMonth(year: number, month: number): Date {
	return new Date(year, month, 1);
}

function endOfMonth(year: number, month: number): Date {
	return new Date(year, month + 1, 0);
}

function startOfYear(year: number): Date {
	return new Date(year, 0, 1);
}

function endOfYear(year: number): Date {
	return new Date(year, 11, 31);
}

function buildMonthGrid(baseDate: Date): DiaCalendario[] {
	const ano = baseDate.getFullYear();
	const mes = baseDate.getMonth();
	const primeiroDiaMes = startOfMonth(ano, mes);
	const ultimoDiaMes = endOfMonth(ano, mes);
	const diaSemanaInicio = primeiroDiaMes.getDay();
	const totalDiasMes = ultimoDiaMes.getDate();
	
	const dias: DiaCalendario[] = [];
	
	for (let i = diaSemanaInicio - 1; i >= 0; i -= 1) {
		const data = new Date(ano, mes, -i);
		dias.push({data, foraDoMesAtual: true});
	}
	
	for (let dia = 1; dia <= totalDiasMes; dia += 1) {
		dias.push({data: new Date(ano, mes, dia), foraDoMesAtual: false});
	}
	
	while (dias.length % 7 !== 0) {
		const ultimo = dias[dias.length - 1];
		const proximo = new Date(ultimo.data);
		proximo.setDate(proximo.getDate() + 1);
		dias.push({data: proximo, foraDoMesAtual: true});
	}
	
	return dias;
}

function isDateBlocked(date: Date, minDate: Date, maxDate: Date | null): boolean {
	const alvo = normalizeDate(date);
	if (alvo < minDate) {
		return true;
	}
	
	if (maxDate && alvo > maxDate) {
		return true;
	}
	
	return false;
}

function isMonthBlocked(year: number, month: number, minDate: Date, maxDate: Date | null): boolean {
	const inicioMes = startOfMonth(year, month);
	const fimMes = endOfMonth(year, month);
	return fimMes < minDate || (maxDate ? inicioMes > maxDate : false);
}

function isYearBlocked(year: number, minDate: Date, maxDate: Date | null): boolean {
	const inicioAno = startOfYear(year);
	const fimAno = endOfYear(year);
	return fimAno < minDate || (maxDate ? inicioAno > maxDate : false);
}

export function Calendario({
							   id,
							   label,
							   value,
							   onChange,
							   placeholder = 'Selecione uma data',
							   min,
							   max,
							   disabled = false,
							   required = false,
							   permitirPassado = false,
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
	const containerRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		const dataBase = selecionada ?? hoje;
		setMesAtual(new Date(dataBase.getFullYear(), dataBase.getMonth(), 1));
		setInicioPaginaAnos(dataBase.getFullYear() - 5);
	}, [selecionada, hoje]);
	
	useEffect(() => {
		if (!aberto) {
			return undefined;
		}
		
		function handleOutsideClick(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setAberto(false);
				setPainel('dia');
			}
		}
		
		function handleEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setAberto(false);
				setPainel('dia');
			}
		}
		
		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleEscape);
		
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [aberto]);
	
	const diasDoMes = useMemo(() => buildMonthGrid(mesAtual), [mesAtual]);
	
	const anosDaPagina = useMemo(() => {
		return Array.from({length: TAMANHO_PAGINA_ANOS}, (_, index) => inicioPaginaAnos + index);
	}, [inicioPaginaAnos]);
	
	const labelMes = useMemo(() => {
		return new Intl.DateTimeFormat('pt-BR', {month: 'long'}).format(mesAtual);
	}, [mesAtual]);
	
	const labelAno = mesAtual.getFullYear();
	
	const valorExibicao = useMemo(() => {
		if (!selecionada) {
			return '';
		}
		return new Intl.DateTimeFormat('pt-BR').format(selecionada);
	}, [selecionada]);
	
	const podeIrMesAnterior = !isMonthBlocked(
		mesAtual.getFullYear(),
		mesAtual.getMonth() - 1,
		minDate,
		maxDate,
	);
	const podeIrMesSeguinte = !isMonthBlocked(
		mesAtual.getFullYear(),
		mesAtual.getMonth() + 1,
		minDate,
		maxDate,
	);
	const podeIrAnoAnterior = !isYearBlocked(mesAtual.getFullYear() - 1, minDate, maxDate);
	const podeIrAnoSeguinte = !isYearBlocked(mesAtual.getFullYear() + 1, minDate, maxDate);
	const podeIrPaginaAnosAnterior = anosDaPagina.some((ano) => !isYearBlocked(ano - TAMANHO_PAGINA_ANOS, minDate, maxDate));
	const podeIrPaginaAnosSeguinte = anosDaPagina.some((ano) => !isYearBlocked(ano + TAMANHO_PAGINA_ANOS, minDate, maxDate));
	
	function selecionarData(data: Date) {
		if (isDateBlocked(data, minDate, maxDate)) {
			return;
		}
		
		onChange(toIsoDate(data));
		setAberto(false);
		setPainel('dia');
	}
	
	function handleAnterior() {
		if (painel === 'dia') {
			if (!podeIrMesAnterior) return;
			setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
			return;
		}
		
		if (painel === 'mes') {
			if (!podeIrAnoAnterior) return;
			setMesAtual(new Date(mesAtual.getFullYear() - 1, mesAtual.getMonth(), 1));
			return;
		}
		
		if (!podeIrPaginaAnosAnterior) return;
		setInicioPaginaAnos((valorAtual) => valorAtual - TAMANHO_PAGINA_ANOS);
	}
	
	function handleSeguinte() {
		if (painel === 'dia') {
			if (!podeIrMesSeguinte) return;
			setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
			return;
		}
		
		if (painel === 'mes') {
			if (!podeIrAnoSeguinte) return;
			setMesAtual(new Date(mesAtual.getFullYear() + 1, mesAtual.getMonth(), 1));
			return;
		}
		
		if (!podeIrPaginaAnosSeguinte) return;
		setInicioPaginaAnos((valorAtual) => valorAtual + TAMANHO_PAGINA_ANOS);
	}
	
	function abrirCalendario() {
		if (disabled) {
			return;
		}
		
		setAberto((valorAtual) => !valorAtual);
		setPainel('dia');
		setInicioPaginaAnos(mesAtual.getFullYear() - 5);
	}
	
	return (
		<div className={styles.calendario} ref={containerRef}>
			<label htmlFor={id} className={styles.calendario__label}>
				{label}
				{required ? <span className={styles.calendario__required}>*</span> : null}
			</label>
			
			<button
				id={id}
				type="button"
				className={styles.calendario__trigger}
				onClick={abrirCalendario}
				disabled={disabled}
				aria-haspopup="dialog"
				aria-expanded={aberto}
			>
        <span
	        className={`${styles.calendario__value} ${!valorExibicao ? styles['calendario__value--placeholder'] : ''}`}>
          {valorExibicao || placeholder}
        </span>
				<Calendar size={18} className={styles.calendario__icon}/>
			</button>
			
			{aberto ? (
				<div className={styles.calendario__popover} role="dialog" aria-label={`Selecionar data para ${label}`}>
					<div className={styles.calendario__header}>
						<button
							type="button"
							className={styles.calendario__nav}
							onClick={handleAnterior}
							disabled={
								(painel === 'dia' && !podeIrMesAnterior) ||
								(painel === 'mes' && !podeIrAnoAnterior) ||
								(painel === 'ano' && !podeIrPaginaAnosAnterior)
							}
							aria-label="Anterior"
						>
							<ChevronLeft size={16}/>
						</button>
						
						<div className={styles.calendario__titleGroup}>
							<button
								type="button"
								className={styles.calendario__titleButton}
								onClick={() => setPainel('mes')}
							>
								{labelMes}
							</button>
							<button
								type="button"
								className={styles.calendario__titleButton}
								onClick={() => setPainel('ano')}
							>
								{labelAno}
							</button>
						</div>
						
						<button
							type="button"
							className={styles.calendario__nav}
							onClick={handleSeguinte}
							disabled={
								(painel === 'dia' && !podeIrMesSeguinte) ||
								(painel === 'mes' && !podeIrAnoSeguinte) ||
								(painel === 'ano' && !podeIrPaginaAnosSeguinte)
							}
							aria-label="Próximo"
						>
							<ChevronRight size={16}/>
						</button>
					</div>
					
					{painel === 'dia' ? (
						<>
							<div className={styles.calendario__weekdays}>
								{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((diaSemana) => (
									<span key={diaSemana} className={styles.calendario__weekday}>
                    {diaSemana}
                  </span>
								))}
							</div>
							
							<div className={styles.calendario__days}>
								{diasDoMes.map(({data, foraDoMesAtual}) => {
									const selected = selecionada ? isSameDate(data, selecionada) : false;
									const isToday = isSameDate(data, hoje);
									const blocked = isDateBlocked(data, minDate, maxDate);
									
									return (
										<button
											key={toIsoDate(data)}
											type="button"
											className={[
												styles.calendario__day,
												foraDoMesAtual ? styles['calendario__day--outside'] : '',
												selected ? styles['calendario__day--selected'] : '',
												isToday ? styles['calendario__day--today'] : '',
											]
												.filter(Boolean)
												.join(' ')}
											onClick={() => selecionarData(data)}
											disabled={blocked}
										>
											{data.getDate()}
										</button>
									);
								})}
							</div>
						</>
					) : null}
					
					{painel === 'mes' ? (
						<div className={styles.calendario__grid}>
							{MESES.map((mesNome, mesIndice) => {
								const blocked = isMonthBlocked(mesAtual.getFullYear(), mesIndice, minDate, maxDate);
								const active = mesAtual.getMonth() === mesIndice;
								
								return (
									<button
										key={mesNome}
										type="button"
										className={[
											styles.calendario__cell,
											active ? styles['calendario__cell--active'] : '',
										]
											.filter(Boolean)
											.join(' ')}
										disabled={blocked}
										onClick={() => {
											setMesAtual(new Date(mesAtual.getFullYear(), mesIndice, 1));
											setPainel('dia');
										}}
									>
										{mesNome}
									</button>
								);
							})}
						</div>
					) : null}
					
					{painel === 'ano' ? (
						<div className={styles.calendario__grid}>
							{anosDaPagina.map((ano) => {
								const blocked = isYearBlocked(ano, minDate, maxDate);
								const active = mesAtual.getFullYear() === ano;
								
								return (
									<button
										key={ano}
										type="button"
										className={[
											styles.calendario__cell,
											active ? styles['calendario__cell--active'] : '',
										]
											.filter(Boolean)
											.join(' ')}
										disabled={blocked}
										onClick={() => {
											setMesAtual(new Date(ano, mesAtual.getMonth(), 1));
											setPainel('dia');
										}}
									>
										{ano}
									</button>
								);
							})}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
