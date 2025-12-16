namespace CentroHipico.API.Models
{
    public class Jinete
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public int RolId { get; set; }
        public Rol? Rol { get; set; }

        public bool TieneCaballoPropio { get; set; } = false;
    }
}
