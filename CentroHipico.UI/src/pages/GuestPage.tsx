import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface GuestPageProps {
    onLogout: () => void;
}

export default function GuestPage({ onLogout }: GuestPageProps) {
    const navigate = useNavigate();

    const handleCambiarUsuario = () => {
        onLogout();
        localStorage.removeItem("userEmail");
        navigate("/login", { replace: true });
    };

    return (
        <Flex minH="100vh" bg="gray.900" align="center" justify="center" px={4}>
            <Box bg="white" borderRadius="2xl" p={8} maxW="4xl" w="100%" boxShadow="xl">
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md">INVITADO</Heading>
                    <Button size="sm" variant="outline" onClick={handleCambiarUsuario}>
                        Volver al login
                    </Button>
                </Flex>

                <Text mb={4} color="gray.600">
                    Como invitado puedes ver un resumen general del centro: niveles disponibles,
                    tipos de disciplinas y horarios orientativos. Para ver qué clase hay a cada hora
                    y poder reservar, regístrate como jinete o contacta con el centro.
                </Text>

                <Box borderWidth="1px" borderRadius="lg" p={4} mb={3}>
                    <Heading size="sm" mb={2}>
                        Niveles disponibles
                    </Heading>
                    <Text fontSize="sm" whiteSpace="pre-line" color="gray.700">
                        • Iniciación
                        {"\n"}• Intermedio
                        {"\n"}• Perfeccionamiento
                    </Text>
                </Box>

                <Box borderWidth="1px" borderRadius="lg" p={4} mb={3}>
                    <Heading size="sm" mb={2}>
                        Disciplinas habituales
                    </Heading>
                    <Text fontSize="sm" whiteSpace="pre-line" color="gray.700">
                        • Volteo
                        {"\n"}• Doma
                        {"\n"}• Salto
                        {"\n"}• Algunos domingos: Ruta / paseo
                    </Text>
                </Box>

                <Box borderWidth="1px" borderRadius="lg" p={4} mb={3}>
                    <Heading size="sm" mb={2}>
                        Horarios orientativos
                    </Heading>
                    <Text fontSize="sm" whiteSpace="pre-line" color="gray.700">
                        • Entre semana: de 15:30 a 18:30 (normalmente terminamos sobre 19:30)
                        {"\n"}• Fines de semana: de 10:00 a 14:00 (normalmente terminamos sobre 15:00)
                    </Text>
                </Box>

                <Box borderWidth="1px" borderRadius="lg" p={4}>
                    <Heading size="sm" mb={2}>
                        Reservas y contacto
                    </Heading>

                    <Text fontSize="sm" color="gray.600" mb={2}>
                        Si quieres ver el detalle de las clases por hora o reservar pista/clase:
                    </Text>

                    <Text fontSize="sm" whiteSpace="pre-line" color="gray.700">
                        • Regístrate como jinete desde la aplicación
                        {"\n"}• O llámanos al: <b>+34 812 345 678</b>
                    </Text>
                </Box>
            </Box>
        </Flex>
    );
}