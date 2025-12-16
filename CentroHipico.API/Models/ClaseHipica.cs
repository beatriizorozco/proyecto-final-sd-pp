using System.Text.Json.Serialization;

namespace CentroHipico.API.Models
{
    public class ClaseHipica
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = "";

        public int DisciplinaId { get; set; }
        public Disciplina? Disciplina { get; set; }

        public int NivelClaseId { get; set; }
        public NivelClase? Nivel { get; set; }

        public DateTime Fecha { get; set; }
        public int DuracionMinutos { get; set; }
        public int PlazasMaximas { get; set; } = 8;
        public int ProfesorId { get; set; }
        public Profesor? Profesor { get; set; }

        public int PistaId { get; set; }
        public Pista? Pista { get; set; }

        [JsonIgnore]
        public ICollection<ReservaClase> Reservas { get; set; } = new List<ReservaClase>();
    }
}
