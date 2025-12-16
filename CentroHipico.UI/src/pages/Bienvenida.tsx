import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    SimpleGrid,
    Spinner,
    Text,
} from "@chakra-ui/react";

import type { Caballo } from "../api";
import { getCaballos } from "../api";

export default function Bienvenida() {
    const navigate = useNavigate();

    const [caballos, setCaballos] = useState<Caballo[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        async function cargar() {
            try {
                setLoading(true);
                setErrorMsg(null);

                const data = await getCaballos();
                data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                setCaballos(data);
            } catch (err: any) {
                setErrorMsg(err?.message || "No se pudieron cargar los caballos.");
            } finally {
                setLoading(false);
            }
        }

        void cargar();
    }, []);

    const caballosEscuela = useMemo(
        () => caballos.filter((c) => !c.esPropio),
        [caballos]
    );

    const caballosPropietario = useMemo(
        () => caballos.filter((c) => c.esPropio),
        [caballos]
    );

    const CardCaballo = ({ c }: { c: Caballo }) => (
        <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            p={4}
            bg="white"
            boxShadow="sm"
            _hover={{ boxShadow: "md" }}
        >
            <Flex justify="space-between" align="start" gap={3}>
                <Box>
                    <Heading size="sm" mb={1}>
                        {c.nombre}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                        Edad: {c.edad} años
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        Nivel / uso: {c.nivel}
                    </Text>
                </Box>

                {c.esPropio && (
                    <Badge colorScheme="purple" variant="subtle">
                        Caballo de propietario
                    </Badge>
                )}
            </Flex>

            <Box
                mt={3}
                borderRadius="lg"
                height="200px"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                position="relative"
                bg="gray.50"
            >
                <img
                    src={`/src/assets/caballos/${c.nombre.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}.jpeg`}
                    alt={c.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/src/assets/leyenda.jpeg";
                    }}
                />

                <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={c.sexo === "M" ? "blue" : "pink"}
                    variant="solid"
                    fontSize="xs"
                    borderRadius="md"
                    px={2}
                    py={1}
                >
                    {c.sexo === "M" ? "♂ Caballo" : "♀ Yegua"}
                </Badge>
            </Box>


        </Box>
    );


    return (
        <Box minH="100vh" bg="gray.900" py={10} px={4}>
            <Box maxW="6xl" mx="auto">
                {/* Hero */}
                <Box
                    bg="white"
                    borderRadius="2xl"
                    p={{ base: 6, md: 8 }}
                    boxShadow="xl"
                    mb={6}
                >
                    <Flex
                        justify="space-between"
                        align={{ base: "stretch", md: "center" }}
                        direction={{ base: "column", md: "row" }}
                        gap={4}
                    >
                        <Box>
                            <Heading size="lg">Centro Hípico</Heading>
                            <Text color="gray.600" mt={2}>
                                ¡Bienvenido/a a nuestro Centro Hípico! Desde aquí puedes gestionar
                                tus reservas, clases y mucho más.
                            </Text>
                        </Box>

                        <Button
                            colorScheme="teal"
                            onClick={() => navigate("/login")}
                            alignSelf={{ base: "flex-start", md: "center" }}
                        >
                            Iniciar Sesión/Registrarse
                        </Button>
                    </Flex>
                </Box>

                {/* Caballos */}
                <Box bg="white" borderRadius="2xl" p={{ base: 6, md: 8 }} boxShadow="xl">
                    <Heading size="md" mb={2}>
                        Echa un vistazo a nuestros caballos:
                    </Heading>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                        {/*Espacio para un poco de separación*/}
                    </Text>

                    {loading && (
                        <Flex align="center" gap={3} color="gray.600">
                            <Spinner />
                            <Text fontSize="sm">Cargando caballos...</Text>
                        </Flex>
                    )}

                    {errorMsg && (
                        <Text fontSize="sm" color="red.500" mb={3}>
                            {errorMsg}
                        </Text>
                    )}

                    {!loading && !errorMsg && caballos.length === 0 && (
                        <Text fontSize="sm" color="gray.500">
                            No hay caballos registrados todavía.
                        </Text>
                    )}

                    {!loading && !errorMsg && caballos.length > 0 && (
                        <>
                            <Box mb={8}>
                                <Heading size="sm" mb={3}>
                                    Caballos de escuela
                                </Heading>
                                {caballosEscuela.length === 0 ? (
                                    <Text fontSize="sm" color="gray.500">
                                        No hay caballos de escuela.
                                    </Text>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                                        {caballosEscuela.map((c) => (
                                            <CardCaballo key={c.id} c={c} />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>

                            <Box>
                                <Heading size="sm" mb={3}>
                                    Caballos de propietario
                                </Heading>
                                {caballosPropietario.length === 0 ? (
                                    <Text fontSize="sm" color="gray.500">
                                        No hay caballos de propietario.
                                    </Text>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                                        {caballosPropietario.map((c) => (
                                            <CardCaballo key={c.id} c={c} />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
