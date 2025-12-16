import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";

import type {
    Profesor,
    Disciplina,
    NivelClaseDto,
    ClaseHipicaDto,
    PistaDto,
    Caballo,
} from "../api";
import {
    getProfesores,
    getDisciplinas,
    getNivelesClase,
    getClases,
    getPistas,
    getCaballos,
    crearProfesor,
    crearPista,
    crearClaseHipica,
    crearCaballo,
    togglePistaActiva,
} from "../api";

const OPCIONES_NIVEL_CABALLO = [
    "Doma",
    "Salto",
    "Volteo",
    "Completo",
    "Paseo / Ruta",
    "Equinoterapia",
    "Potro"
];

interface Props {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
    const [profesores, setProfesores] = useState<Profesor[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [niveles, setNiveles] = useState<NivelClaseDto[]>([]);
    const [clases, setClases] = useState<ClaseHipicaDto[]>([]);
    const [pistas, setPistas] = useState<PistaDto[]>([]);
    const [caballos, setCaballos] = useState<Caballo[]>([]);

    const [loadingInit, setLoadingInit] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const [savingProfesor, setSavingProfesor] = useState(false);
    const [savingPista, setSavingPista] = useState(false);
    const [savingClase, setSavingClase] = useState(false);
    const [savingCaballo, setSavingCaballo] = useState(false);

    //Formularios

    const [profNombre, setProfNombre] = useState("");
    const [profApellidos, setProfApellidos] = useState("");
    const [profEmail, setProfEmail] = useState("");
    const [profEspecialidad, setProfEspecialidad] = useState("");
    const [profAnios, setProfAnios] = useState("");

    const [cabNombre, setCabNombre] = useState("");
    const [cabEdad, setCabEdad] = useState("");
    const [cabNivel, setCabNivel] = useState("");
    const [cabEsPropio, setCabEsPropio] = useState(false);
    const [cabSexo, setCabSexo] = useState<"H" | "M">("H");

    const [pistaNombre, setPistaNombre] = useState("");
    const [pistaTipo, setPistaTipo] = useState("");
    const [pistaActiva, setPistaActiva] = useState(true);

    const [claseTitulo, setClaseTitulo] = useState("");
    const [claseDisciplinaId, setClaseDisciplinaId] = useState("");
    const [claseNivelId, setClaseNivelId] = useState("");
    const [claseProfesorId, setClaseProfesorId] = useState("");
    const [claseFecha, setClaseFecha] = useState("");
    const [claseDuracion, setClaseDuracion] = useState("60");
    const [clasePlazas, setClasePlazas] = useState("8");
    const [clasePistaId, setClasePistaId] = useState("");

    const clearMessages = () => {
        setErrorMsg(null);
        setInfoMsg(null);
    };

    //Cargo los datos iniciales necesarios
    useEffect(() => {
        async function cargar() {
            try {
                setLoadingInit(true);
                clearMessages();

                const [
                    profesApi,
                    discApi,
                    nivelesApi,
                    clasesApi,
                    pistasApi,
                    caballosApi,
                ] = await Promise.all([
                    getProfesores(),
                    getDisciplinas(),
                    getNivelesClase(),
                    getClases(),
                    getPistas(),
                    getCaballos(),
                ]);

                setProfesores(profesApi);
                setDisciplinas(discApi);
                setNiveles(nivelesApi);
                setPistas(pistasApi);
                setCaballos(caballosApi);

                clasesApi.sort(
                    (a: ClaseHipicaDto, b: ClaseHipicaDto) =>
                        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                );
                setClases(clasesApi);
            } catch (err: any) {
                setErrorMsg(err?.message || "Error al cargar datos iniciales.");
            } finally {
                setLoadingInit(false);
            }
        }

        void cargar();
    }, []);

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

    //Handlers de formularios

    const handleCrearProfesor = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (!profNombre || !profApellidos || !profEmail || !profEspecialidad) {
            setErrorMsg("Rellena todos los campos del profesor.");
            return;
        }

        const anios = Number(profAnios) || 0;

        try {
            setSavingProfesor(true);
            const nuevo = await crearProfesor(
                profNombre,
                profApellidos,
                profEmail,
                profEspecialidad,
                anios
            );

            setProfesores((prev) => [...prev, nuevo]);
            setInfoMsg("Profesor creado correctamente.");
            setProfNombre("");
            setProfApellidos("");
            setProfEmail("");
            setProfEspecialidad("");
            setProfAnios("");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo crear el profesor.");
        } finally {
            setSavingProfesor(false);
        }
    };

    const handleCrearCaballo = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (!cabNombre || !cabEdad || !cabNivel) {
            setErrorMsg("Rellena nombre, edad y nivel del caballo.");
            return;
        }

        const edadNum = Number(cabEdad) || 0;
        if (edadNum <= 0) {
            setErrorMsg("La edad del caballo debe ser mayor que cero.");
            return;
        }

        try {
            setSavingCaballo(true);
            const nuevo = await (crearCaballo as any)(
                cabNombre,
                edadNum,
                cabNivel,
                cabEsPropio,
                cabSexo
            );

            setCaballos((prev) => [...prev, nuevo]);
            setInfoMsg("Caballo creado correctamente.");
            setCabNombre("");
            setCabEdad("");
            setCabNivel("");
            setCabEsPropio(false);
            setCabSexo("H");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo crear el caballo.");
        } finally {
            setSavingCaballo(false);
        }
    };

    const handleCrearPista = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (!pistaNombre || !pistaTipo) {
            setErrorMsg("Rellena nombre y tipo de la pista.");
            return;
        }

        try {
            setSavingPista(true);
            const nueva = await crearPista(pistaNombre, pistaTipo, pistaActiva);
            setPistas((prev) => [...prev, nueva]);
            setInfoMsg("Pista creada correctamente.");
            setPistaNombre("");
            setPistaTipo("");
            setPistaActiva(true);
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo crear la pista.");
        } finally {
            setSavingPista(false);
        }
    };

    const handleTogglePista = async (pista: PistaDto) => {
        try {
            clearMessages();
            await togglePistaActiva(pista);

            setPistas((prev) =>
                prev.map((p) =>
                    p.id === pista.id ? { ...p, activa: !p.activa } : p
                )
            );

            setInfoMsg(`Pista "${pista.nombre}" ${!pista.activa ? "activada" : "desactivada"} correctamente.`);
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo cambiar el estado de la pista.");
        }
    };

    const handleCrearClase = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (
            !claseTitulo ||
            !claseDisciplinaId ||
            !claseNivelId ||
            !claseProfesorId ||
            !claseFecha ||
            !clasePistaId
        ) {
            setErrorMsg(
                "Rellena todos los campos obligatorios de la clase."
            );
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

            const fechaIso = claseFecha;

            const nueva = await crearClaseHipica({
                titulo: claseTitulo,
                disciplinaId: Number(claseDisciplinaId),
                nivelClaseId: Number(claseNivelId),
                fechaIso,
                duracionMinutos: dur,
                plazasMaximas: plazas,
                profesorId: Number(claseProfesorId),
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
            setClaseProfesorId("");
            setClaseFecha("");
            setClaseDuracion("60");
            setClasePlazas("8");
            setClasePistaId("");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo crear la clase.");
        } finally {
            setSavingClase(false);
        }
    };

    const handlePistaActivaChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPistaActiva(e.target.checked);
    };

    const handleCabEsPropioChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCabEsPropio(e.target.checked);
    };

    return (
        <Flex
            minH="100vh"
            bg="gray.900"
            align="flex-start"
            justify="center"
            px={4}
            py={8}
        >
            <Box
                bg="white"
                borderRadius="2xl"
                p={8}
                maxW="6xl"
                w="100%"
                boxShadow="xl"
            >
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Heading size="md">ADMINISTRADOR</Heading>
                        <Text fontSize="sm" color="gray.600">
                            Gestión de profesores, caballos, pistas y clases.
                        </Text>
                    </Box>
                    <Button size="sm" variant="outline" onClick={onLogout}>
                        Cerrar sesión
                    </Button>
                </Flex>

                {loadingInit && (
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Cargando datoS...
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

                {/*Crear profesor*/}
                <Box mb={6}>
                    <Heading size="sm" mb={2}>
                        Crear profesor:
                    </Heading>

                    <form onSubmit={handleCrearProfesor}>
                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="1 1 180px">
                                <Text fontSize="xs" mb={1}>
                                    Nombre
                                </Text>
                                <Input
                                    value={profNombre}
                                    onChange={(e) => setProfNombre(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Apellidos
                                </Text>
                                <Input
                                    value={profApellidos}
                                    onChange={(e) => setProfApellidos(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                            <Box flex="1 1 220px">
                                <Text fontSize="xs" mb={1}>
                                    Email
                                </Text>
                                <Input
                                    type="email"
                                    value={profEmail}
                                    onChange={(e) => setProfEmail(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                        </Flex>

                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="2 1 240px">
                                <Text fontSize="xs" mb={1}>
                                    Especialidad (disciplina)
                                </Text>
                                <select
                                    value={profEspecialidad}
                                    onChange={(e) => setProfEspecialidad(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona especialidad</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.id} value={d.nombre}>
                                            {d.nombre}
                                        </option>
                                    ))}
                                </select>
                            </Box>
                            <Box flex="1 1 120px">
                                <Text fontSize="xs" mb={1}>
                                    Años experiencia
                                </Text>
                                <Input
                                    type="number"
                                    min={0}
                                    value={profAnios}
                                    onChange={(e) => setProfAnios(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                        </Flex>

                        <Button
                            type="submit"
                            size="sm"
                            colorScheme="teal"
                            disabled={savingProfesor}
                        >
                            {savingProfesor ? "Guardando..." : "Crear profesor"}
                        </Button>

                        {profesores.length > 0 && (
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Profesores registrados: {profesores.length}
                            </Text>
                        )}
                    </form>
                </Box>

                <Box borderTop="1px solid #e2e2e2" my={6}></Box>

                {/*Crear caballo*/}
                <Box mb={6}>
                    <Heading size="sm" mb={2}>
                        Crear caballo:
                    </Heading>

                    <form onSubmit={handleCrearCaballo}>
                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Nombre
                                </Text>
                                <Input
                                    value={cabNombre}
                                    onChange={(e) => setCabNombre(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                            <Box flex="1 1 120px">
                                <Text fontSize="xs" mb={1}>
                                    Edad
                                </Text>
                                <Input
                                    type="number"
                                    min={1}
                                    value={cabEdad}
                                    onChange={(e) => setCabEdad(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                            <Box flex="1 1 220px">
                                <Text fontSize="xs" mb={1}>
                                    Nivel / uso principal
                                </Text>
                                <select
                                    value={cabNivel}
                                    onChange={(e) => setCabNivel(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona nivel / uso</option>
                                    {OPCIONES_NIVEL_CABALLO.map((op) => (
                                        <option key={op} value={op}>
                                            {op}
                                        </option>
                                    ))}
                                </select>
                            </Box>

                            <Box flex="1 1 160px">
                                <Text fontSize="xs" mb={1}>
                                    Sexo
                                </Text>
                                <select
                                    value={cabSexo}
                                    onChange={(e) => setCabSexo(e.target.value as "H" | "M")}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="H">Yegua</option>
                                    <option value="M">Caballo</option>
                                </select>
                            </Box>
                        </Flex>

                        <Box
                            mb={2}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            fontSize="sm"
                        >
                            <input
                                id="cabEsPropio"
                                type="checkbox"
                                checked={cabEsPropio}
                                onChange={handleCabEsPropioChange}
                            />
                            <label htmlFor="cabEsPropio">
                                Caballo de propietario
                            </label>
                        </Box>

                        <Button
                            type="submit"
                            size="sm"
                            colorScheme="teal"
                            disabled={savingCaballo}
                        >
                            {savingCaballo ? "Guardando..." : "Crear caballo"}
                        </Button>

                        {caballos.length > 0 && (
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Caballos registrados: {caballos.length}
                            </Text>
                        )}
                    </form>
                </Box>

                <Box borderTop="1px solid #e2e2e2" my={6}></Box>

                {/*Crear pista*/}
                <Box mb={6}>
                    <Heading size="sm" mb={2}>
                        Crear pista:
                    </Heading>

                    <form onSubmit={handleCrearPista}>
                        <Flex gap={3} flexWrap="wrap" mb={2}>
                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Nombre
                                </Text>
                                <Input
                                    value={pistaNombre}
                                    onChange={(e) => setPistaNombre(e.target.value)}
                                    bg="white"
                                    color="black"
                                    size="sm"
                                />
                            </Box>
                            <Box flex="1 1 200px">
                                <Text fontSize="xs" mb={1}>
                                    Tipo (cubierta, exterior, salto...)
                                </Text>
                                <select
                                    value={pistaTipo}
                                    onChange={(e) => setPistaTipo(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona tipo de pista</option>
                                    <option value="Exterior">Exterior</option>
                                    <option value="Cubierta">Cubierta</option>
                                    <option value="Redonda">Redonda / Círculo</option>
                                    <option value="Salto">Pista de salto</option>
                                    <option value="Doma">Pista de doma</option>
                                    <option value="Caminador">Caminador</option>
                                </select>
                            </Box>
                        </Flex>

                        <Box
                            mb={2}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            fontSize="sm"
                        >
                            <input
                                id="pistaActiva"
                                type="checkbox"
                                checked={pistaActiva}
                                onChange={handlePistaActivaChange}
                            />
                            <label htmlFor="pistaActiva">Pista activa</label>
                        </Box>

                        <Button
                            type="submit"
                            size="sm"
                            colorScheme="teal"
                            disabled={savingPista}
                        >
                            {savingPista ? "Guardando..." : "Crear pista"}
                        </Button>

                        {pistas.length > 0 && (
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Pistas registradas: {pistas.length}
                            </Text>
                        )}
                    </form>
                </Box>
                
                {/*Activar/Desactivar pistas*/}
                {pistas.length > 0 && (
                    <Box mt={4}>
                        <Heading size="xs" mb={2}>
                            Activar/Desactivar pistas
                        </Heading>

                        <Box as="table" width="100%" borderCollapse="collapse" fontSize="sm">
                            <Box as="thead" bg="gray.100">
                                <Box as="tr">
                                    <Box as="th" textAlign="left" p={2}>Nombre</Box>
                                    <Box as="th" textAlign="left" p={2}>Tipo</Box>
                                    <Box as="th" textAlign="left" p={2}>Estado</Box>
                                    <Box as="th" textAlign="left" p={2}>Acción</Box>
                                </Box>
                            </Box>

                            <Box as="tbody">
                                {pistas.map((p)=> (
                                    <Box
                                        as="tr"
                                        key={p.id}
                                        _odd={{ bg: "gray.50" }}
                                        _even={{ bg: "white" }}
                                    >
                                        <Box as="td" p={2}>{p.nombre}</Box>
                                        <Box as="td" p={2}>{p.tipo}</Box>
                                        <Box as="td" p={2}>
                                            <Text fontSize="sm" color={p.activa ? "green.600" : "red.600"}>
                                                {p.activa ? "Activa" : "Inactiva"}
                                            </Text>
                                        </Box>
                                        <Box as="td" p={2}>
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme={p.activa ? "red" : "green"}
                                                onClick={() => handleTogglePista(p)}
                                            >
                                                {p.activa ? "Desactivar" : "Activar"}
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                )}

                <Box borderTop="1px solid #e2e2e2" my={6}></Box>

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
                                    Profesor
                                </Text>
                                <select
                                    value={claseProfesorId}
                                    onChange={(e) => setClaseProfesorId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.35rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "1px solid #E2E8F0",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Selecciona profesor</option>
                                    {profesores.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} {p.apellidos}
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
                                    Plazas máximas
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

                        <Button
                            type="submit"
                            size="sm"
                            colorScheme="teal"
                            disabled={savingClase}
                        >
                            {savingClase ? "Guardando..." : "Crear clase"}
                        </Button>
                    </form>
                </Box>

                <Box borderTop="1px solid #e2e2e2" my={6}></Box>

                {/*Listado de clases programadas*/}
                <Box>
                    <Heading size="sm" mb={2}>
                        Clases programadas
                    </Heading>
                    <Text fontSize="xs" color="gray.500" mb={3}>
                        Listado de las clases próximas creadas.
                    </Text>

                    {clases.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                            De momento no hay clases futuras.
                        </Text>
                    ) : (
                        <Box
                            as="table"
                            width="100%"
                            borderCollapse="collapse"
                            fontSize="sm"
                        >
                            <Box as="thead" bg="gray.100">
                                <Box as="tr">
                                    <Box as="th" textAlign="left" p={2}>
                                        Fecha
                                    </Box>
                                    <Box as="th" textAlign="left" p={2}>
                                        Título
                                    </Box>
                                    <Box as="th" textAlign="left" p={2}>
                                        Disciplina
                                    </Box>
                                    <Box as="th" textAlign="left" p={2}>
                                        Nivel
                                    </Box>
                                    <Box as="th" textAlign="left" p={2}>
                                        Profesor
                                    </Box>
                                    <Box as="th" textAlign="left" p={2}>
                                        Plazas máx.
                                    </Box>
                                </Box>
                            </Box>

                            <Box as="tbody">
                                {clases.map((clase) => (
                                    <Box
                                        as="tr"
                                        key={clase.id}
                                        _odd={{ bg: "gray.50" }}
                                        _even={{ bg: "white" }}
                                    >
                                        <Box as="td" p={2}>
                                            {formatFecha(clase.fecha)}
                                        </Box>
                                        <Box as="td" p={2}>
                                            {clase.titulo}
                                        </Box>
                                        <Box as="td" p={2}>
                                            {clase.disciplina?.nombre ?? "-"}
                                        </Box>
                                        <Box as="td" p={2}>
                                            {clase.nivel?.nombre ?? "-"}
                                        </Box>
                                        <Box as="td" p={2}>
                                            {clase.profesor
                                                ? `${clase.profesor.nombre} ${clase.profesor.apellidos}`
                                                : "-"}
                                        </Box>
                                        <Box as="td" p={2}>
                                            {clase.plazasMaximas}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Flex>
    );
}
