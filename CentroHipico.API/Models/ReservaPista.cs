namespace CentroHipico.API.Models
{
    public class ReservaPista
    {
        public int Id { get; set; }

        public int JineteId { get; set; }
        public Jinete? Jinete { get; set; }

        public int CaballoId { get; set; }
        public Caballo? Caballo { get; set; }

        public int PistaId { get; set; }
        public Pista? Pista { get; set; }

        public DateTime Inicio { get; set; }
        public DateTime Fin { get; set; }
    }
}
