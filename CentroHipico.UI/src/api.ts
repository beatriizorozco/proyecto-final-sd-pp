const API_BASE = "https://localhost:7175";

export interface Jinete {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    rolId: number;
    tieneCaballoPropio: boolean;
}

export interface Profesor {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    especialidad: string;
    aniosExperiencia: number;
    activo: boolean;
}

export interface ClaseHipica {
    id: number;
    titulo: string;
    disciplinaId: number;
    nivelClaseId: number;
    fecha: string; // ISO
    duracionMinutos: number;
    plazasMaximas: number;
    profesorId: number;
    pistaId: number;
}

export interface Disciplina {
    id: number;
    nombre: string;
}

export interface NivelClaseDto {
    id: number;
    nombre: string;
}

export interface PistaDto {
    id: number;
    nombre: string;
    tipo: string;
    activa: boolean;
}

export interface Caballo {
    id: number;
    nombre: string;
    edad: number;
    nivel: string;
    esPropio: boolean;
    sexo: "H" | "M";
}

export interface ClaseHipicaDto {
    id: number;
    titulo: string;
    fecha: string; // ISO string
    duracionMinutos: number;
    plazasMaximas: number;
    profesorId: number;
    pistaId: number;

    disciplina?: { nombre: string };
    nivel?: { nombre: string };
    profesor?: { nombre: string; apellidos: string };
    pista?: { nombre: string };
}

// Reserva de clase
export interface ReservaClaseDto {
    id: number;
    claseHipicaId: number;
    jineteId: number;
    claseHipica?: ClaseHipicaDto;
    jinete?: { id: number; nombre: string; apellidos: string; email: string };
}

// Reserva de pista
export interface ReservaPistaDto {
    id: number;
    jineteId: number;
    caballoId: number;
    pistaId: number;
    inicio: string;
    fin: string;
}

export interface CrearReservaPistaDto {
    jineteId: number;
    caballoId: number;
    pistaId: number;
    inicio: string;
    fin: string;
}

//   JINETES
export async function getJinetes(): Promise<Jinete[]> {
    const resp = await fetch(`${API_BASE}/api/Jinetes`);
    if (!resp.ok) throw new Error("Error al cargar jinetes");
    return resp.json();
}

export async function crearJinete(
    nombre: string,
    apellidos: string,
    email: string,
    tieneCaballoPropio: boolean
): Promise<Jinete> {
    const resp = await fetch(`${API_BASE}/api/Jinetes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellidos,
            email,
            rolId: 1,
            tieneCaballoPropio,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear el jinete");
    }

    return resp.json();
}

//   PROFESORES
export async function getProfesores(): Promise<Profesor[]> {
    const resp = await fetch(`${API_BASE}/api/Profesores`);
    if (!resp.ok) throw new Error("Error al cargar profesores");
    return resp.json();
}

export async function crearProfesor(
    nombre: string,
    apellidos: string,
    email: string,
    especialidad: string,
    aniosExperiencia: number
): Promise<Profesor> {
    const resp = await fetch(`${API_BASE}/api/Profesores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellidos,
            email,
            especialidad,
            aniosExperiencia,
            activo: true,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear el profesor.");
    }

    return resp.json();
}

//   CABALLOS
export async function getCaballos(): Promise<Caballo[]> {
    const resp = await fetch(`${API_BASE}/api/Caballos`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar caballos.");
    }
    return resp.json();
}

export async function crearCaballo(
    nombre: string,
    edad: number,
    nivel: string,
    esPropio: boolean,
    sexo: "H" | "M"
): Promise<Caballo> {
    const resp = await fetch(`${API_BASE}/api/Caballos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            edad,
            nivel,
            esPropio,
            sexo,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear el caballo.");
    }

    return resp.json();
}

//   DISCIPLINAS
export async function getDisciplinas(): Promise<Disciplina[]> {
    const resp = await fetch(`${API_BASE}/api/Disciplinas`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar las disciplinas.");
    }
    return resp.json();
}

export async function crearDisciplina(nombre: string): Promise<Disciplina> {
    const resp = await fetch(`${API_BASE}/api/Disciplinas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear la disciplina.");
    }

    return resp.json();
}

//   NIVELES DE CLASE
export async function getNivelesClase(): Promise<NivelClaseDto[]> {
    const resp = await fetch(`${API_BASE}/api/NivelesClases`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar los niveles de clase.");
    }
    return resp.json();
}

export async function crearNivelClase(nombre: string): Promise<NivelClaseDto> {
    const resp = await fetch(`${API_BASE}/api/NivelesClases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear el nivel de clase.");
    }

    return resp.json();
}

//   PISTAS
export async function getPistas(): Promise<PistaDto[]> {
    const res = await fetch(`${API_BASE}/api/Pistas`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudieron cargar las pistas.");
    }

    return await res.json();
}

export async function crearPista(
    nombre: string,
    tipo: string,
    activa: boolean
): Promise<PistaDto> {
    const resp = await fetch(`${API_BASE}/api/Pistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            tipo,
            activa,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear la pista.");
    }

    return resp.json();
}

export async function togglePistaActiva(pista: PistaDto): Promise<void> {
    const resp = await fetch(`${API_BASE}/api/Pistas/${pista.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: pista.id,
            nombre: pista.nombre,
            tipo: pista.tipo,
            activa: !pista.activa,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo actualizar la pista.");
    }
}

//   CLASES
export async function getClases(): Promise<ClaseHipicaDto[]> {
    const resp = await fetch(`${API_BASE}/api/ClasesHipica`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar las clases.");
    }
    return resp.json();
}

export async function crearClaseHipica(params: {
    titulo: string;
    disciplinaId: number;
    nivelClaseId: number;
    fechaIso: string;
    duracionMinutos: number;
    plazasMaximas: number;
    profesorId: number;
    pistaId: number;
}): Promise<ClaseHipicaDto> {
    const resp = await fetch(`${API_BASE}/api/ClasesHipica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo: params.titulo,
            disciplinaId: params.disciplinaId,
            nivelClaseId: params.nivelClaseId,
            fecha: params.fechaIso, // ISO string
            duracionMinutos: params.duracionMinutos,
            plazasMaximas: params.plazasMaximas,
            profesorId: params.profesorId,
            pistaId: params.pistaId,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear la clase hípica.");
    }

    return resp.json();
}

//   RESERVAS DE CLASE
export async function crearReservaClase(
    jineteId: number,
    claseHipicaId: number
): Promise<ReservaClaseDto> {
    const resp = await fetch(`${API_BASE}/api/ReservasClases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jineteId,
            claseHipicaId,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear la reserva.");
    }

    return resp.json();
}

export async function getReservasClasePorJinete(
    jineteId: number
): Promise<ReservaClaseDto[]> {
    const resp = await fetch(`${API_BASE}/api/ReservasClases/jinete/${jineteId}`);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar las reservas de clase.");
    }
    return resp.json();
}

export async function getReservasClasePorClase(claseHipicaId: number): Promise<ReservaClaseDto[]> {
    const resp = await fetch(`${API_BASE}/api/ReservasClases/clase/${claseHipicaId}`);

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al cargar las reservas de esta clase.");
    }

    return resp.json();
}

//   RESERVAS DE PISTA
export async function crearReservaPista(
    dto: CrearReservaPistaDto
): Promise<ReservaPistaDto> {
    const resp = await fetch(`${API_BASE}/api/ReservaPista`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Error al crear reserva de pista.");
    }

    return resp.json();
}
