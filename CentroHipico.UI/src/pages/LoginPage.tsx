import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import type { UserRole } from "../types";
import { crearJinete, getJinetes, getProfesores } from "../api";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
    onLogin: (role: UserRole) => void;
}

//Almaceno las contraseñas de forma local en el navegador
const PASSWORD_KEY = "centrohipico_passwords";

interface StoredPasswords {
    [emailLower: string]: { password: string; role: UserRole };
}

function loadPasswords(): StoredPasswords {
    const raw = localStorage.getItem(PASSWORD_KEY);
    if (!raw) return {};
    try {
        return JSON.parse(raw) as StoredPasswords;
    } catch {
        return {};
    }
}

function savePasswords(data: StoredPasswords) {
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(data));
}

type Mode = "login" | "registro";

export default function LoginPage({ onLogin }: LoginPageProps) {
    const navigate = useNavigate();

    const [mode, setMode] = useState<Mode>("login");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [regNombre, setRegNombre] = useState("");
    const [regApellidos, setRegApellidos] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regTieneCaballo, setRegTieneCaballo] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const clearMessages = () => {
        setErrorMsg(null);
        setInfoMsg(null);
    };

    const handleLoginSubmit = async (event: FormEvent) => {
        event.preventDefault();
        clearMessages();

        if (!loginEmail.trim() || !loginPassword.trim()) {
            setErrorMsg("Introduce email y contraseña.");
            return;
        }

        setLoading(true);

        try {
            const emailLower = loginEmail.toLowerCase();
            const passwords = loadPasswords();

            //Administrador
            if (
                emailLower === "admin@centrohipico.com" &&
                loginPassword === "Admin123"
            ) {
                localStorage.setItem("userRole", "admin");
                localStorage.setItem("userEmail", loginEmail);
                onLogin("admin");
                setInfoMsg("Sesión iniciada como administrador.");
                navigate("/admin", { replace: true });
                return;
            }

            //Jinetes
            const jinetes = await getJinetes();
            const jinete = jinetes.find((j) => j.email.toLowerCase() === emailLower);

            if (jinete) {
                const stored = passwords[emailLower];
                if (!stored || stored.password !== loginPassword) {
                    throw new Error("Contraseña incorrecta.");
                }

                localStorage.setItem("userRole", "jinete");
                localStorage.setItem("userEmail", jinete.email);
                onLogin("jinete");
                setInfoMsg("Sesión iniciada como jinete.");
                navigate("/jinete", { replace: true });
                return;
            }

            //Profesores
            const profes = await getProfesores();
            const profe = profes.find((p) => p.email.toLowerCase() === emailLower);

            if (profe) {
                 //Pongo una contresñea fija para los profes aunque se que debería añadir un apartado de cambiar contraseña si se usara en producción
                if (loginPassword !== "Profe123") {
                    throw new Error(
                        "Contraseña incorrecta."
                    );
                }

                localStorage.setItem("userRole", "profesor");
                localStorage.setItem("userEmail", profe.email);
                onLogin("profesor");
                setInfoMsg("Sesión iniciada como profesor.");
                navigate("/profesor", { replace: true });
                return;
            }
            
            throw new Error("No se ha encontrado ningún usuario con ese email.");
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (event: FormEvent) => {
        event.preventDefault();
        clearMessages();

        if (!regNombre || !regApellidos || !regEmail || !regPassword) {
            setErrorMsg("Rellena todos los campos del registro.");
            return;
        }

        setLoading(true);

        try {
            const nuevo = await crearJinete(
                regNombre,
                regApellidos,
                regEmail,
                regTieneCaballo
            );

            // Guardo la contraseña localmente
            const passwords = loadPasswords();
            passwords[regEmail.toLowerCase()] = {
                password: regPassword,
                role: "jinete",
            };
            savePasswords(passwords);

            localStorage.setItem("userRole", "jinete");
            localStorage.setItem("userEmail", nuevo.email);
            onLogin("jinete");

            setInfoMsg("Jinete registrado correctamente. Sesión iniciada.");
            navigate("/jinete", { replace: true });

            setRegNombre("");
            setRegApellidos("");
            setRegEmail("");
            setRegPassword("");
            setRegTieneCaballo(false);
        } catch (err: any) {
            setErrorMsg(err?.message || "No se pudo registrar el jinete.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        clearMessages();
        localStorage.setItem("userRole", "invitado");
        localStorage.setItem("userEmail", "invitado@centrohipico.com");
        onLogin("invitado");
        navigate("/guest", { replace: true });
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRegTieneCaballo(e.target.checked);
    };

    return (
        <Flex minH="100vh" bg="gray.900" align="center" justify="center" px={4}>
            <Box
                bg="white"
                borderRadius="2xl"
                p={8}
                maxW="md"
                w="100%"
                boxShadow="xl"
                position="relative"
            >
                <Button
                    size="sm"
                    variant="ghost"
                    position="absolute"
                    top={2}
                    left={2}
                    onClick={() => navigate("/")}
                >
                    ← Volver
                </Button>

                <Heading size="lg" mb={2} textAlign="center">
                    Centro Hípico
                </Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
                    Inicia sesión o regístrate como jinete y gestiona tus clases y
                    reservas.
                </Text>

                <Box display="flex" gap={2} mb={4}>
                    <Button
                        flex="1"
                        colorScheme={mode === "login" ? "teal" : "gray"}
                        variant={mode === "login" ? "solid" : "outline"}
                        onClick={() => {
                            setMode("login");
                            clearMessages();
                        }}
                    >
                        Iniciar sesión
                    </Button>
                    <Button
                        flex="1"
                        colorScheme={mode === "registro" ? "teal" : "gray"}
                        variant={mode === "registro" ? "solid" : "outline"}
                        onClick={() => {
                            setMode("registro");
                            clearMessages();
                        }}
                    >
                        Registro jinete
                    </Button>
                </Box>

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

                {/*Form de LogIn*/}
                {mode === "login" && (
                    <form onSubmit={handleLoginSubmit}>
                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="loginEmail"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Email
                                </label>
                            </Box>
                            <Input
                                id="loginEmail"
                                type="email"
                                placeholder="tu.email@ejemplo.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                bg="white"
                                color="black"
                                _placeholder={{ color: "gray.400" }}
                            />
                        </Box>

                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="loginPassword"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Contraseña
                                </label>
                            </Box>
                            <Input
                                id="loginPassword"
                                type="password"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                bg="white"
                                color="black"
                                _placeholder={{ color: "gray.400" }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            width="100%"
                            colorScheme="teal"
                            mb={3}
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>

                        <Button
                            variant="outline"
                            width="100%"
                            size="sm"
                            onClick={handleGuest}
                        >
                            Entrar como invitado
                        </Button>
                    </form>
                )}

                {/*Form para registro de jinetes*/}
                {mode === "registro" && (
                    <form onSubmit={handleRegisterSubmit}>
                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="regNombre"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Nombre
                                </label>
                            </Box>
                            <Input
                                id="regNombre"
                                value={regNombre}
                                onChange={(e) => setRegNombre(e.target.value)}
                                bg="white"
                                color="black"
                            />
                        </Box>

                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="regApellidos"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Apellidos
                                </label>
                            </Box>
                            <Input
                                id="regApellidos"
                                value={regApellidos}
                                onChange={(e) => setRegApellidos(e.target.value)}
                                bg="white"
                                color="black"
                            />
                        </Box>

                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="regEmail"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Email
                                </label>
                            </Box>
                            <Input
                                id="regEmail"
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                bg="white"
                                color="black"
                            />
                        </Box>

                        <Box mb={3}>
                            <Box mb={1}>
                                <label
                                    htmlFor="regPassword"
                                    style={{ fontSize: "0.875rem", display: "block" }}
                                >
                                    Contraseña
                                </label>
                            </Box>
                            <Input
                                id="regPassword"
                                type="password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                bg="white"
                                color="black"
                            />
                        </Box>

                        <Box
                            mb={3}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            fontSize="sm"
                        >
                            <input
                                id="regTieneCaballo"
                                type="checkbox"
                                checked={regTieneCaballo}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="regTieneCaballo">Tengo caballo propio</label>
                        </Box>

                        <Button
                            type="submit"
                            width="100%"
                            colorScheme="teal"
                            disabled={loading}
                        >
                            {loading ? "Registrando..." : "Registrar jinete"}
                        </Button>
                    </form>
                )}
            </Box>
        </Flex>
    );
}
