import { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import type { Jinete, ClaseHipicaDto, PistaDto } from "../api";
import {
    getJinetes,
    getClases,
    crearReservaClase,
    getPistas,
    crearReservaPista,
} from "../api";

interface Props {
    onLogout: () => void;
}

export default function JineteDashboard({ onLogout }: Props) {
    const [jinete, setJinete] = useState<Jinete | null>(null);
    const [clases, setClases] = useState<ClaseHipicaDto[]>([]);
    const [pistas, setPistas] = useState<PistaDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingReservaId, setLoadingReservaId] = useState<number | null>(null);
    const [loadingPista, setLoadingPista] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const [clasesReservadasIds, setClasesReservadasIds] = useState<number[]>([]);

    const [pistaId, setPistaId] = useState("");
    const [fechaPista, setFechaPista] = useState("");
    const [caballoId, setCaballoId] = useState("");

    useEffect(() => {
        async function cargar() {
            try {
                setErrorMsg(null);
                setInfoMsg(null);
                setLoading(true);

                const email = localStorage.getItem("userEmail");
                if (!email) {
                    throw new Error("No hay usuario autenticado en este navegador.");
                }

                const todosJinetes = await getJinetes();
                const j = todosJinetes.find(
                    (x) => x.email.toLowerCase() === email.toLowerCase()
                );

                if (!j) {
                    throw new Error(
                        "No se ha encontrado el jinete asociado a este email en la base de datos."
                    );
                }

                setJinete(j);
                const clasesApi = await getClases();
                clasesApi.sort(
                    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                );
                setClases(clasesApi);

                const pistasApi = await getPistas();
                setPistas(pistasApi);

            } catch (err: any) {
                setErrorMsg(err?.message || "Error al cargar datos del jinete.");
            } finally {
                setLoading(false);
            }
        }

        void cargar();
    }, []);

    const handleReservarClase = async (claseId: number) => {
        if (!jinete) return;

        try {
            setErrorMsg(null);
            setInfoMsg(null);
            setLoadingReservaId(claseId);

            await crearReservaClase(jinete.id, claseId);

            setInfoMsg("Reserva realizada correctamente.");

            setClasesReservadasIds((prev) =>
                prev.includes(claseId) ? prev : [...prev, claseId]
            );
        } catch (err: any) {
            const msg = err?.message || "No se pudo realizar la reserva.";
            setErrorMsg(msg);

            if (msg.includes("ya está inscrito")) {
                setClasesReservadasIds((prev) =>
                    prev.includes(claseId) ? prev : [...prev, claseId]
                );
            }
        } finally {
            setLoadingReservaId(null);
        }
    };

    const handleReservarPista = async () => {
        if (!jinete) return;

        try {
            setErrorMsg(null);
            setInfoMsg(null);

            if (!pistaId || !fechaPista || !caballoId) {
                setErrorMsg(
                    "Selecciona pista, fecha/hora e indica el id de tu caballo para poder reservar."
                );
                return;
            }

            setLoadingPista(true);

            const inicio = new Date(fechaPista);
            const fin = new Date(inicio.getTime() + 60 * 60 * 1000);

            await crearReservaPista({
                jineteId: jinete.id,
                caballoId: Number(caballoId),
                pistaId: Number(pistaId),
                inicio: inicio.toISOString(),
                fin: fin.toISOString(),
            });

            setInfoMsg("Reserva de pista realizada correctamente.");
            setPistaId("");
            setFechaPista("");
            setCaballoId("");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo realizar la reserva de pista.");
        } finally {
            setLoadingPista(false);
        }
    };

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
                maxW="5xl"
                w="100%"
                boxShadow="xl"
            >
                {/*Cabecera*/}
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Heading size="md">JINETE</Heading>
                        <Text fontSize="sm" color="gray.600">
                            {jinete
                                ? `Hola, ${jinete.nombre} ${jinete.apellidos}`
                                : "Cargando información del jinete..."}
                        </Text>
                        {jinete && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                {jinete.tieneCaballoPropio
                                    ? "Al ser propietario/a, puedes reservar pista para entrenar por libre (1 hora)."
                                    : "No tienes caballo propio. Para poder montar necesitas reservar alguna clase."}
                            </Text>
                        )}
                    </Box>
                    <Button size="sm" variant="outline" onClick={onLogout}>
                        Cerrar sesión
                    </Button>
                </Flex>

                {/* Mensajes */}
                {loading && (
                    <Text fontSize="sm" color="gray.600">
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

                {jinete?.tieneCaballoPropio && (
                    <Box
                        mb={6}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="gray.200"
                    >
                        <Heading size="sm" mb={3}>
                            Reservar pista para entrenar por libre
                        </Heading>

                        {pistas.length === 0 ? (
                            <Text fontSize="sm" color="gray.500">
                                De momento no hay pistas creadas en el sistema.
                            </Text>
                        ) : (
                            <>
                                <Box mb={3}>
                                    <Text fontSize="xs" mb={1}>
                                        Pista
                                    </Text>
                                    <select
                                        value={pistaId}
                                        onChange={(e) => setPistaId(e.target.value)}
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
                                        {pistas.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} ({p.tipo})
                                            </option>
                                        ))}
                                    </select>
                                </Box>

                                <Box mb={3}>
                                    <Text fontSize="xs" mb={1}>
                                        Fecha y hora
                                    </Text>
                                    <input
                                        type="datetime-local"
                                        value={fechaPista}
                                        onChange={(e) => setFechaPista(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "0.35rem 0.5rem",
                                            borderRadius: "0.375rem",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    />
                                </Box>

                                <Box mb={3}>
                                    <Text fontSize="xs" mb={1}>
                                        Id de tu caballo
                                    </Text>
                                    <input
                                        type="number"
                                        min={1}
                                        value={caballoId}
                                        onChange={(e) => setCaballoId(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "0.35rem 0.5rem",
                                            borderRadius: "0.375rem",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        El caballo debe existir en el sistema para que la reserva sea
                                        válida.
                                    </Text>
                                </Box>

                                <Button
                                    size="sm"
                                    colorScheme="teal"
                                    disabled={loadingPista}
                                    onClick={handleReservarPista}
                                >
                                    {loadingPista ? "Reservando..." : "Reservar pista"}
                                </Button>
                            </>
                        )}
                    </Box>
                )}

                {/*Clases disponibles*/}
                {!loading && clases.length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                        De momento no hay clases disponibles.
                    </Text>
                )}

                {!loading && clases.length > 0 && (
                    <Box mt={2}>
                        <Heading size="sm" mb={3}>
                            Clases disponibles
                        </Heading>

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
                                    <Box as="th" textAlign="left" p={2}>
                                        Acción
                                    </Box>
                                </Box>
                            </Box>

                            <Box as="tbody">
                                {clases.map((clase) => {
                                    const yaReservada = clasesReservadasIds.includes(clase.id);

                                    return (
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
                                            <Box as="td" p={2}>
                                                {yaReservada ? (
                                                    <Button size="xs" colorScheme="green" disabled>
                                                        Reservada
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="xs"
                                                        colorScheme="teal"
                                                        disabled={
                                                            !jinete || loadingReservaId === clase.id
                                                        }
                                                        onClick={() => handleReservarClase(clase.id)}
                                                    >
                                                        {loadingReservaId === clase.id
                                                            ? "Reservando..."
                                                            : "Reservar"}
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Flex>
    );
}
