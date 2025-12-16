namespace CentroHipico.API.Models
{
    public class ReservaClase
    {
        public int Id { get; set; }

        public int ClaseHipicaId { get; set; }
        public ClaseHipica? ClaseHipica { get; set; }
        public int JineteId { get; set; }
        public Jinete? Jinete { get; set; }

        public DateTime FechaReserva { get; set; } = DateTime.Now;
    }
}
