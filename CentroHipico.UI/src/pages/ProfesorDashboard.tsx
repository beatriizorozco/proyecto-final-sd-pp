import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";

import type {
    Profesor,
    Disciplina,
    NivelClaseDto,
    ClaseHipicaDto,
    PistaDto,
    ReservaClaseDto,
} from "../api";

import {
    getProfesores,
    getDisciplinas,
    getNivelesClase,
    getPistas,
    getClases,
    crearClaseHipica,
    getReservasClasePorClase,
} from "../api";

interface Props {
    onLogout: () => void;
}

export default function ProfesorDashboard({ onLogout }: Props) {
    const [profesor, setProfesor] = useState<Profesor | null>(null);

    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [niveles, setNiveles] = useState<NivelClaseDto[]>([]);
    const [pistas, setPistas] = useState<PistaDto[]>([]);
    const [clases, setClases] = useState<ClaseHipicaDto[]>([]);

    const [loadingInit, setLoadingInit] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const [claseTitulo, setClaseTitulo] = useState("");
    const [claseDisciplinaId, setClaseDisciplinaId] = useState("");
    const [claseNivelId, setClaseNivelId] = useState("");
    const [clasePistaId, setClasePistaId] = useState("");
    const [claseFecha, setClaseFecha] = useState("");
    const [claseDuracion, setClaseDuracion] = useState("60");
    const [clasePlazas, setClasePlazas] = useState("8");
    const [savingClase, setSavingClase] = useState(false);

    const [openClaseId, setOpenClaseId] = useState<number | null>(null);
    const [alumnosByClase, setAlumnosByClase] = useState<Record<number, ReservaClaseDto[]>>({});
    const [loadingAlumnosClaseId, setLoadingAlumnosClaseId] = useState<number | null>(null);

    const clearMessages = () => {
        setErrorMsg(null);
        setInfoMsg(null);
    };

    useEffect(() => {
        async function cargar() {
            try {
                setLoadingInit(true);
                clearMessages();

                const email = localStorage.getItem("userEmail");
                if (!email) throw new Error("No hay usuario autenticado en este navegador.");

                const [profesApi, discApi, nivelesApi, pistasApi, clasesApi] =
                    await Promise.all([
                        getProfesores(),
                        getDisciplinas(),
                        getNivelesClase(),
                        getPistas(),
                        getClases(),
                    ]);

                const prof = profesApi.find(
                    (p) => p.email.toLowerCase() === email.toLowerCase()
                );
                if (!prof) {
                    throw new Error("No se ha encontrado el profesor asociado a este email.");
                }

                setProfesor(prof);
                setDisciplinas(discApi);
                setNiveles(nivelesApi);
                setPistas(pistasApi);

                clasesApi.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
                setClases(clasesApi);
            } catch (err: any) {
                setErrorMsg(err?.message || "Error al cargar datos del profesor.");
            } finally {
                setLoadingInit(false);
            }
        }

        void cargar();
    }, []);

    const misClases = useMemo(() => {
        if (!profesor) return [];
        return clases.filter((c) => c.profesorId === profesor.id);
    }, [clases, profesor]);

    const formatFecha = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("es-ES", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const toIsoLocalSinZ = (dateTimeLocal: string) => {
        return `${dateTimeLocal}:00`;
    };

    const handleCrearClase = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (!profesor) return;

        if (
            !claseTitulo ||
            !claseDisciplinaId ||
            !claseNivelId ||
            !clasePistaId ||
            !claseFecha
        ) {
            setErrorMsg("Rellena todos los campos obligatorios.");
            return;
        }

        const dur = Number(claseDuracion) || 0;
        const plazas = Number(clasePlazas) || 0;

        if (dur <= 0 || plazas <= 0) {
            setErrorMsg("Duración y plazas deben ser mayores que cero.");
            return;
        }

        try {
            setSavingClase(true);

            const nueva = await crearClaseHipica({
                titulo: claseTitulo,
                disciplinaId: Number(claseDisciplinaId),
                nivelClaseId: Number(claseNivelId),
                fechaIso: toIsoLocalSinZ(claseFecha),
                duracionMinutos: dur,
                plazasMaximas: plazas,
                profesorId: profesor.id,
                pistaId: Number(clasePistaId),
            });

            setClases((prev) =>
                [...prev, nueva].sort(
                    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                )
            );

            setInfoMsg("Clase creada correctamente.");
            setClaseTitulo("");
            setClaseDisciplinaId("");
            setClaseNivelId("");
            setClasePistaId("");
            setClaseFecha("");
            setClaseDuracion("60");
            setClasePlazas("8");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo crear la clase.");
        } finally {
            setSavingClase(false);
        }
    };

    const toggleVerAlumnos = async (claseId: number) => {
        clearMessages();

        if (openClaseId === claseId) {
            setOpenClaseId(null);
            return;
        }

        setOpenClaseId(claseId);

        if (alumnosByClase[claseId]) return;

        try {
            setLoadingAlumnosClaseId(claseId);
            const reservas = await getReservasClasePorClase(claseId);
            setAlumnosByClase((prev) => ({ ...prev, [claseId]: reservas }));
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudieron cargar los alumnos de la clase.");
        } finally {
            setLoadingAlumnosClaseId(null);
        }
    };
    
    return (
        <Flex minH="100vh" bg="gray.900" align="flex-start" justify="center" px={4} py={8}>
            <Box bg="white" borderRadius="2xl" p={8} maxW="6xl" w="100%" boxShadow="xl">
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Heading size="md">PROFESOR</Heading>
                        <Text fontSize="sm" color="gray.600">
                            {profesor
                                ? `Hola, ${profesor.nombre} ${profesor.apellidos}`
                                : "Cargando profesor..."}
                        </Text>
                    </Box>
                    <Button size="sm" variant="outline" onClick={onLogout}>
                        Cerrar sesión
                    </Button>
                </Flex>

                {loadingInit && (
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Cargando datos...
                    </Text>
                )}

                {errorMsg && (
                    <Text fontSize="sm" color="red.500" mb={3}>
                        {errorMsg}
                    </Text>
                )}

                {infoMsg && (
                    <Text fontSize="sm" color="green.600" mb={3}>
                        {infoMsg}
                    </Text>
                )}

                {/*Crear clase*/}
                <Box mb={6}>
                    <Heading size="sm" mb={2}>
                        Crear clase:
                    </Heading>

                    <form onSubmit={handleCrearClase}>
                        <Box mb={2}>
                            <Text fontSize="xs" mb={1}>
                                Título
                            </Text>
                            <Input
                                value={claseTitulo}
                                onChange={(e) => setClaseTitulo(e.target.value)}
                                bg="white"
                                color="black"
                                size="sm"
                            />
                        </Box>

                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Disciplina
                                </Text>
                                <select
                                    value={claseDisciplinaId}
                                    onChange={(e) => setClaseDisciplinaId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona disciplina</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre}
                                        </option>
                                    ))}
                                </select>
                            </Box>

                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Nivel
                                </Text>
                                <select
                                    value={claseNivelId}
                                    onChange={(e) => setClaseNivelId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona nivel</option>
                                    {niveles.map((n) => (
                                        <option key={n.id} value={n.id}>
                                            {n.nombre}
                                        </option>
                                    ))}
                                </select>
                            </Box>

                            <Box flex="1 1 220px">
                                <Text fontSize="xs" mb={1}>
                                    Pista
                                </Text>
                                <select
                                    value={clasePistaId}
                                    onChange={(e) => setClasePistaId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona pista</option>
                                    {pistas.filter(p => p.activa).map((p) => (

                                        <option key={p.id} value={p.id}>
                                            {p.nombre} ({p.tipo})
                                        </option>
                                    ))}
                                </select>
                            </Box>
                        </Flex>

                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="1 1 220px">
                                <Text fontSize="xs" mb={1}>
                                    Fecha y hora
                                </Text>
                                <Input
                                    type="datetime-local"
                                    value={claseFecha}
                                    onChange={(e) => setClaseFecha(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>

                            <Box flex="1 1 120px">
                                <Text fontSize="xs" mb={1}>
                                    Duración (min)
                                </Text>
                                <Input
                                    type="number"
                                    min={1}
                                    value={claseDuracion}
                                    onChange={(e) => setClaseDuracion(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>

                            <Box flex="1 1 120px">
                                <Text fontSize="xs" mb={1}>
                                    Plazas máx.
                                </Text>
                                <Input
                                    type="number"
                                    min={1}
                                    value={clasePlazas}
                                    onChange={(e) => setClasePlazas(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                        </Flex>

                        <Button type="submit" size="sm" colorScheme="teal" disabled={savingClase}>
                            {savingClase ? "Guardando..." : "Crear clase"}
                        </Button>
                    </form>
                </Box>

                <Box borderTop="1px solid #e2e2e2" my={6}></Box>

                {/* Mis clases */}
                <Box>
                    <Heading size="sm" mb={2}>
                        Mis clases programadas
                    </Heading>

                    {misClases.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                            No tienes clases programadas todavía.
                        </Text>
                    ) : (
                        <Box overflowX="auto" border="1px solid #E2E8F0" borderRadius="md">
                            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                                <thead style={{ background: "#F7FAFC" }}>
                                    <tr>
                                        <th style={{ padding: 8, textAlign: "left", width: 150, whiteSpace: "nowrap" }}>Fecha</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 220, whiteSpace: "nowrap" }}>Título</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 120, whiteSpace: "nowrap" }}>Disciplina</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 170, whiteSpace: "nowrap" }}>Nivel</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 140, whiteSpace: "nowrap" }}>Pista</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 90, whiteSpace: "nowrap" }}>Plazas</th>
                                        <th style={{ padding: 8, textAlign: "left", width: 100, whiteSpace: "nowrap" }}>Alumnos</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {misClases.map((c, idx) => {
                                        const abiertos = openClaseId === c.id;
                                        const reservas = alumnosByClase[c.id] || [];
                                        const loadingAlumnos = loadingAlumnosClaseId === c.id;

                                        const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";

                                        const tdBase: React.CSSProperties = {
                                            padding: 8,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        };

                                        return (
                                            <>
                                                <tr style={{ background: rowBg }}>
                                                    <td style={tdBase}>{formatFecha(c.fecha)}</td>
                                                    <td style={tdBase} title={c.titulo}>{c.titulo}</td>
                                                    <td style={tdBase}>{c.disciplina?.nombre ?? "-"}</td>
                                                    <td style={tdBase} title={c.nivel?.nombre ?? "-"}>{c.nivel?.nombre ?? "-"}</td>
                                                    <td style={tdBase} title={c.pista ? c.pista.nombre : `Pista #${c.pistaId}`}>
                                                        {c.pista ? c.pista.nombre : `Pista #${c.pistaId}`}
                                                    </td>
                                                    <td style={tdBase}>{c.plazasMaximas}</td>
                                                    <td style={tdBase}>
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() => toggleVerAlumnos(c.id)}
                                                        >
                                                            {abiertos ? "Ocultar" : "Ver"}
                                                        </Button>
                                                    </td>
                                                </tr>

                                                {abiertos && (
                                                    <tr>
                                                        <td colSpan={7} style={{ padding: 0 }}>
                                                            <Box borderTop="1px solid #E2E8F0" p={3} bg="white">
                                                                {loadingAlumnos ? (
                                                                    <Text fontSize="sm" color="gray.600">
                                                                        Cargando alumnos...
                                                                    </Text>
                                                                ) : reservas.length === 0 ? (
                                                                    <Text fontSize="sm" color="gray.500">
                                                                        Nadie se ha apuntado todavía.
                                                                    </Text>
                                                                ) : (
                                                                    <Box>
                                                                        <Text fontSize="sm" color="gray.700" mb={2}>
                                                                            Alumnos apuntados: {reservas.length}
                                                                        </Text>
                                                                        <Box as="ul" pl={4} m={0}>
                                                                            {reservas.map((r) => (
                                                                                <Box as="li" key={r.id} fontSize="sm">
                                                                                    {r.jinete
                                                                                        ? `${r.jinete.nombre} ${r.jinete.apellidos} (${r.jinete.email})`
                                                                                        : `Jinete #${r.jineteId}`}
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Box>
                    )}
                </Box>
            </Box>
        </Flex>
    );
}
